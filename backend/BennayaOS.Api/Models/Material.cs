using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.Models;

/// <summary>
/// Material planning for a project: what is needed, what was bought, what was
/// used. Deliberately NOT a warehouse system - no batches, locations or stock
/// movements until contractors ask for them.
/// </summary>
public class Material : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string Name { get; set; }

    public MaterialUnit Unit { get; set; } = MaterialUnit.Piece;

    // Quantities are decimal, not int: 2.5 tons of steel and 12.75 m3 of
    // concrete are ordinary. numeric(18,3) via the global convention.
    public decimal RequiredQuantity { get; set; }

    public decimal PurchasedQuantity { get; set; }

    public decimal UsedQuantity { get; set; }

    /// <summary>
    /// Cost per unit, not a lump sum.
    ///
    /// A contractor knows "cement is 4.500 per bag"; the total is arithmetic.
    /// Storing only a total would silently become wrong the moment the required
    /// quantity changes, with nothing to signal it.
    /// </summary>
    public decimal EstimatedUnitCost { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid CompanyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
