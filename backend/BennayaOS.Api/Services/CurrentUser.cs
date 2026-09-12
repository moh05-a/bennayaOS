using System.Security.Claims;
using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.Services;

public class CurrentUser : ICurrentUser
{
    /// <summary>Custom claim name carrying the tenant id.</summary>
    public const string CompanyIdClaim = "company_id";

    private readonly ClaimsPrincipal? _principal;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _principal = httpContextAccessor.HttpContext?.User;
    }

    public bool IsAuthenticated => _principal?.Identity?.IsAuthenticated == true;

    public Guid? UserId =>
        Guid.TryParse(_principal?.FindFirstValue("sub"), out var id) ? id : null;

    public Guid? CompanyId =>
        Guid.TryParse(_principal?.FindFirstValue(CompanyIdClaim), out var id) ? id : null;

    public string? Email => _principal?.FindFirstValue("email");

    public UserRole? Role =>
        Enum.TryParse<UserRole>(_principal?.FindFirstValue("role"), out var role) ? role : null;

    public Guid RequireCompanyId()
    {
        return CompanyId ?? throw new UnauthorizedAccessException(
            "No authenticated company context on this request.");
    }
}
