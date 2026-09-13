namespace BennayaOS.Api.DTOs.Payments;

/// <summary>
/// Payments for one project, with the money figures the contractor actually
/// asks about. All sums are computed in SQL, never by adding rows in the UI.
/// </summary>
public class ClientPaymentListDto
{
    public required IReadOnlyList<ClientPaymentDto> Items { get; init; }

    /// <summary>SUM of every payment received on this project.</summary>
    public required decimal TotalReceived { get; init; }

    /// <summary>The agreed contract value, repeated here so the tab is self-contained.</summary>
    public required decimal ContractValue { get; init; }

    /// <summary>
    /// ContractValue - TotalReceived. Can go NEGATIVE when a client has
    /// overpaid, and we deliberately do not clamp it to zero: hiding an
    /// overpayment would be lying about the contractor's real position.
    /// </summary>
    public required decimal OutstandingBalance { get; init; }
}
