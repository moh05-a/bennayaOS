namespace BennayaOS.Api.Models;

/// <summary>
/// A contractor business. This is the tenant boundary: every other record in
/// the system belongs to exactly one Company and must never leak across.
/// </summary>
public class Company
{
    // UUIDv7 is time-ordered, so it indexes like a sequential number while
    // staying unguessable. Generated in C# so we know the Id before saving.
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string Name { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    /// <summary>
    /// ISO 4217 code (JOD, SAR, AED, QAR, KWD).
    /// Money is stored as a plain decimal; this says how to interpret and
    /// format it. Keeping it per-company is what lets us expand across MENA
    /// without touching the financial logic.
    /// </summary>
    public string CurrencyCode { get; set; } = "JOD";

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties: how EF Core understands the relationships.
    public ICollection<User> Users { get; set; } = [];
    public ICollection<Client> Clients { get; set; } = [];
    public ICollection<Project> Projects { get; set; } = [];
}
