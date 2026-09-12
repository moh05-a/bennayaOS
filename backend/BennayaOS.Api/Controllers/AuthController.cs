using BennayaOS.Api.DTOs.Auth;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// POST /api/auth/register - creates a company and its Owner user.
    /// [ApiController] validates the DTO's data annotations automatically and
    /// returns 400 with field-level errors before this method is ever entered,
    /// which is why there is no manual ModelState check here.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        return Ok(response);
    }

    /// <summary>POST /api/auth/login</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// GET /api/auth/me - returns the caller identity decoded from the JWT.
    /// Requires a valid token, so it doubles as a way to verify auth works.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public ActionResult<object> Me([FromServices] ICurrentUser currentUser)
    {
        return Ok(new
        {
            userId = currentUser.UserId,
            companyId = currentUser.CompanyId,
            email = currentUser.Email,
            role = currentUser.Role?.ToString(),
        });
    }
}
