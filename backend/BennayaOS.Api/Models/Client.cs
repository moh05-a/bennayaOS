namespace BennayaOS.Api.Models;

/// <summary>
/// The contractor's customer - the person or company paying for a project.
/// </summary>
public class Client : ICompanyOwned
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public required string Name { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public ICollection<Project> Projects { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
