using BennayaOS.Api.DTOs.Materials;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Authorize]
public class MaterialsController : ControllerBase
{
    private readonly IMaterialService _materialService;

    public MaterialsController(IMaterialService materialService)
    {
        _materialService = materialService;
    }

    /// <summary>GET /api/projects/{projectId}/materials</summary>
    [HttpGet("api/projects/{projectId:guid}/materials")]
    [ProducesResponseType(typeof(MaterialListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MaterialListDto>> GetForProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        return Ok(await _materialService.GetForProjectAsync(projectId, cancellationToken));
    }

    /// <summary>POST /api/projects/{projectId}/materials</summary>
    [HttpPost("api/projects/{projectId:guid}/materials")]
    [ProducesResponseType(typeof(MaterialDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MaterialDto>> Create(
        Guid projectId,
        CreateMaterialRequest request,
        CancellationToken cancellationToken)
    {
        var material = await _materialService.CreateAsync(projectId, request, cancellationToken);
        return Created($"/api/projects/{projectId}/materials", material);
    }

    /// <summary>PUT /api/materials/{id}</summary>
    [HttpPut("api/materials/{id:guid}")]
    [ProducesResponseType(typeof(MaterialDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MaterialDto>> Update(
        Guid id,
        UpdateMaterialRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _materialService.UpdateAsync(id, request, cancellationToken));
    }

    /// <summary>DELETE /api/materials/{id}</summary>
    [HttpDelete("api/materials/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _materialService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
