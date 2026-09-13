namespace BennayaOS.Api.Models.Enums;

/// <summary>
/// Units used on Jordanian sites. Stored as text with a database check
/// constraint, so adding a unit later is a deliberate migration rather than
/// something that silently changes the meaning of existing rows.
/// </summary>
public enum MaterialUnit
{
    Bag = 0,
    Kg = 1,
    Ton = 2,
    Meter = 3,
    SquareMeter = 4,
    CubicMeter = 5,
    Piece = 6,
    Liter = 7,
}
