using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.Models;

/// <summary>
/// A job to be done on a project. Deliberately minimal for the MVP: no
/// assignee, priority, dependencies or notifications until contractors ask.
/// </summary>
public class ProjectTask : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string Title { get; set; }

    public string? Description { get; set; }

    /// <summary>
    /// Optional. Plenty of site tasks are "do this soon" with no fixed date,
    /// and forcing one would make contractors enter meaningless dates.
    /// DateOnly, so a task due 20 March never shows as 19 March.
    /// </summary>
    public DateOnly? DueDate { get; set; }

    public ProjectTaskStatus Status { get; set; } = ProjectTaskStatus.Todo;

    /// <summary>
    /// Set when the task moves to Completed, cleared if it moves back.
    /// Stored so "what got done this week" is answerable later.
    /// </summary>
    public DateTimeOffset? CompletedAt { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid CompanyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
