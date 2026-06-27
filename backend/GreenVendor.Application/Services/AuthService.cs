using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using GreenVendor.Domain.Enums;
using GreenVendor.Application.Configurations;
using GreenVendor.Application.Exceptions;

namespace GreenVendor.Application.Services;
public class AuthService : IAuthService
{
    private readonly IAppDbContext _db;
    private ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;
    public AuthService(IAppDbContext db, ITokenService tokenService, IOptions<JwtSettings> jwtSettings)
    {
        _db = db;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
    }
    public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
    {
        bool emailExists = await _db.Users.AnyAsync(u => u.Email == req.Email);
        if (emailExists)
        {
            throw new BadRequestException("User with this email already exists.");
        }
        
        string passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(req.Password);

        if(!Enum.TryParse<UserRole>(req.Role, true, out var assignedRole))
        {
            assignedRole = UserRole.Buyer;
        }
        if(!Enum.TryParse<Industry>(req.Industry, true, out var industry))
        {
            industry = Industry.Other;
        }

        var newUser = new User
        {
            Id = Guid.NewGuid(),
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

        if(assignedRole == UserRole.Buyer)
        {
            var buyerProfile = new BuyerProfile
            {
                Id = Guid.NewGuid(),
                UserId = newUser.Id,
                CompanyName = req.CompanyName,
                Industry = industry,
                PreferredMinGrade = null,
                CreatedAt = DateTime.UtcNow
            };
            await _db.BuyerProfiles.AddAsync(buyerProfile);
        }
        else if(assignedRole == UserRole.Supplier)
        {
            var supplierProfile = new SupplierProfile
            {
                Id = Guid.NewGuid(),
                UserId = newUser.Id,
                CompanyName = req.CompanyName,
                Industry = industry,
                Description = null,
                CertificatePath = null,
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };
            await _db.SupplierProfiles.AddAsync(supplierProfile);
        }

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
        if(user == null)
        {
            throw new InvalidCredentialException("Invalid username or password");
        }
        ;
        bool isPasswordValid = BCrypt.Net.BCrypt.EnhancedVerify(req.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new InvalidCredentialException("Invalid username or password");
        }
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshTokenDTO = _tokenService.GenerateRefreshToken();
       
        user.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshTokenDTO.Token,
            ExpiresAt = refreshTokenDTO.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        });
        
        //Delete old/retired tokens of users
        var expiredTokens = user.RefreshTokens.Where(t => t.ExpiresAt <= DateTime.UtcNow).ToList();
        foreach(var expiredToken in expiredTokens)
        {
            user.RefreshTokens.Remove(expiredToken);
        }
        await _db.SaveChangesAsync();
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenDTO.Token,
            Role = user.Role
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var user = await _db.Users.Include(u => u.RefreshTokens).
        FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken));

        if(user == null)
        {
            throw new InvalidCredentialException("Invalid refresh token.");    
        }
        
        var storedToken = user.RefreshTokens.FirstOrDefault(t => t.Token == refreshToken);
        if(storedToken == null || storedToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new InvalidCredentialException("Refresh token has expired or is invalid.");
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