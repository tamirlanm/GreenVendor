using GreenVendor.Application.DTOs;
using GreenVendor.Domain.Entities;

namespace GreenVendor.Application.Interfaces;
public interface ITokenService
{
    string GenerateAccessToken(User user);
    RefreshTokenDTO GenerateRefreshToken();
}