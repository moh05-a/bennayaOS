using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BennayaOS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEnumCheckConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "ck_users_role",
                table: "users",
                sql: "role IN ('Owner', 'Employee')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_projects_status",
                table: "projects",
                sql: "status IN ('Planning', 'Active', 'OnHold', 'Completed', 'Cancelled')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_users_role",
                table: "users");

            migrationBuilder.DropCheckConstraint(
                name: "ck_projects_status",
                table: "projects");
        }
    }
}
