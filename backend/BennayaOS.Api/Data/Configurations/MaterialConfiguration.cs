using BennayaOS.Api.Models;
using BennayaOS.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name).IsRequired().HasMaxLength(200);

        builder.Property(m => m.Unit)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(m => m.ProjectId);
        builder.HasIndex(m => m.CompanyId);

        builder.HasOne(m => m.Project)
            .WithMany(p => p.Materials)
            .HasForeignKey(m => m.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(m => m.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        var units = string.Join(", ", Enum.GetNames<MaterialUnit>().Select(name => $"'{name}'"));

        builder.ToTable(t =>
        {
            // Quantities may be zero but never negative. "Used 5 bags" and
            // "used -5 bags" are not both meaningful; the second is always a bug.
            t.HasCheckConstraint("ck_materials_quantities_non_negative",
                "required_quantity >= 0 AND purchased_quantity >= 0 AND used_quantity >= 0");
            t.HasCheckConstraint("ck_materials_unit_cost_non_negative", "estimated_unit_cost >= 0");
            t.HasCheckConstraint("ck_materials_unit", $"unit IN ({units})");
        });
    }
}
