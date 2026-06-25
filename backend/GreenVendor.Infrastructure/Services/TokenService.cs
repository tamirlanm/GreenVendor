using System.Security.Claims;
using GreenVendor.Application.Interfaces;
using GreenVendor.Application.Configurations;
using GreenVendor.Domain.Entities;
using GreenVendor.Infrastructure.Data;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Cryptography;
using System.Buffers.Text;
using GreenVendor.Application.DTOs;

namespace GreenVendor.Infrastructure.Services;
public class TokenService : ITokenService
{
    private readonly AppDbContext _db;
    private readonly JwtSettings _jwtSettings;
    public TokenService(AppDbContext db, IOptions<JwtSettings> jwtsettings)
    {
        _db = db;
        _jwtSettings = jwtsettings.Value;
    }
    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        var handler = new JsonWebTokenHandler();

        var token = new SecurityTokenDescriptor{
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            Subject = new ClaimsIdentity(claims),
            Expires =  DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            SigningCredentials = creds
        };
        return handler.CreateToken(token);
    }   
    public RefreshTokenDTO GenerateRefreshToken()
    {
        var randomNumber = RandomNumberGenerator.GetBytes(64);
        var tokenString = Base64Url.EncodeToString(randomNumber);
        var expiryDays = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);
        return new RefreshTokenDTO
        {
            Token = tokenString,
            ExpiresAt = expiryDays
        };
    }
}