using BennayaOS.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _environment;

    public HealthController(AppDbContext db, IWebHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    /// <summary>GET /api/health - proves the API process is alive.</summary>
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            service = "BennayaOS.Api",
            utcTime = DateTimeOffset.UtcNow
        });
    }

    /// <summary>
    /// GET /api/health/db - proves the API can actually reach PostgreSQL.
    /// We call OpenConnectionAsync rather than CanConnectAsync because the
    /// latter swallows the exception and just returns false, which tells us
    /// nothing about WHY the connection failed.
    /// </summary>
    [HttpGet("db")]
    public async Task<IActionResult> GetDatabase(CancellationToken cancellationToken)
    {
        try
        {
            await _db.Database.OpenConnectionAsync(cancellationToken);
            await _db.Database.CloseConnectionAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "error",
                database = "unreachable",
                // Detailed errors ONLY in development. In production this would
                // leak host names, user names and schema details to attackers.
                reason = _environment.IsDevelopment() ? ex.Message : null
            });
        }

        return Ok(new
        {
            status = "ok",
            database = "connected",
            provider = _db.Database.ProviderName
        });
    }
}
