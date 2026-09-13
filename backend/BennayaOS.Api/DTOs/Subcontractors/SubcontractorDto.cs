namespace BennayaOS.Api.DTOs.Subcontractors;

public class SubcontractorDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Phone { get; init; }
    public string? Specialty { get; init; }
    public required decimal ContractAmount { get; init; }

    /// <summary>SUM of everything paid to this subcontractor so far.</summary>
    public required decimal TotalPaid { get; init; }

    /// <summary>
    /// ContractAmount - TotalPaid: what the contractor still owes.
    /// Goes NEGATIVE if they overpaid, and is not clamped - a contractor needs
    /// to see that they have paid out more than they agreed.
    /// </summary>
    public required decimal Remaining { get; init; }

    public required int PaymentCount { get; init; }
    public required Guid ProjectId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}
