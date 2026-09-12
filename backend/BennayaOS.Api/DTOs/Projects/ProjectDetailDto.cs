using BennayaOS.Api.Models.Enums;

namespace BennayaOS.Api.DTOs.Projects;

/// <summary>
/// The project details page. Financial totals (expenses, received, outstanding)
/// join this in Phases 6-8, once expenses and client payments exist. We do not
/// ship zero-valued placeholders - fake numbers destroy trust in a money tool.
/// </summary>
public class ProjectDetailDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Location { get; init; }
    public required decimal ContractValue { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? ExpectedEndDate { get; init; }
    public required ProjectStatus Status { get; init; }

    public required Guid ClientId { get; init; }
    public required string ClientName { get; init; }
    public string? ClientPhone { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
