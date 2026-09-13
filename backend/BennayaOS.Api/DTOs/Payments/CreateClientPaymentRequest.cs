using System.ComponentModel.DataAnnotations;

namespace BennayaOS.Api.DTOs.Payments;

public class CreateClientPaymentRequest
{
    [Range(0.001, 999_999_999_999.999, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Date is required.")]
    public DateOnly Date { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }
}
