using BennayaOS.Api.DTOs.Clients;

namespace BennayaOS.Api.Services;

public interface IClientService
{
    Task<IReadOnlyList<ClientDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<ClientDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken cancellationToken);
    Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
