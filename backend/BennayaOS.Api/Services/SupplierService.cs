using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Suppliers;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public interface ISupplierService
{
    Task<IReadOnlyList<SupplierDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken);
    Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}

public class SupplierService : ISupplierService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public SupplierService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<SupplierDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _db.Suppliers
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new SupplierDto
            {
                Id = s.Id,
                Name = s.Name,
                Phone = s.Phone,
                Email = s.Email,
                ExpenseCount = s.Expenses.Count(),
                TotalSpent = s.Expenses.Sum(e => (decimal?)e.Amount) ?? 0m,
                CreatedAt = s.CreatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var supplier = await _db.Suppliers
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new SupplierDto
            {
                Id = s.Id,
                Name = s.Name,
                Phone = s.Phone,
                Email = s.Email,
                ExpenseCount = s.Expenses.Count(),
                TotalSpent = s.Expenses.Sum(e => (decimal?)e.Amount) ?? 0m,
                CreatedAt = s.CreatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        return supplier ?? throw new NotFoundException("Supplier not found.");
    }

    public async Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken)
    {
        var supplier = new Supplier
        {
            Name = request.Name.Trim(),
            Phone = Normalize(request.Phone),
            Email = Normalize(request.Email)?.ToLowerInvariant(),
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync(cancellationToken);

        return new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            Phone = supplier.Phone,
            Email = supplier.Email,
            ExpenseCount = 0,
            TotalSpent = 0m,
            CreatedAt = supplier.CreatedAt,
        };
    }

    public async Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken)
    {
        var supplier = await _db.Suppliers.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        supplier.Name = request.Name.Trim();
        supplier.Phone = Normalize(request.Phone);
        supplier.Email = Normalize(request.Email)?.ToLowerInvariant();

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var supplier = await _db.Suppliers.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        // Deleting is allowed even when expenses reference this supplier. The
        // database clears their supplier_id (DeleteBehavior.SetNull), so the
        // spending history survives with its amount, category and date intact.
        // The UI warns how many expenses will lose the link before we get here.
        _db.Suppliers.Remove(supplier);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
