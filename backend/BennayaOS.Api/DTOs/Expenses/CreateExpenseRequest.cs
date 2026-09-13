using System.ComponentModel.DataAnnotations;
using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Expenses;

public class CreateExpenseRequest
{
    /// <summary>
    /// Range starts just above zero. Using Range(0, ...) would allow a zero
    /// expense, which is always a mistake.
    /// </summary>
    [Range(0.001, 999_999_999_999.999, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Please choose a category.")]
    public ExpenseCategory Category { get; set; }

    [Required(ErrorMessage = "Date is required.")]
    public DateOnly Date { get; set; }

    /// <summary>Optional. Verified to belong to the caller's company server-side.</summary>
    public Guid? SupplierId { get; set; }
}
