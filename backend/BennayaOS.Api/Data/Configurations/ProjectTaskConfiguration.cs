using BennayaOS.Api.Models;
using BennayaOS.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class ProjectTaskConfiguration : IEntityTypeConfiguration<ProjectTask>
{
    public void Configure(EntityTypeBuilder<ProjectTask> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Description).HasMaxLength(2000);

        builder.Property(t => t.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        // Serves both "tasks for this project" and the dashboard's
        // "what is due soon" query.
        builder.HasIndex(t => new { t.ProjectId, t.Status });
        builder.HasIndex(t => t.DueDate);
        builder.HasIndex(t => t.CompanyId);

        builder.HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(t => t.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        var statuses = string.Join(", ", Enum.GetNames<ProjectTaskStatus>().Select(name => $"'{name}'"));

        builder.ToTable(t => t.HasCheckConstraint("ck_project_tasks_status", $"status IN ({statuses})"));
    }
}
