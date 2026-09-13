using System.Linq.Expressions;
using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Projects;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ProjectService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _db.Projects
            .AsNoTracking()
            // Newest first: a contractor cares about what they just created.
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Location = p.Location,
                ContractValue = p.ContractValue,
                StartDate = p.StartDate,
                ExpectedEndDate = p.ExpectedEndDate,
                Status = p.Status,
                ClientId = p.ClientId,
                // Becomes a SQL JOIN, not a second round trip per row.
                ClientName = p.Client.Name,
                CreatedAt = p.CreatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ProjectDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var project = await _db.Projects
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(ToDetailDto)
            .FirstOrDefaultAsync(cancellationToken);

        return project ?? throw new NotFoundException("Project not found.");
    }

    public async Task<ProjectDetailDto> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        // Confirms the client exists AND belongs to this company. The global
        // query filter means a client id from another tenant simply is not
        // found here - so a contractor cannot attach a project to a rival's
        // client by guessing an id.
        await EnsureClientBelongsToCompanyAsync(request.ClientId, cancellationToken);

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = Normalize(request.Description),
            Location = Normalize(request.Location),
            ContractValue = request.ContractValue,
            StartDate = request.StartDate,
            ExpectedEndDate = request.ExpectedEndDate,
            Status = request.Status,
            ClientId = request.ClientId,
            // From the signed token, never from the request body.
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(project.Id, cancellationToken);
    }

    public async Task<ProjectDetailDto> UpdateAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Project not found.");

        // Re-checked on every update, because the client can be changed here.
        await EnsureClientBelongsToCompanyAsync(request.ClientId, cancellationToken);

        project.Name = request.Name.Trim();
        project.Description = Normalize(request.Description);
        project.Location = Normalize(request.Location);
        project.ContractValue = request.ContractValue;
        project.StartDate = request.StartDate;
        project.ExpectedEndDate = request.ExpectedEndDate;
        project.Status = request.Status;
        project.ClientId = request.ClientId;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(project.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Project not found.");

        // From Phase 6 onwards this will also need to refuse (or cascade)
        // when expenses and payments exist. Nothing references a project yet.
        _db.Projects.Remove(project);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureClientBelongsToCompanyAsync(Guid clientId, CancellationToken cancellationToken)
    {
        var exists = await _db.Clients.AnyAsync(c => c.Id == clientId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException("The selected client was not found.");
        }
    }

    /// <summary>
    /// Stored as an Expression, NOT a method.
    ///
    /// A method call inside .Select() cannot be translated to SQL: EF loads the
    /// entity and runs the method in memory, where p.Client is null unless it
    /// was explicitly Included - a NullReferenceException at runtime.
    /// An Expression tree, by contrast, EF can read and turn into a real JOIN.
    /// </summary>
    private static readonly Expression<Func<Project, ProjectDetailDto>> ToDetailDto =
        p => new ProjectDetailDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Location = p.Location,
            ContractValue = p.ContractValue,
            StartDate = p.StartDate,
            ExpectedEndDate = p.ExpectedEndDate,
            Status = p.Status,
            ClientId = p.ClientId,
            ClientName = p.Client.Name,
            ClientPhone = p.Client.Phone,
            // Translated into SQL aggregates over the expenses table, not
            // loaded into memory and added up in C#.
            TotalExpenses = p.Expenses.Sum(e => (decimal?)e.Amount) ?? 0m,
            ExpenseCount = p.Expenses.Count(),
            CreatedAt = p.CreatedAt,
        };

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
