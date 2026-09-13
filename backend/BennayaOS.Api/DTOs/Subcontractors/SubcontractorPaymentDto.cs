namespace BennayaOS.Api.DTOs.Subcontractors;

public class SubcontractorPaymentDto
{
    public required Guid Id { get; init; }
    public required decimal Amount { get; init; }
    public required DateOnly Date { get; init; }
    public string? Description { get; init; }
    public required Guid SubcontractorId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}
