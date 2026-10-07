using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Dashboard;
using BennayaOS.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetAsync(CancellationToken cancellationToken);
}

public class DashboardService : IDashboardService
{
    private const int RecentItemCount = 5;

    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardDto> GetAsync(CancellationToken cancellationToken)
    {
        // No company filtering anywhere in this method. Every query below is
        // scoped to the caller's company by the global query filter.

        // Money totals deliberately ignore cancelled projects.
        var fundedProjects = _db.Projects
            .AsNoTracking()
            .Where(p => p.Status != ProjectStatus.Cancelled);

        // One grouped query gives us every status count in a single round trip,
        // instead of one COUNT per status.
        var statusCounts = await _db.Projects
            .AsNoTracking()
            .GroupBy(p => p.Status)
            .Select(group => new StatusCountDto
            {
                Status = group.Key.ToString(),
                Count = group.Count(),
            })
            .ToListAsync(cancellationToken);

        var totalProjects = statusCounts.Sum(entry => entry.Count);
        var activeProjects = statusCounts
            .FirstOrDefault(entry => entry.Status == nameof(ProjectStatus.Active))?.Count ?? 0;

        var totalContractValue = await fundedProjects
            .SumAsync(p => (decimal?)p.ContractValue, cancellationToken) ?? 0m;

        // Expenses and payments are filtered THROUGH the project, so a cancelled
        // project's money is excluded consistently on both sides. Filtering the
        // expense table directly would silently include it.
        var totalExpenses = await _db.Expenses
            .AsNoTracking()
            .Where(e => e.Project.Status != ProjectStatus.Cancelled)
            .SumAsync(e => (decimal?)e.Amount, cancellationToken) ?? 0m;

        // Subcontractor payments are money out of the business too. Omitting
        // them would overstate the net cash position across every project.
        var totalSubcontractorPaid = await _db.SubcontractorPayments
            .AsNoTracking()
            .Where(p => p.Subcontractor.Project.Status != ProjectStatus.Cancelled)
            .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;

        var totalReceived = await _db.ClientPayments
            .AsNoTracking()
            .Where(p => p.Project.Status != ProjectStatus.Cancelled)
            .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;

        var projectsOverBudget = await fundedProjects
            .CountAsync(
                p => p.Expenses.Sum(e => (decimal?)e.Amount) > p.ContractValue,
                cancellationToken);

        var recentExpenses = await _db.Expenses
            .AsNoTracking()
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Take(RecentItemCount)
            .Select(e => new RecentExpenseDto
            {
                Id = e.Id,
                Amount = e.Amount,
                Category = e.Category.ToString(),
                Date = e.Date,
                Description = e.Description,
                ProjectId = e.ProjectId,
                ProjectName = e.Project.Name,
            })
            .ToListAsync(cancellationToken);

        var recentPayments = await _db.ClientPayments
            .AsNoTracking()
            .OrderByDescending(p => p.Date)
            .ThenByDescending(p => p.CreatedAt)
            .Take(RecentItemCount)
            .Select(p => new RecentPaymentDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Date = p.Date,
                Description = p.Description,
                ProjectId = p.ProjectId,
                ProjectName = p.Project.Name,
            })
            .ToListAsync(cancellationToken);

        // The server's date decides what is overdue, so every device agrees.
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var unfinishedTasks = _db.ProjectTasks
            .AsNoTracking()
            .Where(t => t.Status != ProjectTaskStatus.Completed
                        && t.Project.Status != ProjectStatus.Cancelled);

        var overdueTaskCount = await unfinishedTasks
            .CountAsync(t => t.DueDate != null && t.DueDate < today, cancellationToken);

        var upcomingTasks = await unfinishedTasks
            // Dated tasks before undated ones, soonest first - so anything
            // overdue naturally floats to the top.
            .OrderBy(t => t.DueDate == null)
            .ThenBy(t => t.DueDate)
            .Take(RecentItemCount)
            .Select(t => new UpcomingTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                Status = t.Status.ToString(),
                IsOverdue = t.DueDate != null && t.DueDate < today,
                ProjectId = t.ProjectId,
                ProjectName = t.Project.Name,
            })
            .ToListAsync(cancellationToken);

        return new DashboardDto
        {
            ActiveProjects = activeProjects,
            TotalProjects = totalProjects,
            TotalContractValue = totalContractValue,
            TotalReceived = totalReceived,
            TotalExpenses = totalExpenses + totalSubcontractorPaid,
            TotalOutstanding = totalContractValue - totalReceived,
            NetCashPosition = totalReceived - totalExpenses - totalSubcontractorPaid,
            ProjectsOverBudget = projectsOverBudget,
            ProjectsByStatus = statusCounts
                .OrderByDescending(entry => entry.Count)
                .ToList(),
            RecentExpenses = recentExpenses,
            RecentPayments = recentPayments,
            UpcomingTasks = upcomingTasks,
            OverdueTaskCount = overdueTaskCount,
        };
    }
}
