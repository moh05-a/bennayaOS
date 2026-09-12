using System.Text;
using BennayaOS.Api.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BennayaOS.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .ValidateDataAnnotations()
            // Fail at STARTUP, not on the first login attempt. A deployment
            // with a missing signing key should refuse to boot.
            .ValidateOnStart();

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Missing 'Jwt' configuration section.");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // Do not rewrite claim names into long WS-Federation URIs.
                // Keeps "sub" as "sub" so ICurrentUser reads what we issued.
                options.MapInboundClaims = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,

                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,

                    // Proves the token was signed by us and not modified.
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),

                    ValidateLifetime = true,
                    // Default is 5 minutes of grace, which silently extends
                    // every token's life. Zero means expiry means expiry.
                    ClockSkew = TimeSpan.Zero,

                    RoleClaimType = "role",
                    NameClaimType = "sub",
                };
            });

        services.AddAuthorization();

        return services;
    }
}
