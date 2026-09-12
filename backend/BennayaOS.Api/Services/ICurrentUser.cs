using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.Services;

/// <summary>
/// The authenticated caller, read from the validated JWT.
///
/// This is THE security boundary of the product. CompanyId comes from a
/// cryptographically signed token, never from a request body, query string or
/// header. If the frontend could send its own CompanyId, any contractor could
/// read every other contractor's finances by changing one number.
/// </summary>
public interface ICurrentUser
{
    Guid? UserId { get; }
    Guid? CompanyId { get; }
    string? Email { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }

    /// <summary>
    /// CompanyId for a request that must be authenticated.
    /// Throws rather than returning null, so a missing tenant can never be
    /// silently treated as "no filter" - which would leak every company's data.
    /// </summary>
    Guid RequireCompanyId();
}
