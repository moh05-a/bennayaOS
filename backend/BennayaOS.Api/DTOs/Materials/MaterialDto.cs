using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Materials;

public class MaterialDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required MaterialUnit Unit { get; init; }

    public required decimal RequiredQuantity { get; init; }
    public required decimal PurchasedQuantity { get; init; }
    public required decimal UsedQuantity { get; init; }

    /// <summary>
    /// PurchasedQuantity - UsedQuantity: what is physically left on site.
    ///
    /// Can be NEGATIVE, and we do not clamp it. A negative value means more was
    /// used than was bought - either a data-entry error or material pulled from
    /// another project. Silently showing zero would hide a real problem.
    /// </summary>
    public required decimal AvailableQuantity { get; init; }

    /// <summary>
    /// RequiredQuantity - PurchasedQuantity: what still needs buying.
    ///
    /// Negative means oversupply - more was bought than the job needs. Also not
    /// clamped: over-ordering is money tied up in stock and worth seeing.
    /// </summary>
    public required decimal RemainingToPurchase { get; init; }

    public required decimal EstimatedUnitCost { get; init; }

    /// <summary>EstimatedUnitCost x RequiredQuantity: budget for this material.</summary>
    public required decimal EstimatedTotalCost { get; init; }

    /// <summary>EstimatedUnitCost x PurchasedQuantity: what buying it has cost so far.</summary>
    public required decimal PurchasedCost { get; init; }

    /// <summary>True when more was bought than required.</summary>
    public required bool IsOverSupplied { get; init; }

    /// <summary>True when more was used than bought - always worth investigating.</summary>
    public required bool IsOverUsed { get; init; }

    public required Guid ProjectId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}

public class MaterialListDto
{
    public required IReadOnlyList<MaterialDto> Items { get; init; }

    /// <summary>Total budget across every material on the project.</summary>
    public required decimal TotalEstimatedCost { get; init; }

    /// <summary>Estimated value of what has been bought so far.</summary>
    public required decimal TotalPurchasedCost { get; init; }

    /// <summary>How many materials still need buying.</summary>
    public required int ItemsNeedingPurchase { get; init; }
}
