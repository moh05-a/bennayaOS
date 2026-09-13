using BennayaOS.Api.DTOs.Payments;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Authorize]
public class ClientPaymentsController : ControllerBase
{
    private readonly IClientPaymentService _paymentService;

    public ClientPaymentsController(IClientPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>GET /api/projects/{projectId}/payments</summary>
    [HttpGet("api/projects/{projectId:guid}/payments")]
    [ProducesResponseType(typeof(ClientPaymentListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientPaymentListDto>> GetForProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        return Ok(await _paymentService.GetForProjectAsync(projectId, cancellationToken));
    }

    /// <summary>POST /api/projects/{projectId}/payments</summary>
    [HttpPost("api/projects/{projectId:guid}/payments")]
    [ProducesResponseType(typeof(ClientPaymentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientPaymentDto>> Create(
        Guid projectId,
        CreateClientPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var payment = await _paymentService.CreateAsync(projectId, request, cancellationToken);
        return Created($"/api/projects/{projectId}/payments", payment);
    }

    /// <summary>PUT /api/payments/{id}</summary>
    [HttpPut("api/payments/{id:guid}")]
    [ProducesResponseType(typeof(ClientPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientPaymentDto>> Update(
        Guid id,
        UpdateClientPaymentRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _paymentService.UpdateAsync(id, request, cancellationToken));
    }

    /// <summary>DELETE /api/payments/{id}</summary>
    [HttpDelete("api/payments/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _paymentService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
