namespace BennayaOS.Api.DTOs.Subcontractors;

/// <summary>Subcontractors on one project, with the totals that matter.</summary>
public class SubcontractorListDto
{
    public required IReadOnlyList<SubcontractorDto> Items { get; init; }

    /// <summary>Everything the contractor has committed to pay across all subcontracts.</summary>
    public required decimal TotalCommitted { get; init; }

    public required decimal TotalPaid { get; init; }

    /// <summary>TotalCommitted - TotalPaid: the project's outstanding labour liability.</summary>
    public required decimal TotalRemaining { get; init; }
}
