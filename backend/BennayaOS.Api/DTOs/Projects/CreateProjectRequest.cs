using System.ComponentModel.DataAnnotations;
using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Projects;

/// <summary>
/// IValidatableObject gives us cross-field rules. Attributes can only validate
/// one property at a time, but "end date must be after start date" needs both.
/// </summary>
public class CreateProjectRequest : IValidatableObject
{
    [Required(ErrorMessage = "Project name is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(300)]
    public string? Location { get; set; }

    // Range enforces the business rule in the API. PostgreSQL enforces it again
    // via the check constraint, because application code can be bypassed.
    [Range(0, 999_999_999_999.999, ErrorMessage = "Contract value cannot be negative.")]
    public decimal ContractValue { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? ExpectedEndDate { get; set; }

    [Required(ErrorMessage = "Please choose a client.")]
    public Guid ClientId { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (StartDate.HasValue && ExpectedEndDate.HasValue && ExpectedEndDate < StartDate)
        {
            yield return new ValidationResult(
                "Expected end date cannot be before the start date.",
                [nameof(ExpectedEndDate)]);
        }
    }
}
