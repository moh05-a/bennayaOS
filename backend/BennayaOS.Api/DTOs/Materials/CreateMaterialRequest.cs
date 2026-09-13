using System.ComponentModel.DataAnnotations;
using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Materials;

public class CreateMaterialRequest : IValidatableObject
{
    [Required(ErrorMessage = "Material name is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please choose a unit.")]
    public MaterialUnit Unit { get; set; }

    [Range(0, 999_999_999.999, ErrorMessage = "Required quantity cannot be negative.")]
    public decimal RequiredQuantity { get; set; }

    [Range(0, 999_999_999.999, ErrorMessage = "Purchased quantity cannot be negative.")]
    public decimal PurchasedQuantity { get; set; }

    [Range(0, 999_999_999.999, ErrorMessage = "Used quantity cannot be negative.")]
    public decimal UsedQuantity { get; set; }

    [Range(0, 999_999_999.999, ErrorMessage = "Unit cost cannot be negative.")]
    public decimal EstimatedUnitCost { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // A warning, not a hard block: material is sometimes taken from stock
        // bought for another job, so used > purchased can be legitimate.
        // We allow it and surface it in the UI instead of refusing the entry.
        yield break;
    }
}
