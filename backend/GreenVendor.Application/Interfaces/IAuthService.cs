using GreenVendor.Application.DTOs;
using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.Interfaces;
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest req);
    Task<AuthResponse> LoginAsync(LoginRequest req);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
}