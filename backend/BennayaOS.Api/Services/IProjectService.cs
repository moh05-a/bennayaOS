using BennayaOS.Api.DTOs.Projects;

namespace BennayaOS.Api.Services;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<ProjectDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ProjectDetailDto> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken);
    Task<ProjectDetailDto> UpdateAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
