namespace BennayaOS.Api.DTOs.Expenses;

/// <summary>
/// The expenses of one project, plus totals.
///
/// The total is computed by the DATABASE with SUM(), not by adding up the
/// returned rows in JavaScript. Once we paginate, a client-side total would
/// silently become "the total of this page" - a wrong number in a money app.
/// </summary>
public class ExpenseListDto
{
    public required IReadOnlyList<ExpenseDto> Items { get; init; }
    public required decimal TotalAmount { get; init; }
    public required IReadOnlyList<CategoryTotalDto> TotalsByCategory { get; init; }
}

public class CategoryTotalDto
{
    public required string Category { get; init; }
    public required decimal Amount { get; init; }
}
