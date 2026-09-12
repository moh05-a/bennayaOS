using System.ComponentModel.DataAnnotations;

namespace BennayaOS.Api.Configuration;

/// <summary>
/// Strongly-typed JWT settings, bound from configuration at startup.
/// Validated with ValidateOnStart so a misconfigured deployment fails
/// immediately instead of issuing tokens nobody can verify.
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// HMAC-SHA256 signing key. Comes from User Secrets in development and an
    /// environment variable in production - never from appsettings.json.
    /// Minimum 32 characters because HS256 requires a 256-bit key; a shorter
    /// key makes tokens trivially forgeable.
    /// </summary>
    [Required]
    [MinLength(32, ErrorMessage = "Jwt:SigningKey must be at least 32 characters (256 bits).")]
    public string SigningKey { get; set; } = string.Empty;

    [Range(5, 43200)]
    public int ExpiryMinutes { get; set; } = 480;
}
