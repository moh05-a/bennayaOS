using System.ComponentModel.DataAnnotations;
using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Projects;

public class UpdateProjectRequest : IValidatableObject
{
    [Required(ErrorMessage = "Project name is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(300)]
    public string? Location { get; set; }

    [Range(0, 999_999_999_999.999, ErrorMessage = "Contract value cannot be negative.")]
    public decimal ContractValue { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? ExpectedEndDate { get; set; }

    [Required(ErrorMessage = "Please choose a client.")]
    public Guid ClientId { get; set; }

    public ProjectStatus Status { get; set; }

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
