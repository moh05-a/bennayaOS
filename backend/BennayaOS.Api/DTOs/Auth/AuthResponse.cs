namespace BennayaOS.Api.DTOs.Auth;

/// <summary>
/// What the frontend receives after a successful register or login.
///
/// Note what is NOT here: PasswordHash. DTOs exist precisely so that adding a
/// sensitive column to an entity can never accidentally expose it over HTTP.
/// </summary>
public class AuthResponse
{
    public required string Token { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
    public required AuthUserDto User { get; init; }
    public required AuthCompanyDto Company { get; init; }
}

public class AuthUserDto
{
    public required Guid Id { get; init; }
    public required string FullName { get; init; }
    public required string Email { get; init; }
    public required string Role { get; init; }
}

public class AuthCompanyDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string CurrencyCode { get; init; }
}
