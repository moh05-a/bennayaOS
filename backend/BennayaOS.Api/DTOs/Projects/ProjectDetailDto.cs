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

    /// <summary>SUM of DIRECT expenses only - materials, labour, equipment.
    /// Does NOT include subcontractor payments; see TotalSpent for the whole picture.</summary>
    public required decimal TotalExpenses { get; init; }

    /// <summary>SUM of every subcontract amount agreed on this project.</summary>
    public required decimal TotalSubcontractorCommitted { get; init; }

    /// <summary>SUM actually paid out to subcontractors.</summary>
    public required decimal TotalSubcontractorPaid { get; init; }

    /// <summary>
    /// Committed minus paid: what the contractor still owes subcontractors.
    /// This is a real liability that a cash balance alone would hide.
    /// </summary>
    public required decimal TotalSubcontractorRemaining { get; init; }

    /// <summary>
    /// TotalExpenses + TotalSubcontractorPaid: every currency unit that has
    /// actually left the business on this project.
    ///
    /// This only holds if subcontractor money is recorded as subcontractor
    /// payments and NOT also as Subcontractor-category expenses. Doing both
    /// double-counts it.
    /// </summary>
    public required decimal TotalSpent { get; init; }

    /// <summary>SUM of every client payment received on this project.</summary>
    public required decimal TotalReceived { get; init; }

    /// <summary>
    /// ContractValue - TotalReceived. Goes negative if the client overpaid,
    /// and we do not clamp it: hiding that would misstate the real position.
    /// </summary>
    public required decimal OutstandingBalance { get; init; }

    /// <summary>
    /// ContractValue - TotalSpent: what is left of the contract after every
    /// cost paid so far.
    ///
    /// Still NOT called "profit". It ignores subcontract work agreed but not
    /// yet paid, and it assumes no further costs - neither is usually true
    /// mid-project.
    /// </summary>
    public required decimal RemainingContractValue { get; init; }

    /// <summary>
    /// ContractValue - TotalSpent - TotalSubcontractorRemaining.
    ///
    /// The closest honest margin estimate we can make: it subtracts costs
    /// already paid AND subcontract work still owed. It still excludes future
    /// materials and labour, so it is a ceiling, not a promise.
    /// </summary>
    public required decimal ProjectedMargin { get; init; }

    /// <summary>
    /// TotalReceived - TotalSpent: the actual cash this project has generated
    /// or consumed, including subcontractor payments.
    /// </summary>
    public required decimal NetCashPosition { get; init; }

    /// <summary>Lets the UI warn what a project deletion takes with it.</summary>
    public required int ExpenseCount { get; init; }
    public required int PaymentCount { get; init; }
    public required int SubcontractorCount { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
