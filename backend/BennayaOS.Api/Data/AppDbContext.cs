using System.Reflection;
using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Data;

/// <summary>
/// The single entry point EF Core uses to talk to PostgreSQL.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Each DbSet becomes a table and is the starting point for queries.
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Finds and applies every IEntityTypeConfiguration in this project.
        // Adding a new configuration file is enough - no edit needed here,
        // so this method never becomes a 300-line dumping ground.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    /// <summary>
    /// Global conventions applied to every entity.
    ///
    /// Money rule: every decimal becomes PostgreSQL numeric(18,3).
    ///   - 18 total digits  -> far beyond any realistic contract value
    ///   - 3 decimal places -> JOD divides into 1000 fils (12.500 JOD).
    ///     SAR/AED/QAR need only 2 and store losslessly in 3.
    ///
    /// Setting this once means we can never forget it on an individual entity,
    /// which is how rounding bugs get into financial software.
    /// </summary>
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<decimal>().HavePrecision(18, 3);

        // Any string without an explicit HasMaxLength defaults to 256 instead
        // of unbounded text, so an oversized field can never reach the table.
        configurationBuilder.Properties<string>().HaveMaxLength(256);
    }
}
