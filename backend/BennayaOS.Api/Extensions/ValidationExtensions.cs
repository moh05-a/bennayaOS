using BennayaOS.Api.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace BennayaOS.Api.Extensions;

public static class ValidationExtensions
{
    /// <summary>
    /// Cleans up automatic 400 responses.
    ///
    /// When JSON cannot be deserialized (a bad enum value, a letter in a number
    /// field), System.Text.Json produces messages containing our internal .NET
    /// type names, e.g.
    ///   "The JSON value could not be converted to
    ///    BennayaOS.Api.Models.Enums.ExpenseCategory"
    ///
    /// That leaks our namespace layout to anyone poking at the API and means
    /// nothing to a contractor. We replace those with a plain message and keep
    /// our own validation messages untouched.
    ///
    /// Every message is also passed through the localizer. Attribute messages
    /// arrive already translated (see AddAppLocalization), so for them the
    /// lookup finds nothing and returns the text unchanged; this pass catches
    /// the rest, such as IValidatableObject messages and our own fallbacks.
    /// </summary>
    public static IServiceCollection AddCleanValidationResponses(this IServiceCollection services)
    {
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var localizer = context.HttpContext.RequestServices
                    .GetRequiredService<IStringLocalizer<SharedResource>>();

                var modelStateEntries = context.ModelState
                    .Where(entry => entry.Value?.Errors.Count > 0)
                    .ToList();

                // When JSON fails to deserialize, the whole parameter also binds
                // as null, adding a useless "request: The request field is
                // required." alongside the real field error. Drop that noise so
                // the frontend only shows errors a user can act on.
                if (modelStateEntries.Count > 1)
                {
                    modelStateEntries = modelStateEntries
                        .Where(entry => !string.Equals(entry.Key, "request", StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                var errors = modelStateEntries
                    .ToDictionary(
                        entry => CleanFieldName(entry.Key),
                        entry => entry.Value!.Errors
                            .Select(error => (string)localizer[CleanMessage(error.ErrorMessage)])
                            .Distinct()
                            .ToArray());

                var problem = new ValidationProblemDetails(errors)
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = localizer["One or more fields are invalid."],
                    Instance = context.HttpContext.Request.Path,
                };

                return new BadRequestObjectResult(problem);
            };
        });

        return services;
    }

    /// <summary>System.Text.Json reports paths as "$.category"; the frontend expects "category".</summary>
    private static string CleanFieldName(string key)
        => key.StartsWith("$.", StringComparison.Ordinal) ? key[2..] : key;

    private static string CleanMessage(string message)
    {
        if (message.Contains("could not be converted", StringComparison.OrdinalIgnoreCase))
        {
            return "This value is not valid.";
        }

        // Also raised for malformed JSON bodies.
        if (message.Contains("JSON", StringComparison.OrdinalIgnoreCase)
            && message.Contains("Path:", StringComparison.OrdinalIgnoreCase))
        {
            return "This value is not valid.";
        }

        return message;
    }
}
