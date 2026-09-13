using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Projects;

/// <summary>Row shape for the projects list.</summary>
public class ProjectDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Location { get; init; }
    public required decimal ContractValue { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? ExpectedEndDate { get; init; }

    /// <summary>Serialized as text ("Active"), matching the enum names.</summary>
    public required ProjectStatus Status { get; init; }

    public required Guid ClientId { get; init; }
    public required string ClientName { get; init; }

    /// <summary>
    /// Money figures on the list row as well, so a contractor can scan the
    /// health of every job without opening each one. These are SQL subqueries
    /// over indexed columns, not extra round trips.
    /// </summary>
    public required decimal TotalExpenses { get; init; }
    public required decimal TotalReceived { get; init; }
    public required decimal OutstandingBalance { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
