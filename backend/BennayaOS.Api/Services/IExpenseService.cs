using BennayaOS.Api.DTOs.Expenses;

namespace BennayaOS.Api.Services;

public interface IExpenseService
{
    Task<ExpenseListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken);
    Task<ExpenseDto> CreateAsync(Guid projectId, CreateExpenseRequest request, CancellationToken cancellationToken);
    Task<ExpenseDto> UpdateAsync(Guid id, UpdateExpenseRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
