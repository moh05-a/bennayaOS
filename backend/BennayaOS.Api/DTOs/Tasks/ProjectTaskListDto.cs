namespace BennayaOS.Api.DTOs.Tasks;

public class ProjectTaskListDto
{
    public required IReadOnlyList<ProjectTaskDto> Items { get; init; }
    public required int TodoCount { get; init; }
    public required int InProgressCount { get; init; }
    public required int CompletedCount { get; init; }

    /// <summary>
    /// Past their due date and not finished. Computed on the SERVER against the
    /// server's date, so every device agrees on what counts as overdue.
    /// </summary>
    public required int OverdueCount { get; init; }
}
