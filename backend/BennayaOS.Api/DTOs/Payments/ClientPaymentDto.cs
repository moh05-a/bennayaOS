namespace BennayaOS.Api.DTOs.Payments;

public class ClientPaymentDto
{
    public required Guid Id { get; init; }
    public required decimal Amount { get; init; }
    public required DateOnly Date { get; init; }
    public string? Description { get; init; }
    public required Guid ProjectId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}
