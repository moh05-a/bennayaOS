namespace BennayaOS.Api.DTOs.Dashboard;

/// <summary>
/// The whole business at a glance.
///
/// Every figure is aggregated by PostgreSQL. Fetching all projects and summing
/// them in the browser would produce identical numbers today and quietly become
/// "the total of whatever happened to be loaded" later.
///
/// Cancelled projects are EXCLUDED from the money totals: a cancelled job's
/// outstanding balance is not money anyone expects to collect, and including it
/// would overstate what the contractor is owed. They still appear in the status
/// breakdown so nothing disappears silently.
/// </summary>
public class DashboardDto
{
    public required int ActiveProjects { get; init; }
    public required int TotalProjects { get; init; }

    /// <summary>Sum of contract values, excluding cancelled projects.</summary>
    public required decimal TotalContractValue { get; init; }

    public required decimal TotalReceived { get; init; }
    public required decimal TotalExpenses { get; init; }

    /// <summary>TotalContractValue - TotalReceived: money still owed by clients.</summary>
    public required decimal TotalOutstanding { get; init; }

    /// <summary>TotalReceived - TotalExpenses: real cash across the business. Not profit.</summary>
    public required decimal NetCashPosition { get; init; }

    /// <summary>How many projects have spent more than their contract value.</summary>
    public required int ProjectsOverBudget { get; init; }

    public required IReadOnlyList<StatusCountDto> ProjectsByStatus { get; init; }
    public required IReadOnlyList<RecentExpenseDto> RecentExpenses { get; init; }
    public required IReadOnlyList<RecentPaymentDto> RecentPayments { get; init; }
}

public class StatusCountDto
{
    public required string Status { get; init; }
    public required int Count { get; init; }
}

public class RecentExpenseDto
{
    public required Guid Id { get; init; }
    public required decimal Amount { get; init; }
    public required string Category { get; init; }
    public required DateOnly Date { get; init; }
    public string? Description { get; init; }
    public required Guid ProjectId { get; init; }
    public required string ProjectName { get; init; }
}

public class RecentPaymentDto
{
    public required Guid Id { get; init; }
    public required decimal Amount { get; init; }
    public required DateOnly Date { get; init; }
    public string? Description { get; init; }
    public required Guid ProjectId { get; init; }
    public required string ProjectName { get; init; }
}
