using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Projects;

/// <summary>
/// The project details page. TotalExpenses is real as of Phase 6.
/// TotalReceived and the derived balances arrive in Phases 7-8.
/// </summary>
public class ProjectDetailDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Location { get; init; }
    public required decimal ContractValue { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? ExpectedEndDate { get; init; }
    public required ProjectStatus Status { get; init; }

    public required Guid ClientId { get; init; }
    public required string ClientName { get; init; }
    public string? ClientPhone { get; init; }

    /// <summary>SUM of every expense on this project, computed in SQL.</summary>
    public required decimal TotalExpenses { get; init; }

    /// <summary>Lets the UI warn "this also deletes N expenses" before deleting.</summary>
    public required int ExpenseCount { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
