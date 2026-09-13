using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class ClientPaymentConfiguration : IEntityTypeConfiguration<ClientPayment>
{
    public void Configure(EntityTypeBuilder<ClientPayment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Description).HasMaxLength(500);

        builder.HasIndex(p => new { p.ProjectId, p.Date });
        builder.HasIndex(p => p.CompanyId);

        builder.HasOne(p => p.Project)
            .WithMany(project => project.ClientPayments)
            .HasForeignKey(p => p.ProjectId)
            // Same reasoning as expenses: a payment is meaningless without its
            // project, and the UI warns with a count before deleting.
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(p => p.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.ToTable(t =>
            t.HasCheckConstraint("ck_client_payments_amount_positive", "amount > 0"));
    }
}
