using BennayaOS.Api.DTOs.Expenses;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BennayaOS.Api.Controllers;

/// <summary>
/// Routes are set per action rather than on the class, because expenses are
/// addressed two ways:
///   - nested under a project when listing or creating (they always belong to one)
///   - directly by id when updating or deleting (the id is already unique)
/// </summary>
[ApiController]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    /// <summary>GET /api/projects/{projectId}/expenses</summary>
    [HttpGet("api/projects/{projectId:guid}/expenses")]
    [ProducesResponseType(typeof(ExpenseListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ExpenseListDto>> GetForProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        return Ok(await _expenseService.GetForProjectAsync(projectId, cancellationToken));
    }

    /// <summary>POST /api/projects/{projectId}/expenses</summary>
    [HttpPost("api/projects/{projectId:guid}/expenses")]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ExpenseDto>> Create(
        Guid projectId,
        CreateExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var expense = await _expenseService.CreateAsync(projectId, request, cancellationToken);

        // 201 with the collection URI: there is no single-expense GET endpoint,
        // so pointing at the project's expense list is the honest Location.
        return Created($"/api/projects/{projectId}/expenses", expense);
    }

    /// <summary>PUT /api/expenses/{id}</summary>
    [HttpPut("api/expenses/{id:guid}")]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ExpenseDto>> Update(
        Guid id,
        UpdateExpenseRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _expenseService.UpdateAsync(id, request, cancellationToken));
    }

    /// <summary>DELETE /api/expenses/{id}</summary>
    [HttpDelete("api/expenses/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _expenseService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
