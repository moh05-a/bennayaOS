using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Phone).HasMaxLength(30);
        builder.Property(c => c.Email).HasMaxLength(256);

        // Every "list the clients" query filters by CompanyId, so it must be
        // indexed or those queries scan the whole table as we add tenants.
        builder.HasIndex(c => c.CompanyId);

        builder.HasOne(c => c.Company)
            .WithMany(co => co.Clients)
            .HasForeignKey(c => c.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
