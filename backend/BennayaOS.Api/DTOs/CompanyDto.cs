namespace BennayaOS.Api.DTOs;

public class CompanyDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public required string CurrencyCode { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}
