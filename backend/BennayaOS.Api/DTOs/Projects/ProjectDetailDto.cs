using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Projects;

/// <summary>
/// The project details page, including every financial figure the contractor
/// asks about. All sums are computed in SQL; the derived balances are computed
/// here, on the server, so there is exactly one definition of each formula.
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

    /// <summary>SUM of every expense on this project.</summary>
    public required decimal TotalExpenses { get; init; }

    /// <summary>SUM of every client payment received on this project.</summary>
    public required decimal TotalReceived { get; init; }

    /// <summary>
    /// ContractValue - TotalReceived. Goes negative if the client overpaid,
    /// and we do not clamp it: hiding that would misstate the real position.
    /// </summary>
    public required decimal OutstandingBalance { get; init; }

    /// <summary>
    /// ContractValue - TotalExpenses.
    ///
    /// Deliberately NOT called "profit". Real profit needs committed costs,
    /// subcontractor obligations and unbilled work, none of which we model yet.
    /// Labelling this profit would give contractors a dangerously wrong number.
    /// </summary>
    public required decimal RemainingContractValue { get; init; }

    /// <summary>
    /// TotalReceived - TotalExpenses: the actual cash this project has
    /// generated or consumed so far.
    ///
    /// This is the one honest "health" number we can compute today. It is NOT
    /// profit - it ignores work done but not yet invoiced, and costs committed
    /// but not yet paid - but unlike profit it needs no data we do not have.
    /// </summary>
    public required decimal NetCashPosition { get; init; }

    /// <summary>Lets the UI warn what a project deletion takes with it.</summary>
    public required int ExpenseCount { get; init; }
    public required int PaymentCount { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
