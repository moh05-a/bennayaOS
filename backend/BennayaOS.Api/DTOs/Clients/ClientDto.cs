namespace BennayaOS.Api.DTOs.Clients;

public class ClientDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }

    /// <summary>
    /// How many projects reference this client. The UI uses it to explain why
    /// a client cannot be deleted, instead of just showing an error.
    /// </summary>
    public required int ProjectCount { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
