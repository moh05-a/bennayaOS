using BennayaOS.Api.DTOs.Dashboard;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// GET /api/dashboard - business-wide totals for the signed-in company.
    /// Takes no parameters at all: there is nothing for a caller to tamper
    /// with, because the company comes from the JWT.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(DashboardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DashboardDto>> Get(CancellationToken cancellationToken)
    {
        return Ok(await _dashboardService.GetAsync(cancellationToken));
    }
}
