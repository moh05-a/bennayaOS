using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BennayaOS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSubcontractors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "subcontractors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    contract_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subcontractors", x => x.id);
                    table.CheckConstraint("ck_subcontractors_contract_amount_non_negative", "contract_amount >= 0");
                    table.ForeignKey(
                        name: "fk_subcontractors_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_subcontractors_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "subcontractor_payments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    subcontractor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subcontractor_payments", x => x.id);
                    table.CheckConstraint("ck_subcontractor_payments_amount_positive", "amount > 0");
                    table.ForeignKey(
                        name: "fk_subcontractor_payments_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_subcontractor_payments_subcontractors_subcontractor_id",
                        column: x => x.subcontractor_id,
                        principalTable: "subcontractors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_subcontractor_payments_company_id",
                table: "subcontractor_payments",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_subcontractor_payments_subcontractor_id_date",
                table: "subcontractor_payments",
                columns: new[] { "subcontractor_id", "date" });

            migrationBuilder.CreateIndex(
                name: "ix_subcontractors_company_id",
                table: "subcontractors",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_subcontractors_project_id",
                table: "subcontractors",
                column: "project_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "subcontractor_payments");

            migrationBuilder.DropTable(
                name: "subcontractors");
        }
    }
}
