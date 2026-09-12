using BennayaOS.Api.Data;
using BennayaOS.Api.DTOs.Auth;
using BennayaOS.Api.Exceptions;
using BennayaOS.Api.Models;
using BennayaOS.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext db,
        IPasswordHasher<User> passwordHasher,
        ITokenService tokenService,
        ILogger<AuthService> logger)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);

        // IgnoreQueryFilters is REQUIRED here. The global tenant filter would
        // otherwise restrict this lookup to the caller's company - and during
        // registration there is no caller yet, so it would find nothing and we
        // would allow a duplicate email that the unique index then rejects with
        // an ugly 500.
        var emailTaken = await _db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == email, cancellationToken);

        if (emailTaken)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var company = new Company
        {
            Name = request.CompanyName.Trim(),
            CurrencyCode = request.CurrencyCode.ToUpperInvariant(),
        };

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            // Assigned below - the hasher needs the User instance.
            PasswordHash = string.Empty,
            // Whoever registers creates the company, so they are its Owner.
            Role = UserRole.Owner,
            CompanyId = company.Id,
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _db.Companies.Add(company);
        _db.Users.Add(user);

        // One SaveChanges = one transaction. We can never end up with a company
        // that has no owner, or a user with no company.
        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Registered company {CompanyId} with owner {UserId}", company.Id, user.Id);

        return BuildResponse(user, company);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);

        // IgnoreQueryFilters again: at login time nobody is authenticated yet,
        // so there is no company to filter by.
        var user = await _db.Users
            .IgnoreQueryFilters()
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null)
        {
            // Deliberately the SAME message as a wrong password. Saying "no such
            // user" would let an attacker discover which emails are registered.
            throw new UnauthorizedException("Invalid email or password.");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        // The hash was made with an older algorithm or iteration count. Upgrade
        // it transparently now that we hold the plaintext password.
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            await _db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Upgraded password hash for user {UserId}", user.Id);
        }

        return BuildResponse(user, user.Company);
    }

    /// <summary>
    /// Lower-cased and trimmed. Email is case-insensitive in practice, so
    /// normalizing on write lets the unique index enforce uniqueness instead
    /// of scattered application checks.
    /// </summary>
    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private AuthResponse BuildResponse(User user, Company company)
    {
        var (token, expiresAt) = _tokenService.CreateToken(user);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new AuthUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
            },
            Company = new AuthCompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                CurrencyCode = company.CurrencyCode,
            },
        };
    }
}
