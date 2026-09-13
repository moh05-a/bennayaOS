using System.ComponentModel.DataAnnotations;

namespace BennayaOS.Api.DTOs.Suppliers;

public class CreateSupplierRequest
{
    [Required(ErrorMessage = "Supplier name is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Enter a valid phone number.")]
    [StringLength(30)]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(256)]
    public string? Email { get; set; }
}
