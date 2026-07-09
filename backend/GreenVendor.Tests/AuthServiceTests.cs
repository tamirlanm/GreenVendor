using GreenVendor.Application.Configurations;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using GreenVendor.Application.Services;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
using GreenVendor.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;

namespace GreenVendor.Tests;
public class AuthServiceTests
{
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly IOptions<JwtSettings> _jwtSettings;
    public AuthServiceTests()
    {
        _tokenServiceMock = new Mock<ITokenService>();
        _jwtSettings = Options.Create(new JwtSettings
        {
            Secret = "test-secret-key-long-enough-1234567890",
            Issuer = "test",
            Audience = "test",
            ExpiryMinutes = 15,
            RefreshTokenExpiryDays = 7
        });
    
        _tokenServiceMock.Setup(t => t.GenerateAccessToken(It.IsAny<User>())).Returns("fake-access-token");
        _tokenServiceMock.Setup(t => t.GenerateRefreshToken()).Returns(new RefreshTokenDTO {Token = "fake-refresh-token", ExpiresAt = DateTime.UtcNow.AddDays(7)});
    }

    private AuthService CreateService(AppDbContext db) => new(db, _tokenServiceMock.Object, _jwtSettings);

    [Fact]
    public async Task RegisterAsync_ShouldThrowBadRequestException_WhenEmailAlreadyExists()
    {
        using var db = TestDbContextFactory.Create();
        db.Users.Add(new User {Id = Guid.NewGuid(), Email = "taken@test.com", PasswordHash = "hash", Role = Domain.Enums.UserRole.Buyer, CreatedAt = DateTime.UtcNow});
        await db.SaveChangesAsync();

        var service = CreateService(db);
        var request = new RegisterRequest {Email = "taken@test.com", Password = "Pass123!", Role = "Buyer", CompanyName = "Acme", Industry = "Technology"};

        await Assert.ThrowsAsync<BadRequestException>(() => service.RegisterAsync(request));
    }


    [Fact]
     public async Task RegisterAsync_ShouldCreateBuyerProfile_WhenRoleIsBuyer()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var request = new RegisterRequest { Email = "buyer@test.com", Password = "Pass123!", Role = "Buyer", CompanyName = "Acme", Industry = "Technology" };

        var result = await service.RegisterAsync(request);

        Assert.Equal(UserRole.Buyer, result.Role);
        Assert.Equal(1, await db.BuyerProfiles.CountAsync());
        Assert.Equal(0, await db.SupplierProfiles.CountAsync());
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreateSupplierProfile_WhenRoleIsSupplier()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var request = new RegisterRequest { Email = "supplier@test.com", Password = "Pass123!", Role = "Supplier", CompanyName = "EcoCorp", Industry = "Manufacturing" };

        var result = await service.RegisterAsync(request);

        Assert.Equal(UserRole.Supplier, result.Role);
        Assert.Equal(1, await db.SupplierProfiles.CountAsync());
        Assert.Equal(0, await db.BuyerProfiles.CountAsync());
    }

    [Fact]
    public async Task RegisterAsync_ShouldHashPassword_NotStoreItInPlainText()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var request = new RegisterRequest { Email = "secure@test.com", Password = "PlainPass123!", Role = "Buyer", CompanyName = "Acme", Industry = "Technology" };

        await service.RegisterAsync(request);
        var storedUser = await db.Users.FirstAsync(u => u.Email == "secure@test.com");

        Assert.NotEqual("PlainPass123!", storedUser.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.EnhancedVerify("PlainPass123!", storedUser.PasswordHash));
    }


    [Fact]
    public async Task LoginAsync_ShouldThrowInvalidCredentialException_WhenUserNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var request = new LoginRequest { Email = "ghost@test.com", Password = "whatever" };

        await Assert.ThrowsAsync<InvalidCredentialException>(() => service.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowInvalidCredentialException_WhenPasswordIsWrong()
    {
        using var db = TestDbContextFactory.Create();
        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("CorrectPass1!"),
            Role = UserRole.Buyer,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = CreateService(db);
        var request = new LoginRequest { Email = "user@test.com", Password = "WrongPassword" };

        await Assert.ThrowsAsync<InvalidCredentialException>(() => service.LoginAsync(request));
    }



    [Fact]
    public async Task RefreshTokenAsync_ShouldThrowInvalidCredentialException_WhenTokenNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);

        await Assert.ThrowsAsync<InvalidCredentialException>(() => service.RefreshTokenAsync("does-not-exist"));
    }
} 