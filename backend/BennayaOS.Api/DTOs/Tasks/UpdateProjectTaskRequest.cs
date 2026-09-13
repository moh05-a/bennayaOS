using System.ComponentModel.DataAnnotations;
using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Tasks;

public class UpdateProjectTaskRequest
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    public DateOnly? DueDate { get; set; }

    public ProjectTaskStatus Status { get; set; }
}
