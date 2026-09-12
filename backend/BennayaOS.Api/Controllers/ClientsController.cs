using BennayaOS.Api.DTOs.Clients;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

/// <summary>
/// [Authorize] on the class means every action requires a valid JWT.
/// Securing at the class level is safer than per-action: a new endpoint added
/// later is protected by default, rather than being public until someone
/// remembers to add the attribute.
/// </summary>
[ApiController]
[Route("api/clients")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    /// <summary>GET /api/clients</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ClientDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ClientDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _clientService.GetAllAsync(cancellationToken));
    }

    /// <summary>GET /api/clients/{id}</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await _clientService.GetByIdAsync(id, cancellationToken));
    }

    /// <summary>POST /api/clients</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ClientDto>> Create(
        CreateClientRequest request,
        CancellationToken cancellationToken)
    {
        var client = await _clientService.CreateAsync(request, cancellationToken);

        // 201 with a Location header pointing at the new resource - the correct
        // REST response for a successful create.
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    /// <summary>PUT /api/clients/{id}</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientDto>> Update(
        Guid id,
        UpdateClientRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _clientService.UpdateAsync(id, request, cancellationToken));
    }

    /// <summary>DELETE /api/clients/{id}</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _clientService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
