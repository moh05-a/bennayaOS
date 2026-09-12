namespace BennayaOS.Api.Exceptions;

/// <summary>
/// Base class for errors we EXPECT and want to report cleanly to the caller
/// (duplicate email, wrong password, missing record).
///
/// Anything not derived from this is an unexpected bug, and the global handler
/// deliberately hides its details from the client.
/// </summary>
public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }

    protected AppException(string message) : base(message)
    {
    }
}

/// <summary>409 - the request conflicts with existing data.</summary>
public class ConflictException : AppException
{
    public override int StatusCode => StatusCodes.Status409Conflict;

    public ConflictException(string message) : base(message)
    {
    }
}

/// <summary>404 - the record does not exist, or does not belong to this company.</summary>
public class NotFoundException : AppException
{
    public override int StatusCode => StatusCodes.Status404NotFound;

    public NotFoundException(string message) : base(message)
    {
    }
}

/// <summary>401 - credentials were missing or wrong.</summary>
public class UnauthorizedException : AppException
{
    public override int StatusCode => StatusCodes.Status401Unauthorized;

    public UnauthorizedException(string message) : base(message)
    {
    }
}
