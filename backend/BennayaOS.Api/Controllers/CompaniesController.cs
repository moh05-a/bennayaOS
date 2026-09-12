using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs;
using BennayaOS.Api.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Route("api/companies")]
[Authorize]
public class CompaniesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CompaniesController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// GET /api/companies/current - the signed-in user's own company.
    ///
    /// Look closely: there is NO Where clause and NO company id parameter.
    /// The global query filter in AppDbContext adds
    /// "WHERE company_id = @currentCompany" using the id from the validated
    /// JWT. That is the whole point of the design - a developer cannot forget
    /// the tenant check, because they never write it.
    ///
    /// There is also no id in the route, so there is nothing for a caller to
    /// tamper with to request someone else's company.
    /// </summary>
    [HttpGet("current")]
    [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CompanyDto>> GetCurrent(CancellationToken cancellationToken)
    {
        var company = await _db.Companies
            .AsNoTracking()
            .Select(c => new CompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                CurrencyCode = c.CurrencyCode,
                CreatedAt = c.CreatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (company is null)
        {
            throw new NotFoundException("Company not found.");
        }

        return Ok(company);
    }

    /// <summary>
    /// GET /api/companies - diagnostic proof of isolation. Returns how many
    /// companies this caller can see. Must always be exactly 1, no matter how
    /// many companies exist in the database.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<object>> GetVisible(CancellationToken cancellationToken)
    {
        var visible = await _db.Companies
            .AsNoTracking()
            .Select(c => c.Name)
            .ToListAsync(cancellationToken);

        return Ok(new { visibleCount = visible.Count, names = visible });
    }
}
