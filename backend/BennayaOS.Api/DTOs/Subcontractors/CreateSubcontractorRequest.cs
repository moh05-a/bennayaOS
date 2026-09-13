using System.ComponentModel.DataAnnotations;

namespace BennayaOS.Api.DTOs.Subcontractors;

public class CreateSubcontractorRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Enter a valid phone number.")]
    [StringLength(30)]
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? Specialty { get; set; }

    // Zero is allowed here, unlike a payment: the amount is often agreed after
    // the subcontractor has already started.
    [Range(0, 999_999_999_999.999, ErrorMessage = "Contract amount cannot be negative.")]
    public decimal ContractAmount { get; set; }
}
