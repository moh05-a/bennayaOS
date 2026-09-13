namespace BennayaOS.Api.Models;

/// <summary>
/// A business the contractor buys materials or services from.
/// Company-scoped: each contractor keeps their own supplier list.
/// </summary>
public class Supplier : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string Name { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public ICollection<Expense> Expenses { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
