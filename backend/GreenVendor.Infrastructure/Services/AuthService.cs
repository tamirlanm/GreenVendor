using System.ComponentModel.DataAnnotations;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using GreenVendor.Application.JwtSettings;
using GreenVendor.Domain.Entities;
using GreenVendor.Infrastructure.Data;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using GreenVendor.Domain.Enums;

namespace GreenVendor.Infrastructure.Services;
public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;
    public AuthService(AppDbContext db, ITokenService tokenService, IOptions<JwtSettings> jwtSettings)
    {
        _db = db;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
    }
    public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
    {
        bool emailExists = await _db.Users.AnyAsync(u => u.Email == req.Email);
        if(emailExists) return null!;
        
        string passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(req.Password);

        if(!Enum.TryParse<UserRole>(req.Role, true, out var assignedRole))
        {
            assignedRole = UserRole.Buyer;
        }
        var newUser = new User
        {
            Email = req.Email,
            PasswordHash = passwordHash,
            Role = assignedRole,
            CreatedAt = DateTime.UtcNow
        };
        
        var accessToken = _tokenService.GenerateAccessToken(newUser);
        var refreshTokenDTO = _tokenService.GenerateRefreshToken();
        
        newUser.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshTokenDTO.Token,
            ExpiresAt = refreshTokenDTO.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        });

        await _db.Users.AddAsync(newUser);
        await _db.SaveChangesAsync();
        await _db.SaveChangesAsync();
        
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenDTO.Token,
            Role = newUser.Role
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req)
    {
        var user = await _db.Users.Include(u => u.RefreshTokens).FirstOrDefaultAsync(u => u.Email == req.Email);
        if(user == null) return null!;
        bool isPasswordValid = BCrypt.Net.BCrypt.EnhancedVerify(req.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return null!;
        }
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshTokenDTO = _tokenService.GenerateRefreshToken();
       
        user.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshTokenDTO.Token,
            ExpiresAt = refreshTokenDTO.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        });
        /*
        //Delete old/retired tokens of users
        var expiredTokens = user.RefreshTokens.Where(t => t.ExpiresAt <= DateTime.UtcNow).ToList();
        foreach(var expiredToken in expiredTokens)
        {
            user.RefreshTokens.Remove(expiredToken);
        }*/
        await _db.SaveChangesAsync();
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenDTO.Token,
            Role = user.Role
        };
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        var user = await _db.Users.Include(u => u.RefreshTokens).
        FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken));

        if(user == null) return null;
        var storedToken = user.RefreshTokens.FirstOrDefault(t => t.Token == refreshToken);
        if(storedToken == null || storedToken.ExpiresAt <= DateTime.UtcNow)
        {
            return null;
        }
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshTokenDTO = _tokenService.GenerateRefreshToken();
        user.RefreshTokens.Remove(storedToken);
        user.RefreshTokens.Add(new RefreshToken
        {
            Token = newRefreshTokenDTO.Token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = newRefreshTokenDTO.ExpiresAt
        });

        await _db.SaveChangesAsync();
        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshTokenDTO.Token,
            Role = user.Role
        };
    }
}   