using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Payments;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public class ClientPaymentService : IClientPaymentService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ClientPaymentService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ClientPaymentListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken)
    {
        // Loads the contract value AND confirms the project belongs to this
        // company, in one query. The global filter supplies the tenant check.
        var contractValue = await _db.Projects
            .Where(p => p.Id == projectId)
            .Select(p => (decimal?)p.ContractValue)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Project not found.");

        var query = _db.ClientPayments.AsNoTracking().Where(p => p.ProjectId == projectId);

        var items = await query
            .OrderByDescending(p => p.Date)
            .ThenByDescending(p => p.CreatedAt)
            .Select(p => new ClientPaymentDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Date = p.Date,
                Description = p.Description,
                ProjectId = p.ProjectId,
                CreatedAt = p.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        // Cast to decimal? because SUM over zero rows is SQL NULL, which would
        // throw when materialized into a non-nullable decimal.
        var totalReceived = await query.SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;

        return new ClientPaymentListDto
        {
            Items = items,
            TotalReceived = totalReceived,
            ContractValue = contractValue,
            // One definition of this formula, on the server. If the frontend
            // computed it too, the two would eventually disagree.
            OutstandingBalance = contractValue - totalReceived,
        };
    }

    public async Task<ClientPaymentDto> CreateAsync(Guid projectId, CreateClientPaymentRequest request, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var payment = new ClientPayment
        {
            Amount = request.Amount,
            Date = request.Date,
            Description = Normalize(request.Description),
            ProjectId = projectId,
            CompanyId = _currentUser.RequireCompanyId(),
        };

        // Deliberately NOT validated against the contract value. Clients do
        // overpay - variation orders, scope changes, paying ahead - and
        // rejecting that would force contractors to record something untrue.
        _db.ClientPayments.Add(payment);
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(payment);
    }

    public async Task<ClientPaymentDto> UpdateAsync(Guid id, UpdateClientPaymentRequest request, CancellationToken cancellationToken)
    {
        var payment = await _db.ClientPayments.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");

        payment.Amount = request.Amount;
        payment.Date = request.Date;
        payment.Description = Normalize(request.Description);

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(payment);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var payment = await _db.ClientPayments.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");

        _db.ClientPayments.Remove(payment);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureProjectExistsAsync(Guid projectId, CancellationToken cancellationToken)
    {
        var exists = await _db.Projects.AnyAsync(p => p.Id == projectId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException("Project not found.");
        }
    }

    private static ClientPaymentDto ToDto(ClientPayment p) => new()
    {
        Id = p.Id,
        Amount = p.Amount,
        Date = p.Date,
        Description = p.Description,
        ProjectId = p.ProjectId,
        CreatedAt = p.CreatedAt,
    };

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
