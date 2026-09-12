using Microsoft.EntityFrameworkCore;

namespace BennayaOS.Api.Data;

/// <summary>
/// The single entry point EF Core uses to talk to PostgreSQL.
/// Entity sets (Companies, Users, Projects, ...) are added in Phase 2.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Global conventions applied to every entity we will ever add.
    ///
    /// Money rule: every decimal property in the whole system becomes
    /// PostgreSQL numeric(18,3).
    ///   - 18 total digits  -> up to 999,999,999,999,999.999 (far beyond any contract value)
    ///   - 3 decimal places -> JOD uses 3 fils decimals (1.000 JOD).
    ///     SAR/AED/QAR only need 2, and 3 stores those without loss.
    ///
    /// Setting this once here means we can never forget it on an individual
    /// entity later, which is how rounding bugs get into financial software.
    /// </summary>
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<decimal>().HavePrecision(18, 3);
    }
}
