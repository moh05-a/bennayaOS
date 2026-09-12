namespace BennayaOS.Api.Models.Enums;

/// <summary>
/// Stored in PostgreSQL as text (see UserConfiguration), so adding or
/// reordering members here can never change the meaning of existing rows.
/// </summary>
public enum UserRole
{
    /// <summary>Created the company. Full access.</summary>
    Owner = 0,

    /// <summary>Belongs to the company with limited access.</summary>
    Employee = 1,

    // Future: ProjectManager, Accountant, SiteEngineer, Viewer
}
