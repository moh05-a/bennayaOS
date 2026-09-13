namespace BennayaOS.Api.Models;

/// <summary>
/// A specialist the contractor hires for part of a project - electrician,
/// plumber, painter. Belongs to ONE project, because the agreed amount is
/// per job, not per relationship.
/// </summary>
public class Subcontractor : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string Name { get; set; }

    public string? Phone { get; set; }

    /// <summary>
    /// Free text, not an enum. Trades vary widely across MENA markets, and a
    /// fixed list would force contractors to file real work under "Other".
    /// The UI offers common trades as quick picks.
    /// </summary>
    public string? Specialty { get; set; }

    /// <summary>
    /// The agreed total for this subcontract. Zero is allowed: the amount is
    /// sometimes agreed after work starts.
    /// </summary>
    public decimal ContractAmount { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public ICollection<SubcontractorPayment> Payments { get; set; } = [];

    public Guid CompanyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
