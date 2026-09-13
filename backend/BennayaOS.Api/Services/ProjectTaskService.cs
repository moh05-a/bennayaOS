using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Tasks;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using BennayaOS.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public interface IProjectTaskService
{
    Task<ProjectTaskListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken);
    Task<ProjectTaskDto> CreateAsync(Guid projectId, CreateProjectTaskRequest request, CancellationToken cancellationToken);
    Task<ProjectTaskDto> UpdateAsync(Guid id, UpdateProjectTaskRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}

public class ProjectTaskService : IProjectTaskService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ProjectTaskService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ProjectTaskListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var query = _db.ProjectTasks.AsNoTracking().Where(t => t.ProjectId == projectId);

        var items = await query
            // Unfinished work first, then by due date. A contractor opening this
            // tab wants "what is left", not a chronological archive.
            .OrderBy(t => t.Status == ProjectTaskStatus.Completed)
            // NULL due dates sort last: dated work is more urgent than undated.
            .ThenBy(t => t.DueDate == null)
            .ThenBy(t => t.DueDate)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => new ProjectTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                Status = t.Status,
                CompletedAt = t.CompletedAt,
                ProjectId = t.ProjectId,
                CreatedAt = t.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        // "Today" is the SERVER's date. Deriving overdue on the client would
        // make a phone in a different timezone disagree with the dashboard.
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return new ProjectTaskListDto
        {
            Items = items,
            TodoCount = items.Count(t => t.Status == ProjectTaskStatus.Todo),
            InProgressCount = items.Count(t => t.Status == ProjectTaskStatus.InProgress),
            CompletedCount = items.Count(t => t.Status == ProjectTaskStatus.Completed),
            OverdueCount = items.Count(t =>
                t.Status != ProjectTaskStatus.Completed
                && t.DueDate != null
                && t.DueDate < today),
        };
    }

    public async Task<ProjectTaskDto> CreateAsync(Guid projectId, CreateProjectTaskRequest request, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var task = new ProjectTask
        {
            Title = request.Title.Trim(),
            Description = Normalize(request.Description),
            DueDate = request.DueDate,
            Status = request.Status,
            // A task created as already Completed still gets a timestamp.
            CompletedAt = request.Status == ProjectTaskStatus.Completed
                ? DateTimeOffset.UtcNow
                : null,
            ProjectId = projectId,
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.ProjectTasks.Add(task);
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(task);
    }

    public async Task<ProjectTaskDto> UpdateAsync(Guid id, UpdateProjectTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _db.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new NotFoundException("Task not found.");

        var wasCompleted = task.Status == ProjectTaskStatus.Completed;
        var isNowCompleted = request.Status == ProjectTaskStatus.Completed;

        task.Title = request.Title.Trim();
        task.Description = Normalize(request.Description);
        task.DueDate = request.DueDate;
        task.Status = request.Status;

        // Only stamp on the transition, so re-saving a completed task does not
        // keep pushing its completion date forward.
        if (!wasCompleted && isNowCompleted)
        {
            task.CompletedAt = DateTimeOffset.UtcNow;
        }
        else if (wasCompleted && !isNowCompleted)
        {
            // Reopened: the old completion date is no longer true.
            task.CompletedAt = null;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(task);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var task = await _db.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new NotFoundException("Task not found.");

        _db.ProjectTasks.Remove(task);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureProjectExistsAsync(Guid projectId, CancellationToken cancellationToken)
    {
        if (!await _db.Projects.AnyAsync(p => p.Id == projectId, cancellationToken))
        {
            throw new NotFoundException("Project not found.");
        }
    }

    private static ProjectTaskDto ToDto(ProjectTask t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        DueDate = t.DueDate,
        Status = t.Status,
        CompletedAt = t.CompletedAt,
        ProjectId = t.ProjectId,
        CreatedAt = t.CreatedAt,
    };

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
