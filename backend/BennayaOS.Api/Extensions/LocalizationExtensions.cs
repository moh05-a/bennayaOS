using System.ComponentModel.DataAnnotations;
using System.Globalization;
using BennayaOS.Api.Resources;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

namespace BennayaOS.Api.Extensions;

public static class LocalizationExtensions
{
    /// <summary>The languages the API can answer in. The first is the default.</summary>
    public static readonly string[] SupportedLanguages = ["en", "ar"];

    /// <summary>
    /// Lets the API return its messages in the language the frontend asks for.
    ///
    /// The frontend sends "Accept-Language: ar" or "en" on every request. Only
    /// the UI culture follows that header - it controls which TEXT is returned.
    /// The formatting culture stays English, so numbers and dates in query
    /// strings are parsed the same way whatever language the user picked.
    /// </summary>
    public static IServiceCollection AddAppLocalization(this IServiceCollection services)
    {
        services.AddLocalization();

        services.Configure<RequestLocalizationOptions>(options =>
        {
            options.DefaultRequestCulture = new RequestCulture(SupportedLanguages[0]);
            options.SupportedCultures = [new CultureInfo(SupportedLanguages[0])];
            options.SupportedUICultures = SupportedLanguages.Select(code => new CultureInfo(code)).ToList();

            // Header only. Query-string and cookie overrides are not needed and
            // would be one more input to reason about.
            options.RequestCultureProviders = [new AcceptLanguageHeaderRequestCultureProvider()];
        });

        return services;
    }

    /// <summary>
    /// Translates validation attribute messages through SharedResource, and
    /// gives attributes without an explicit message a short, translatable one.
    /// </summary>
    public static IMvcBuilder AddAppValidationLocalization(this IMvcBuilder builder)
    {
        builder.AddMvcOptions(options =>
            options.ModelMetadataDetailsProviders.Add(new DefaultValidationMessagesProvider()));

        builder.AddDataAnnotationsLocalization(options =>
            options.DataAnnotationLocalizerProvider = (_, factory) => factory.Create(typeof(SharedResource)));

        return builder;
    }

    /// <summary>
    /// Attributes like [StringLength(200)] with no ErrorMessage fall back to the
    /// framework's built-in English text ("The field Name must be a string with a
    /// maximum length of 200."), which cannot be translated and names the C#
    /// property. This gives them a short message of our own instead. The error
    /// is shown under the field, so it does not need to repeat the field name.
    ///
    /// Placeholders: {0} = field name, {1} = maximum, {2} = minimum.
    /// </summary>
    private sealed class DefaultValidationMessagesProvider : IValidationMetadataProvider
    {
        public void CreateValidationMetadata(ValidationMetadataProviderContext context)
        {
            foreach (var attribute in context.Attributes.OfType<ValidationAttribute>())
            {
                if (attribute.ErrorMessage is not null || attribute.ErrorMessageResourceName is not null)
                {
                    continue;
                }

                var message = attribute switch
                {
                    RequiredAttribute => "This field is required.",
                    EmailAddressAttribute => "Enter a valid email address.",
                    StringLengthAttribute s when s.MinimumLength == s.MaximumLength => "Must be exactly {1} characters.",
                    StringLengthAttribute { MinimumLength: > 0 } => "Must be between {2} and {1} characters.",
                    StringLengthAttribute => "Must be {1} characters or fewer.",
                    _ => null,
                };

                if (message is not null)
                {
                    attribute.ErrorMessage = message;
                }
            }
        }
    }
}
