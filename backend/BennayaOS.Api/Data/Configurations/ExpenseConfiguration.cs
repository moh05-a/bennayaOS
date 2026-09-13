using BennayaOS.Api.Models;
using BennayaOS.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BennayaOS.Api.Data.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description).HasMaxLength(500);

        builder.Property(e => e.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        // Listing a project's expenses and summing them are the two hottest
        // queries in the product. This composite index serves both, and the
        // Date ordering means the newest-first sort needs no extra sort step.
        builder.HasIndex(e => new { e.ProjectId, e.Date });
        builder.HasIndex(e => e.CompanyId);

        builder.HasOne(e => e.Project)
            .WithMany(p => p.Expenses)
            .HasForeignKey(e => e.ProjectId)
            // An expense has no meaning without its project, so removing the
            // project removes them. The UI warns with a count first.
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Supplier)
            .WithMany(supplier => supplier.Expenses)
            .HasForeignKey(e => e.SupplierId)
            // SetNull, not Restrict: deleting an old supplier must not require
            // editing every historical expense first. The expense itself - the
            // amount, category and date - survives; only the link is cleared.
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.SupplierId);

        // Foreign key to companies WITHOUT a navigation collection on Company.
        // We get referential integrity without Company carrying a list of every
        // expense in the business, which nothing would ever load.
        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(e => e.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        var categories = string.Join(", ", Enum.GetNames<ExpenseCategory>().Select(name => $"'{name}'"));

        builder.ToTable(t =>
        {
            // Strictly greater than zero. A zero or negative expense is always
            // a data-entry bug, and the database refuses it outright.
            t.HasCheckConstraint("ck_expenses_amount_positive", "amount > 0");
            t.HasCheckConstraint("ck_expenses_category", $"category IN ({categories})");
        });
    }
}
