using BennayaOS.Api.Models;
using BennayaOS.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.FullName).IsRequired().HasMaxLength(150);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);

        // Enum stored as readable text ("Owner") rather than an integer.
        builder.Property(u => u.Role)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        // Email is unique GLOBALLY, not per company. Login takes only an email
        // and a password - there is no "choose your company" step - so two
        // companies sharing an email would make login ambiguous.
        builder.HasIndex(u => u.Email).IsUnique();

        // The text column alone would accept ANY string. This constraint means
        // even a raw SQL script or a future bug cannot store an invalid role.
        // The list is generated from the enum, so adding a member here keeps
        // the constraint in sync automatically (EF detects it as a change).
        var roles = string.Join(", ", Enum.GetNames<UserRole>().Select(name => $"'{name}'"));
        builder.ToTable(t => t.HasCheckConstraint("ck_users_role", $"role IN ({roles})"));

        builder.HasOne(u => u.Company)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CompanyId)
            // Restrict, not Cascade: deleting a company should never silently
            // delete its users as a side effect. Offboarding a tenant must be
            // a deliberate, explicit operation.
            .OnDelete(DeleteBehavior.Restrict);
    }
}
