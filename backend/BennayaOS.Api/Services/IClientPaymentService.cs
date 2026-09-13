using BennayaOS.Api.DTOs.Payments;

namespace BennayaOS.Api.Services;

public interface IClientPaymentService
{
    Task<ClientPaymentListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken);
    Task<ClientPaymentDto> CreateAsync(Guid projectId, CreateClientPaymentRequest request, CancellationToken cancellationToken);
    Task<ClientPaymentDto> UpdateAsync(Guid id, UpdateClientPaymentRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
