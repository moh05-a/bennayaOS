using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Expenses;

public class ExpenseDto
{
    public required Guid Id { get; init; }
    public required decimal Amount { get; init; }
    public string? Description { get; init; }
    public required ExpenseCategory Category { get; init; }
    public required DateOnly Date { get; init; }
    public required Guid ProjectId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}
