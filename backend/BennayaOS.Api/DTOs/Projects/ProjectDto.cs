using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Projects;

/// <summary>Row shape for the projects list.</summary>
public class ProjectDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Location { get; init; }
    public required decimal ContractValue { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? ExpectedEndDate { get; init; }

    /// <summary>Serialized as text ("Active"), matching the enum names.</summary>
    public required ProjectStatus Status { get; init; }

    public required Guid ClientId { get; init; }
    public required string ClientName { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
