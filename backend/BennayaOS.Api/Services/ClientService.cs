using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Clients;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

/// <summary>
/// Business logic for clients. The controller stays thin and just maps HTTP.
///
/// Every query below relies on the global company filter in AppDbContext, so
/// none of these methods mention CompanyId when reading. The only place it is
/// written is CreateAsync, and it comes from the JWT - never the request.
/// </summary>
public class ClientService : IClientService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ClientService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<ClientDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _db.Clients
            // AsNoTracking: we are only reading, so EF can skip change-tracking
            // bookkeeping. Measurably faster on list endpoints.
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new ClientDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                // Translated into a SQL subquery, not loaded into memory.
                ProjectCount = c.Projects.Count(),
                CreatedAt = c.CreatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ClientDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var client = await _db.Clients
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new ClientDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                ProjectCount = c.Projects.Count(),
                CreatedAt = c.CreatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        // A client belonging to another company is invisible to this query, so
        // it surfaces as 404 rather than 403. That is deliberate: 403 would
        // confirm the record exists, which leaks information.
        return client ?? throw new NotFoundException("Client not found.");
    }

    public async Task<ClientDto> CreateAsync(CreateClientRequest request, CancellationToken cancellationToken)
    {
        var client = new Client
        {
            Name = request.Name.Trim(),
            Phone = Normalize(request.Phone),
            Email = Normalize(request.Email)?.ToLowerInvariant(),
            // The one place CompanyId is assigned. Taken from the signed token.
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.Clients.Add(client);
        await _db.SaveChangesAsync(cancellationToken);

        return new ClientDto
        {
            Id = client.Id,
            Name = client.Name,
            Phone = client.Phone,
            Email = client.Email,
            ProjectCount = 0,
            CreatedAt = client.CreatedAt,
        };
    }

    public async Task<ClientDto> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken cancellationToken)
    {
        // Tracked (no AsNoTracking) because we intend to modify and save it.
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("Client not found.");

        client.Name = request.Name.Trim();
        client.Phone = Normalize(request.Phone);
        client.Email = Normalize(request.Email)?.ToLowerInvariant();

        await _db.SaveChangesAsync(cancellationToken);

        var projectCount = await _db.Projects.CountAsync(p => p.ClientId == id, cancellationToken);

        return new ClientDto
        {
            Id = client.Id,
            Name = client.Name,
            Phone = client.Phone,
            Email = client.Email,
            ProjectCount = projectCount,
            CreatedAt = client.CreatedAt,
        };
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("Client not found.");

        // The database would reject this anyway (DeleteBehavior.Restrict), but
        // that surfaces as an unreadable Npgsql error. Checking first lets us
        // tell the contractor exactly why, and how many projects are involved.
        var projectCount = await _db.Projects.CountAsync(p => p.ClientId == id, cancellationToken);

        if (projectCount > 0)
        {
            // A template plus argument (not an interpolated string), so the
            // text can be translated before the count is filled in.
            throw new ConflictException(
                "This client has {0} project(s) and cannot be deleted. " +
                "Delete or reassign those projects first.",
                projectCount);
        }

        _db.Clients.Remove(client);
        await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>Turns empty or whitespace-only input into null, so the database holds one representation of "not provided".</summary>
    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
