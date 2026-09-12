using System.ComponentModel.DataAnnotations;

namespace BennayaOS.Api.DTOs.Clients;

/// <summary>
/// Note what is absent: CompanyId. The server takes it from the JWT.
/// Accepting it here would let any contractor create records inside another
/// company by changing one field in the request body.
/// </summary>
public class CreateClientRequest
{
    [Required(ErrorMessage = "Client name is required.")]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Enter a valid phone number.")]
    [StringLength(30)]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(256)]
    public string? Email { get; set; }
}
