using System.ComponentModel.DataAnnotations;

namespace BennayaOS.Api.DTOs.Auth;

/// <summary>
/// Signing up creates BOTH a company and its first Owner user in one step.
/// The contractor should not have to understand "tenants" to get started.
/// </summary>
public class RegisterRequest
{
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(150, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Company name is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string CompanyName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    // 8 is the practical floor. Length matters far more than forcing symbols,
    // which mostly makes users write passwords on sticky notes.
    [Required(ErrorMessage = "Password is required.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
    public string Password { get; set; } = string.Empty;

    /// <summary>ISO 4217. Defaults to JOD; lets us onboard SAR/AED later.</summary>
    [StringLength(3, MinimumLength = 3)]
    public string CurrencyCode { get; set; } = "JOD";
}
