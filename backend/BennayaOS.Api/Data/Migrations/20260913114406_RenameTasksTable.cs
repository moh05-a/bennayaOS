using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BennayaOS.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameTasksTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_tasks_companies_company_id",
                table: "tasks");

            migrationBuilder.DropForeignKey(
                name: "fk_tasks_projects_project_id",
                table: "tasks");

            migrationBuilder.DropPrimaryKey(
                name: "pk_tasks",
                table: "tasks");

            migrationBuilder.RenameTable(
                name: "tasks",
                newName: "project_tasks");

            migrationBuilder.RenameIndex(
                name: "ix_tasks_project_id_status",
                table: "project_tasks",
                newName: "ix_project_tasks_project_id_status");

            migrationBuilder.RenameIndex(
                name: "ix_tasks_due_date",
                table: "project_tasks",
                newName: "ix_project_tasks_due_date");

            migrationBuilder.RenameIndex(
                name: "ix_tasks_company_id",
                table: "project_tasks",
                newName: "ix_project_tasks_company_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_project_tasks",
                table: "project_tasks",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_project_tasks_companies_company_id",
                table: "project_tasks",
                column: "company_id",
                principalTable: "companies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_project_tasks_projects_project_id",
                table: "project_tasks",
                column: "project_id",
                principalTable: "projects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_project_tasks_companies_company_id",
                table: "project_tasks");

            migrationBuilder.DropForeignKey(
                name: "fk_project_tasks_projects_project_id",
                table: "project_tasks");

            migrationBuilder.DropPrimaryKey(
                name: "pk_project_tasks",
                table: "project_tasks");

            migrationBuilder.RenameTable(
                name: "project_tasks",
                newName: "tasks");

            migrationBuilder.RenameIndex(
                name: "ix_project_tasks_project_id_status",
                table: "tasks",
                newName: "ix_tasks_project_id_status");

            migrationBuilder.RenameIndex(
                name: "ix_project_tasks_due_date",
                table: "tasks",
                newName: "ix_tasks_due_date");

            migrationBuilder.RenameIndex(
                name: "ix_project_tasks_company_id",
                table: "tasks",
                newName: "ix_tasks_company_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_tasks",
                table: "tasks",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_tasks_companies_company_id",
                table: "tasks",
                column: "company_id",
                principalTable: "companies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_tasks_projects_project_id",
                table: "tasks",
                column: "project_id",
                principalTable: "projects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
