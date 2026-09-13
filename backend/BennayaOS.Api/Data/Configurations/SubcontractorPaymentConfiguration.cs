using BennayaOS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class SubcontractorPaymentConfiguration : IEntityTypeConfiguration<SubcontractorPayment>
{
    public void Configure(EntityTypeBuilder<SubcontractorPayment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Description).HasMaxLength(500);

        builder.HasIndex(p => new { p.SubcontractorId, p.Date });
        builder.HasIndex(p => p.CompanyId);

        builder.HasOne(p => p.Subcontractor)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.SubcontractorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(p => p.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.ToTable(t =>
            t.HasCheckConstraint("ck_subcontractor_payments_amount_positive", "amount > 0"));
    }
}
