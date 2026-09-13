namespace BennayaOS.Api.Models.Enums;

/// <summary>
/// Stored as text, with a database check constraint generated from these names.
/// </summary>
public enum ExpenseCategory
{
    Materials = 0,
    Labor = 1,
    Equipment = 2,
    Transportation = 3,
    Subcontractor = 4,
    Other = 5,
}
