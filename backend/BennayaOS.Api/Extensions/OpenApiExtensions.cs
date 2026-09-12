using Microsoft.OpenApi;

namespace BennayaOS.Api.Extensions;

/// <summary>
/// Teaches the OpenAPI document about Bearer tokens, so the Scalar UI shows an
/// "Authorize" button and can call protected endpoints.
/// </summary>
public static class OpenApiExtensions
{
    public static IServiceCollection AddOpenApiWithAuth(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

                document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Paste the token returned by /api/auth/login.",
                };

                document.Security =
                [
                    new OpenApiSecurityRequirement
                    {
                        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                    }
                ];

                return Task.CompletedTask;
            });
        });

        return services;
    }
}
