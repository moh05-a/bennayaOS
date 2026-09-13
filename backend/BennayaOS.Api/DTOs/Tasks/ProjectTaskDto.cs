using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Tasks;

public class ProjectTaskDto
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public DateOnly? DueDate { get; init; }
    public required ProjectTaskStatus Status { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
    public required Guid ProjectId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}
