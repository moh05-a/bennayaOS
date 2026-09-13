using System.Linq.Expressions;
using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Subcontractors;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public interface ISubcontractorService
{
    Task<SubcontractorListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken);
    Task<SubcontractorDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<SubcontractorDto> CreateAsync(Guid projectId, CreateSubcontractorRequest request, CancellationToken cancellationToken);
    Task<SubcontractorDto> UpdateAsync(Guid id, UpdateSubcontractorRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task<IReadOnlyList<SubcontractorPaymentDto>> GetPaymentsAsync(Guid subcontractorId, CancellationToken cancellationToken);
    Task<SubcontractorPaymentDto> AddPaymentAsync(Guid subcontractorId, CreateSubcontractorPaymentRequest request, CancellationToken cancellationToken);
    Task DeletePaymentAsync(Guid paymentId, CancellationToken cancellationToken);
}

public class SubcontractorService : ISubcontractorService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public SubcontractorService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Stored as an Expression so EF turns the payment sums into SQL subqueries.
    /// A method here would be executed in memory with Payments unloaded.
    /// </summary>
    private static readonly Expression<Func<Subcontractor, SubcontractorDto>> ToDto =
        s => new SubcontractorDto
        {
            Id = s.Id,
            Name = s.Name,
            Phone = s.Phone,
            Specialty = s.Specialty,
            ContractAmount = s.ContractAmount,
            TotalPaid = s.Payments.Sum(p => (decimal?)p.Amount) ?? 0m,
            Remaining = s.ContractAmount - (s.Payments.Sum(p => (decimal?)p.Amount) ?? 0m),
            PaymentCount = s.Payments.Count(),
            ProjectId = s.ProjectId,
            CreatedAt = s.CreatedAt,
        };

    public async Task<SubcontractorListDto> GetForProjectAsync(Guid projectId, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var items = await _db.Subcontractors
            .AsNoTracking()
            .Where(s => s.ProjectId == projectId)
            .OrderBy(s => s.Name)
            .Select(ToDto)
            .ToListAsync(cancellationToken);

        // Summed in SQL rather than over the list above, so these stay correct
        // if this endpoint is ever paginated.
        var totalCommitted = await _db.Subcontractors
            .Where(s => s.ProjectId == projectId)
            .SumAsync(s => (decimal?)s.ContractAmount, cancellationToken) ?? 0m;

        var totalPaid = await _db.SubcontractorPayments
            .Where(p => p.Subcontractor.ProjectId == projectId)
            .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;

        return new SubcontractorListDto
        {
            Items = items,
            TotalCommitted = totalCommitted,
            TotalPaid = totalPaid,
            TotalRemaining = totalCommitted - totalPaid,
        };
    }

    public async Task<SubcontractorDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var subcontractor = await _db.Subcontractors
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync(cancellationToken);

        return subcontractor ?? throw new NotFoundException("Subcontractor not found.");
    }

    public async Task<SubcontractorDto> CreateAsync(Guid projectId, CreateSubcontractorRequest request, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var subcontractor = new Subcontractor
        {
            Name = request.Name.Trim(),
            Phone = Normalize(request.Phone),
            Specialty = Normalize(request.Specialty),
            ContractAmount = request.ContractAmount,
            ProjectId = projectId,
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.Subcontractors.Add(subcontractor);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(subcontractor.Id, cancellationToken);
    }

    public async Task<SubcontractorDto> UpdateAsync(Guid id, UpdateSubcontractorRequest request, CancellationToken cancellationToken)
    {
        var subcontractor = await _db.Subcontractors.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException("Subcontractor not found.");

        subcontractor.Name = request.Name.Trim();
        subcontractor.Phone = Normalize(request.Phone);
        subcontractor.Specialty = Normalize(request.Specialty);
        subcontractor.ContractAmount = request.ContractAmount;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var subcontractor = await _db.Subcontractors.FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException("Subcontractor not found.");

        // Payments cascade with the subcontractor: a payment to someone who is
        // not on the job has no meaning. The UI warns with the count first.
        _db.Subcontractors.Remove(subcontractor);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SubcontractorPaymentDto>> GetPaymentsAsync(Guid subcontractorId, CancellationToken cancellationToken)
    {
        await EnsureSubcontractorExistsAsync(subcontractorId, cancellationToken);

        return await _db.SubcontractorPayments
            .AsNoTracking()
            .Where(p => p.SubcontractorId == subcontractorId)
            .OrderByDescending(p => p.Date)
            .ThenByDescending(p => p.CreatedAt)
            .Select(p => new SubcontractorPaymentDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Date = p.Date,
                Description = p.Description,
                SubcontractorId = p.SubcontractorId,
                CreatedAt = p.CreatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SubcontractorPaymentDto> AddPaymentAsync(Guid subcontractorId, CreateSubcontractorPaymentRequest request, CancellationToken cancellationToken)
    {
        await EnsureSubcontractorExistsAsync(subcontractorId, cancellationToken);

        // Not validated against the remaining balance. Contractors do pay more
        // than the original agreement when scope grows, and refusing it would
        // force them to record something untrue.
        var payment = new SubcontractorPayment
        {
            Amount = request.Amount,
            Date = request.Date,
            Description = Normalize(request.Description),
            SubcontractorId = subcontractorId,
            CompanyId = _currentUser.RequireCompanyId(),
        };

        _db.SubcontractorPayments.Add(payment);
        await _db.SaveChangesAsync(cancellationToken);

        return new SubcontractorPaymentDto
        {
            Id = payment.Id,
            Amount = payment.Amount,
            Date = payment.Date,
            Description = payment.Description,
            SubcontractorId = payment.SubcontractorId,
            CreatedAt = payment.CreatedAt,
        };
    }

    public async Task DeletePaymentAsync(Guid paymentId, CancellationToken cancellationToken)
    {
        var payment = await _db.SubcontractorPayments
            .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");

        _db.SubcontractorPayments.Remove(payment);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureProjectExistsAsync(Guid projectId, CancellationToken cancellationToken)
    {
        if (!await _db.Projects.AnyAsync(p => p.Id == projectId, cancellationToken))
        {
            throw new NotFoundException("Project not found.");
        }
    }

    private async Task EnsureSubcontractorExistsAsync(Guid subcontractorId, CancellationToken cancellationToken)
    {
        if (!await _db.Subcontractors.AnyAsync(s => s.Id == subcontractorId, cancellationToken))
        {
            throw new NotFoundException("Subcontractor not found.");
        }
    }

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
