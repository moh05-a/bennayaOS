using System.Linq.Expressions;
using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Materials;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public interface IMaterialService
{
    Task<MaterialListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken);
    Task<MaterialDto> CreateAsync(Guid projectId, CreateMaterialRequest request, CancellationToken cancellationToken);
    Task<MaterialDto> UpdateAsync(Guid id, UpdateMaterialRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}

public class MaterialService : IMaterialService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public MaterialService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Every derived quantity is computed HERE, in one expression, so the
    /// frontend never re-implements the arithmetic and the two cannot disagree.
    /// Stored as an Expression so EF pushes it into SQL.
    /// </summary>
    private static readonly Expression<Func<Material, MaterialDto>> ToDto =
        m => new MaterialDto
        {
            Id = m.Id,
            Name = m.Name,
            Unit = m.Unit,
            RequiredQuantity = m.RequiredQuantity,
            PurchasedQuantity = m.PurchasedQuantity,
            UsedQuantity = m.UsedQuantity,
            AvailableQuantity = m.PurchasedQuantity - m.UsedQuantity,
            RemainingToPurchase = m.RequiredQuantity - m.PurchasedQuantity,
            EstimatedUnitCost = m.EstimatedUnitCost,
            EstimatedTotalCost = m.EstimatedUnitCost * m.RequiredQuantity,
            PurchasedCost = m.EstimatedUnitCost * m.PurchasedQuantity,
            IsOverSupplied = m.PurchasedQuantity > m.RequiredQuantity,
            IsOverUsed = m.UsedQuantity > m.PurchasedQuantity,
            ProjectId = m.ProjectId,
            CreatedAt = m.CreatedAt,
        };

    public async Task<MaterialListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var query = _db.Materials.AsNoTracking().Where(m => m.ProjectId == projectId);

        var items = await query
            .OrderBy(m => m.Name)
            .Select(ToDto)
            .ToListAsync(cancellationToken);

        var totalEstimatedCost = await query
            .SumAsync(m => (decimal?)(m.EstimatedUnitCost * m.RequiredQuantity), cancellationToken) ?? 0m;

        var totalPurchasedCost = await query
            .SumAsync(m => (decimal?)(m.EstimatedUnitCost * m.PurchasedQuantity), cancellationToken) ?? 0m;

        var itemsNeedingPurchase = await query
            .CountAsync(m => m.RequiredQuantity > m.PurchasedQuantity, cancellationToken);

        return new MaterialListDto
        {
            Items = items,
            TotalEstimatedCost = totalEstimatedCost,
            TotalPurchasedCost = totalPurchasedCost,
            ItemsNeedingPurchase = itemsNeedingPurchase,
        };
    }

    public async Task<MaterialDto> CreateAsync(Guid projectId, CreateMaterialRequest request, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var material = new Material
        {
            Name = request.Name.Trim(),
            Unit = request.Unit,
            RequiredQuantity = request.RequiredQuantity,
            PurchasedQuantity = request.PurchasedQuantity,
            UsedQuantity = request.UsedQuantity,
            EstimatedUnitCost = request.EstimatedUnitCost,
            ProjectId = projectId,
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.Materials.Add(material);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(material.Id, cancellationToken);
    }

    public async Task<MaterialDto> UpdateAsync(Guid id, UpdateMaterialRequest request, CancellationToken cancellationToken)
    {
        var material = await _db.Materials.FirstOrDefaultAsync(m => m.Id == id, cancellationToken)
            ?? throw new NotFoundException("Material not found.");

        material.Name = request.Name.Trim();
        material.Unit = request.Unit;
        material.RequiredQuantity = request.RequiredQuantity;
        material.PurchasedQuantity = request.PurchasedQuantity;
        material.UsedQuantity = request.UsedQuantity;
        material.EstimatedUnitCost = request.EstimatedUnitCost;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var material = await _db.Materials.FirstOrDefaultAsync(m => m.Id == id, cancellationToken)
            ?? throw new NotFoundException("Material not found.");

        _db.Materials.Remove(material);
        await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>Re-reads through the projection so derived fields come from one place.</summary>
    private async Task<MaterialDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var material = await _db.Materials
            .AsNoTracking()
            .Where(m => m.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync(cancellationToken);

        return material ?? throw new NotFoundException("Material not found.");
    }

    private async Task EnsureProjectExistsAsync(Guid projectId, CancellationToken cancellationToken)
    {
        if (!await _db.Projects.AnyAsync(p => p.Id == projectId, cancellationToken))
        {
            throw new NotFoundException("Project not found.");
        }
    }
}
