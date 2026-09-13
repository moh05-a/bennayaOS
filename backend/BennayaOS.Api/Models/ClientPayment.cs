namespace BennayaOS.Api.Models;

/// <summary>
/// Money RECEIVED from the client for a project - the opposite direction to
/// Expense. Kept as separate rows rather than a running balance so the
/// contractor keeps a full history of what was paid and when.
/// </summary>
public class ClientPayment : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    /// <summary>Always greater than zero. A refund to the client is not a negative payment.</summary>
    public decimal Amount { get; set; }

    /// <summary>The day the money arrived. DateOnly - no time, no timezone.</summary>
    public DateOnly Date { get; set; }

    /// <summary>Free text, e.g. "Deposit", "Foundation payment", "Final payment".</summary>
    public string? Description { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid CompanyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
