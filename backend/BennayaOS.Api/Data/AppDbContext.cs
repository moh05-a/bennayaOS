using System.Linq.Expressions;
using System.Reflection;
using BennayaOS.Api.Models;
using BennayaOS.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Data;

/// <summary>
/// The single entry point EF Core uses to talk to PostgreSQL.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        // Captured once per request. Guid.Empty when nobody is authenticated,
        // which makes every filtered query return zero rows - failing CLOSED.
        // A null-means-no-filter design would fail open and leak everything.
        CurrentCompanyId = currentUser.CompanyId ?? Guid.Empty;
    }

    /// <summary>
    /// Read by the global query filters below. Public so EF can build the
    /// filter expression against it; there is no setter, so a request cannot
    /// change its own tenant mid-flight.
    /// </summary>
    public Guid CurrentCompanyId { get; }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ClientPayment> ClientPayments => Set<ClientPayment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        ApplyCompanyIsolationFilters(modelBuilder);
    }

    /// <summary>
    /// Adds "WHERE company_id = @currentCompany" to EVERY query against EVERY
    /// entity implementing ICompanyOwned - automatically, by reflection.
    ///
    /// Why reflection instead of writing the filter on each entity: in later
    /// phases we add Expense, Supplier, Subcontractor, ProjectTask, Material
    /// and more. Hand-written filters rely on a developer remembering one line
    /// per entity, and the failure mode of forgetting is a cross-tenant data
    /// leak that no test would obviously catch. Here, simply implementing
    /// ICompanyOwned is enough - isolation is the default, not an add-on.
    ///
    /// Escape hatch: .IgnoreQueryFilters() for the few legitimate cross-tenant
    /// operations (registration and login). It has to be written explicitly,
    /// so it is visible in review.
    /// </summary>
    private void ApplyCompanyIsolationFilters(ModelBuilder modelBuilder)
    {
        // Company is the tenant itself, so it filters on its own Id.
        modelBuilder.Entity<Company>().HasQueryFilter(c => c.Id == CurrentCompanyId);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(ICompanyOwned).IsAssignableFrom(entityType.ClrType))
            {
                continue;
            }

            // Builds: entity => entity.CompanyId == this.CurrentCompanyId
            var parameter = Expression.Parameter(entityType.ClrType, "entity");

            var companyIdProperty = Expression.Property(
                parameter,
                nameof(ICompanyOwned.CompanyId));

            // Reading the property off the context instance (rather than baking
            // in a literal) means EF passes it as a query parameter each time,
            // so one cached model serves every tenant correctly.
            var currentCompanyId = Expression.Property(
                Expression.Constant(this),
                nameof(CurrentCompanyId));

            var filter = Expression.Lambda(
                Expression.Equal(companyIdProperty, currentCompanyId),
                parameter);

            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
        }
    }

    /// <summary>
    /// Money rule: every decimal becomes PostgreSQL numeric(18,3).
    ///   - 18 digits    -> beyond any realistic contract value
    ///   - 3 decimals   -> JOD divides into 1000 fils (12.500 JOD);
    ///                     SAR/AED/QAR need 2 and store losslessly in 3.
    /// Set once so it can never be forgotten on an individual entity.
    /// </summary>
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<decimal>().HavePrecision(18, 3);
        configurationBuilder.Properties<string>().HaveMaxLength(256);
    }
}
