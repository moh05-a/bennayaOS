using BennayaOS.Api.DTOs.Tasks;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

[ApiController]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly IProjectTaskService _taskService;

    public TasksController(IProjectTaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>GET /api/projects/{projectId}/tasks</summary>
    [HttpGet("api/projects/{projectId:guid}/tasks")]
    [ProducesResponseType(typeof(ProjectTaskListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectTaskListDto>> GetForProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        return Ok(await _taskService.GetForProjectAsync(projectId, cancellationToken));
    }

    /// <summary>POST /api/projects/{projectId}/tasks</summary>
    [HttpPost("api/projects/{projectId:guid}/tasks")]
    [ProducesResponseType(typeof(ProjectTaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectTaskDto>> Create(
        Guid projectId,
        CreateProjectTaskRequest request,
        CancellationToken cancellationToken)
    {
        var task = await _taskService.CreateAsync(projectId, request, cancellationToken);
        return Created($"/api/projects/{projectId}/tasks", task);
    }

    /// <summary>PUT /api/tasks/{id}</summary>
    [HttpPut("api/tasks/{id:guid}")]
    [ProducesResponseType(typeof(ProjectTaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectTaskDto>> Update(
        Guid id,
        UpdateProjectTaskRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _taskService.UpdateAsync(id, request, cancellationToken));
    }

    /// <summary>DELETE /api/tasks/{id}</summary>
    [HttpDelete("api/tasks/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _taskService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
