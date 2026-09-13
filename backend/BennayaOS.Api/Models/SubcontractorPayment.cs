namespace BennayaOS.Api.Models;

/// <summary>
/// Money paid OUT to a subcontractor.
///
/// Deliberately separate from Expense. Contractors must record subcontractor
/// money here and NOT also as a Subcontractor-category expense, or the same
/// money would be counted twice in every project total.
/// </summary>
public class SubcontractorPayment : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public decimal Amount { get; set; }

    public DateOnly Date { get; set; }

    public string? Description { get; set; }

    public Guid SubcontractorId { get; set; }
    public Subcontractor Subcontractor { get; set; } = null!;

    public Guid CompanyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
