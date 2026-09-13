using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class SubcontractorConfiguration : IEntityTypeConfiguration<Subcontractor>
{
    public void Configure(EntityTypeBuilder<Subcontractor> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Phone).HasMaxLength(30);
        builder.Property(s => s.Specialty).HasMaxLength(100);

        builder.HasIndex(s => s.ProjectId);
        builder.HasIndex(s => s.CompanyId);

        builder.HasOne(s => s.Project)
            .WithMany(p => p.Subcontractors)
            .HasForeignKey(s => s.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(s => s.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.ToTable(t => t.HasCheckConstraint(
            "ck_subcontractors_contract_amount_non_negative",
            "contract_amount >= 0"));
    }
}
