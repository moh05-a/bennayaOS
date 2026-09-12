using BennayaOS.Api.Models;

namespace BennayaOS.Api.Services;

public interface ITokenService
{
    (string Token, DateTimeOffset ExpiresAt) CreateToken(User user);
}
