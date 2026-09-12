namespace BennayaOS.Api.Models;

/// <summary>
/// Marks an entity as belonging to exactly one Company (one tenant).
///
/// This is the backbone of our multi-tenancy. In Phase 3, once we know who the
/// logged-in user is, we will register an EF Core global query filter for every
/// type implementing this interface, so that EVERY query is automatically
/// restricted to the caller's company - even if a developer forgets the
/// Where(x => x.CompanyId == ...) clause.
///
/// Security that depends on remembering something will eventually fail.
/// Security enforced by the type system will not.
/// </summary>
public interface ICompanyOwned
{
    Guid CompanyId { get; set; }
}
