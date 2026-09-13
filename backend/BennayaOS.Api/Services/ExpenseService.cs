using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Expenses;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public class ExpenseService : IExpenseService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ExpenseService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ExpenseListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var query = _db.Expenses.AsNoTracking().Where(e => e.ProjectId == projectId);

        var items = await query
            // Newest spending first, then newest entry first for same-day rows.
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                Amount = e.Amount,
                Description = e.Description,
                Category = e.Category,
                Date = e.Date,
                ProjectId = e.ProjectId,
                SupplierId = e.SupplierId,
                // Null-safe: e.Supplier is null whenever SupplierId is null.
                SupplierName = e.Supplier != null ? e.Supplier.Name : null,
                CreatedAt = e.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        // SUM() runs in PostgreSQL over ALL rows. Summing the list above would
        // break the moment we paginate, and decimal addition belongs in the
        // database where precision is guaranteed.
        var total = await query.SumAsync(e => (decimal?)e.Amount, cancellationToken) ?? 0m;

        var byCategory = await query
            .GroupBy(e => e.Category)
            .Select(group => new CategoryTotalDto
            {
                Category = group.Key.ToString(),
                Amount = group.Sum(e => e.Amount),
            })
            .OrderByDescending(c => c.Amount)
            .ToListAsync(cancellationToken);

        return new ExpenseListDto
        {
            Items = items,
            TotalAmount = total,
            TotalsByCategory = byCategory,
        };
    }

    public async Task<ExpenseDto> CreateAsync(Guid projectId, CreateExpenseRequest request, CancellationToken cancellationToken)
    {
        // Confirms the project exists AND belongs to this company, via the
        // global filter. Without this, a contractor could post expenses onto
        // a competitor's project by guessing an id.
        await EnsureProjectExistsAsync(projectId, cancellationToken);
        await EnsureSupplierIsValidAsync(request.SupplierId, cancellationToken);

        var expense = new Expense
        {
            Amount = request.Amount,
            Description = Normalize(request.Description),
            Category = request.Category,
            Date = request.Date,
            ProjectId = projectId,
            SupplierId = request.SupplierId,
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(expense.Id, cancellationToken);
    }

    public async Task<ExpenseDto> UpdateAsync(Guid id, UpdateExpenseRequest request, CancellationToken cancellationToken)
    {
        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken)
            ?? throw new NotFoundException("Expense not found.");

        await EnsureSupplierIsValidAsync(request.SupplierId, cancellationToken);

        expense.Amount = request.Amount;
        expense.Description = Normalize(request.Description);
        expense.Category = request.Category;
        expense.Date = request.Date;
        expense.SupplierId = request.SupplierId;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(expense.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken)
            ?? throw new NotFoundException("Expense not found.");

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureProjectExistsAsync(Guid projectId, CancellationToken cancellationToken)
    {
        var exists = await _db.Projects.AnyAsync(p => p.Id == projectId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException("Project not found.");
        }
    }

    /// <summary>
    /// A null supplier is valid - most labour and equipment expenses have none.
    /// A non-null one must exist within the caller's company, which the global
    /// query filter enforces: another company's supplier id is simply not found.
    /// </summary>
    private async Task EnsureSupplierIsValidAsync(Guid? supplierId, CancellationToken cancellationToken)
    {
        if (supplierId is null)
        {
            return;
        }

        var exists = await _db.Suppliers.AnyAsync(s => s.Id == supplierId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException("The selected supplier was not found.");
        }
    }

    /// <summary>
    /// Re-reads through the database so SupplierName is populated by a JOIN,
    /// rather than us guessing it in memory after a write.
    /// </summary>
    private async Task<ExpenseDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var expense = await _db.Expenses
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                Amount = e.Amount,
                Description = e.Description,
                Category = e.Category,
                Date = e.Date,
                ProjectId = e.ProjectId,
                SupplierId = e.SupplierId,
                SupplierName = e.Supplier != null ? e.Supplier.Name : null,
                CreatedAt = e.CreatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        return expense ?? throw new NotFoundException("Expense not found.");
    }

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
