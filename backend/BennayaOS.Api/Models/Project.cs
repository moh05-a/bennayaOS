using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.Models;

/// <summary>
/// A construction job. The centre of the product - expenses, client payments,
/// subcontractors, tasks and materials all hang off this in later phases.
/// </summary>
public class Project : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string Name { get; set; }

    public string? Description { get; set; }

    public string? Location { get; set; }

    /// <summary>
    /// The agreed contract value. decimal (never double) because binary
    /// floating point cannot represent 0.1 exactly, and money must be exact.
    /// Stored as numeric(18,3) by the global convention in AppDbContext.
    /// </summary>
    public decimal ContractValue { get; set; }

    /// <summary>
    /// DateOnly, not DateTime: "the project starts on 15 March" is a calendar
    /// fact, not an instant. Using DateTime here is how projects end up
    /// displaying the previous day for users in another timezone.
    /// </summary>
    public DateOnly? StartDate { get; set; }

    public DateOnly? ExpectedEndDate { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;

    /// <summary>
    /// Denormalized from Client on purpose. Client already knows its Company,
    /// but storing CompanyId directly means every project query can filter by
    /// tenant without joining, and the global query filter in Phase 3 works
    /// uniformly across all entities.
    /// </summary>
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public ICollection<Expense> Expenses { get; set; } = [];
    public ICollection<ClientPayment> ClientPayments { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
