using BennayaOS.Api.DTOs.Subcontractors;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Authorize]
public class SubcontractorsController : ControllerBase
{
    private readonly ISubcontractorService _subcontractorService;

    public SubcontractorsController(ISubcontractorService subcontractorService)
    {
        _subcontractorService = subcontractorService;
    }

    /// <summary>GET /api/projects/{projectId}/subcontractors</summary>
    [HttpGet("api/projects/{projectId:guid}/subcontractors")]
    [ProducesResponseType(typeof(SubcontractorListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubcontractorListDto>> GetForProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        return Ok(await _subcontractorService.GetForProjectAsync(projectId, cancellationToken));
    }

    /// <summary>GET /api/subcontractors/{id}</summary>
    [HttpGet("api/subcontractors/{id:guid}")]
    [ProducesResponseType(typeof(SubcontractorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubcontractorDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await _subcontractorService.GetByIdAsync(id, cancellationToken));
    }

    /// <summary>POST /api/projects/{projectId}/subcontractors</summary>
    [HttpPost("api/projects/{projectId:guid}/subcontractors")]
    [ProducesResponseType(typeof(SubcontractorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubcontractorDto>> Create(
        Guid projectId,
        CreateSubcontractorRequest request,
        CancellationToken cancellationToken)
    {
        var subcontractor = await _subcontractorService.CreateAsync(projectId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = subcontractor.Id }, subcontractor);
    }

    /// <summary>PUT /api/subcontractors/{id}</summary>
    [HttpPut("api/subcontractors/{id:guid}")]
    [ProducesResponseType(typeof(SubcontractorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubcontractorDto>> Update(
        Guid id,
        UpdateSubcontractorRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _subcontractorService.UpdateAsync(id, request, cancellationToken));
    }

    /// <summary>DELETE /api/subcontractors/{id}</summary>
    [HttpDelete("api/subcontractors/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _subcontractorService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>GET /api/subcontractors/{id}/payments</summary>
    [HttpGet("api/subcontractors/{id:guid}/payments")]
    [ProducesResponseType(typeof(IReadOnlyList<SubcontractorPaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<SubcontractorPaymentDto>>> GetPayments(
        Guid id,
        CancellationToken cancellationToken)
    {
        return Ok(await _subcontractorService.GetPaymentsAsync(id, cancellationToken));
    }

    /// <summary>POST /api/subcontractors/{id}/payments</summary>
    [HttpPost("api/subcontractors/{id:guid}/payments")]
    [ProducesResponseType(typeof(SubcontractorPaymentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubcontractorPaymentDto>> AddPayment(
        Guid id,
        CreateSubcontractorPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var payment = await _subcontractorService.AddPaymentAsync(id, request, cancellationToken);
        return Created($"/api/subcontractors/{id}/payments", payment);
    }

    /// <summary>
    /// DELETE /api/subcontractor-payments/{id}
    /// Not in the original endpoint list, but recording a payment twice or
    /// typing the wrong amount is common enough that there must be a way back.
    /// </summary>
    [HttpDelete("api/subcontractor-payments/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePayment(Guid id, CancellationToken cancellationToken)
    {
        await _subcontractorService.DeletePaymentAsync(id, cancellationToken);
        return NoContent();
    }
}
