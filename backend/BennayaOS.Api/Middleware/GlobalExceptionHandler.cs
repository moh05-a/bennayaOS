using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Resources;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace BennayaOS.Api.Middleware;

/// <summary>
/// One place that turns exceptions into consistent HTTP responses.
///
/// Uses IExceptionHandler (the modern ASP.NET Core approach) instead of custom
/// middleware, so responses are RFC 9457 ProblemDetails - the same shape the
/// framework already returns for validation errors.
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IHostEnvironment _environment;
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public GlobalExceptionHandler(
        IHostEnvironment environment,
        ILogger<GlobalExceptionHandler> logger,
        IStringLocalizer<SharedResource> localizer)
    {
        _environment = environment;
        _logger = logger;
        _localizer = localizer;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ProblemDetails problem;

        if (exception is AppException appException)
        {
            // Errors we raised on purpose. Safe to show to the caller.
            // Logged in English; returned in the caller's language.
            _logger.LogInformation("Handled {Type}: {Message}",
                exception.GetType().Name, exception.Message);

            problem = new ProblemDetails
            {
                Status = appException.StatusCode,
                Title = _localizer[appException.MessageTemplate, appException.MessageArguments],
            };
        }
        else if (exception is UnauthorizedAccessException)
        {
            problem = new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = _localizer["Authentication required."],
            };
        }
        else
        {
            // An unexpected bug. Log everything server-side, reveal nothing
            // client-side: stack traces expose file paths, library versions and
            // schema details that help an attacker.
            _logger.LogError(exception, "Unhandled exception on {Path}", httpContext.Request.Path);

            problem = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = _localizer["An unexpected error occurred."],
                // Detail only in development, never in production.
                Detail = _environment.IsDevelopment() ? exception.ToString() : null,
            };
        }

        problem.Instance = httpContext.Request.Path;
        httpContext.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true; // handled
    }
}
