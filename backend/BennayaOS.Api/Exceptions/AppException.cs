using System.Globalization;

namespace BennayaOS.Api.Exceptions;

/// <summary>
/// Base class for errors we EXPECT and want to report cleanly to the caller
/// (duplicate email, wrong password, missing record).
///
/// Anything not derived from this is an unexpected bug, and the global handler
/// deliberately hides its details from the client.
///
/// The message is an English template, optionally with {0}-style placeholders.
/// The template is kept separately from the formatted Message so the global
/// handler can translate it into the caller's language before filling in the
/// arguments. Message itself stays English, for the logs.
/// </summary>
public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }

    /// <summary>The untranslated English text, used as the localization key.</summary>
    public string MessageTemplate { get; }

    public object[] MessageArguments { get; }

    protected AppException(string messageTemplate, object[] arguments)
        : base(Format(messageTemplate, arguments))
    {
        MessageTemplate = messageTemplate;
        MessageArguments = arguments;
    }

    // Only format when there are arguments, so a message that happens to
    // contain a literal brace can never throw a FormatException.
    private static string Format(string template, object[] arguments)
        => arguments.Length == 0 ? template : string.Format(CultureInfo.InvariantCulture, template, arguments);
}

/// <summary>409 - the request conflicts with existing data.</summary>
public class ConflictException : AppException
{
    public override int StatusCode => StatusCodes.Status409Conflict;

    public ConflictException(string message, params object[] arguments) : base(message, arguments)
    {
    }
}

/// <summary>404 - the record does not exist, or does not belong to this company.</summary>
public class NotFoundException : AppException
{
    public override int StatusCode => StatusCodes.Status404NotFound;

    public NotFoundException(string message, params object[] arguments) : base(message, arguments)
    {
    }
}

/// <summary>401 - credentials were missing or wrong.</summary>
public class UnauthorizedException : AppException
{
    public override int StatusCode => StatusCodes.Status401Unauthorized;

    public UnauthorizedException(string message, params object[] arguments) : base(message, arguments)
    {
    }
}
