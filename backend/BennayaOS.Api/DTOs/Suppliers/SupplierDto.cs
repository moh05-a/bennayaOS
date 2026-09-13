namespace BennayaOS.Api.DTOs.Suppliers;

public class SupplierDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }

    /// <summary>How many expenses reference this supplier.</summary>
    public required int ExpenseCount { get; init; }

    /// <summary>Total spent with this supplier - useful for negotiating.</summary>
    public required decimal TotalSpent { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
