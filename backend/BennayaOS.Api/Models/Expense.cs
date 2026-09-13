using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.Models;

/// <summary>
/// Money the contractor spent on a project.
/// </summary>
public class Expense : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    /// <summary>
    /// Always greater than zero - a refund is not a negative expense, and
    /// allowing negatives would quietly corrupt every project total.
    /// Stored as numeric(18,3) by the global convention.
    /// </summary>
    public decimal Amount { get; set; }

    public string? Description { get; set; }

    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;

    /// <summary>
    /// The day the money was spent. DateOnly, because "I paid the cement
    /// supplier on 12 March" has no time and no timezone.
    /// </summary>
    public DateOnly Date { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    // Phase 10 adds: public Guid? SupplierId

    /// <summary>
    /// Denormalized from Project so the global tenant filter applies here the
    /// same way it does everywhere else, with no join required.
    /// </summary>
    public Guid CompanyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
