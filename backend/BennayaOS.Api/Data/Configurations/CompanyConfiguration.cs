using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(c => c.Id);

        // Max lengths are a second line of defence. Even if a validation
        // attribute is forgotten, the database refuses oversized input.
        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Phone).HasMaxLength(30);
        builder.Property(c => c.Email).HasMaxLength(256);

        // ISO 4217 codes are always exactly 3 characters.
        builder.Property(c => c.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("JOD");
    }
}
