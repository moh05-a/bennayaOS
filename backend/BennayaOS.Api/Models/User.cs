using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.Models;

/// <summary>
/// A person who logs in. Always belongs to exactly one Company.
/// </summary>
public class User : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string FullName { get; set; }

    /// <summary>
    /// Always stored lower-cased. Login lookups are case-insensitive in every
    /// real email system, and normalizing on write means the unique index does
    /// the enforcing instead of scattered application code.
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// BCrypt/PBKDF2 hash produced in Phase 3. Never the password itself, and
    /// never exposed through a DTO.
    /// </summary>
    public required string PasswordHash { get; set; }

    public UserRole Role { get; set; } = UserRole.Employee;

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
