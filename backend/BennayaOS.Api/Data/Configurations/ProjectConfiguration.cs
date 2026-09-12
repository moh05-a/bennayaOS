using BennayaOS.Api.Models;
using BennayaOS.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Description).HasMaxLength(2000);
        builder.Property(p => p.Location).HasMaxLength(300);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(p => p.CompanyId);
        builder.HasIndex(p => p.ClientId);

        builder.HasOne(p => p.Client)
            .WithMany(c => c.Projects)
            .HasForeignKey(p => p.ClientId)
            // A client with projects cannot be deleted. This is a real business
            // rule: deleting a client must not erase its financial history.
            // The API will turn this into a friendly error message.
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Company)
            .WithMany(c => c.Projects)
            .HasForeignKey(p => p.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Enforced by PostgreSQL itself. Application validation can be bypassed
        // by a bug, a script, or a future endpoint; the database cannot.
        var statuses = string.Join(", ", Enum.GetNames<ProjectStatus>().Select(name => $"'{name}'"));

        builder.ToTable(t =>
        {
            // Enforced by PostgreSQL itself. Application validation can be
            // bypassed by a bug, a script, or a future endpoint; this cannot.
            t.HasCheckConstraint(
                "ck_projects_contract_value_non_negative",
                "contract_value >= 0");

            // A text column accepts any string on its own. This restricts it to
            // real enum members, generated from the enum so it stays in sync.
            t.HasCheckConstraint("ck_projects_status", $"status IN ({statuses})");
        });
    }
}
