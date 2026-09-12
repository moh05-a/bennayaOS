using System.Security.Claims;
using System.Text;
using BennayaOS.Api.Configuration;
using BennayaOS.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace BennayaOS.Api.Services;

/// <summary>
/// Issues signed JWTs. The token is not encrypted - anyone can read its
/// contents - but it IS signed, so its claims cannot be altered without
/// invalidating the signature. That is why we can trust company_id from it.
/// </summary>
public class TokenService : ITokenService
{
    private readonly JwtOptions _options;

    public TokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public (string Token, DateTimeOffset ExpiresAt) CreateToken(User user)
    {
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_options.ExpiryMinutes);

        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new(CurrentUser.CompanyIdClaim, user.CompanyId.ToString()),
            new("email", user.Email),
            new("role", user.Role.ToString()),
            new("name", user.FullName),
            // A unique id per token, so individual tokens can be revoked later.
            new(JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt.UtcDateTime,
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        };

        var token = new JsonWebTokenHandler().CreateToken(descriptor);

        return (token, expiresAt);
    }
}
