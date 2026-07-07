using FluentValidation;
using FluentValidation.Results;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using GreenVendor.Application.Services;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
using Moq;

namespace GreenVendor.Tests;

public class ProductServiceTests
{
    private readonly Mock<IValidator<UpdateProductRequest>> _updateValidatorMock;
    private readonly Mock<IValidator<CreateProductRequest>> _createValidatorMock;

    public ProductServiceTests()
    {
        _updateValidatorMock = new Mock<IValidator<UpdateProductRequest>>();
        _updateValidatorMock.Setup(v => v.ValidateAsync(It.IsAny<UpdateProductRequest>(), default))
            .ReturnsAsync(new ValidationResult());
        _createValidatorMock = new Mock<IValidator<CreateProductRequest>>();
        _createValidatorMock.Setup(v => v.ValidateAsync(It.IsAny<CreateProductRequest>(), default))
            .ReturnsAsync(new ValidationResult());
    }

    private ProductService CreateService(GreenVendor.Infrastructure.Data.AppDbContext db)
        => new(db, _updateValidatorMock.Object, _createValidatorMock.Object);

    [Fact]
    public async Task GetProductsAsync_ShouldExcludeProduct_WhenSupplierGradeBelowMinEsgGrade()
    {
        using var db = TestDbContextFactory.Create();
        var goodSupplierId = Guid.NewGuid();
        var badSupplierId = Guid.NewGuid();

        var goodScore = new EsgScore { Id = Guid.NewGuid(), SupplierId = goodSupplierId, Total = 90, Grade = "A", CalculatedTime = DateTime.UtcNow };
        var badScore = new EsgScore { Id = Guid.NewGuid(), SupplierId = badSupplierId, Total = 45, Grade = "D", CalculatedTime = DateTime.UtcNow };

        db.SupplierProfiles.Add(new SupplierProfile { Id = goodSupplierId, UserId = Guid.NewGuid(), CompanyName = "Good Co", Industry = Industry.Other, CreatedAt = DateTime.UtcNow, LatestScore = goodScore });
        db.SupplierProfiles.Add(new SupplierProfile { Id = badSupplierId, UserId = Guid.NewGuid(), CompanyName = "Bad Co", Industry = Industry.Other, CreatedAt = DateTime.UtcNow, LatestScore = badScore });
        db.Products.Add(new Product { Id = Guid.NewGuid(), SupplierId = goodSupplierId, Name = "Good Product", Price = 10, IsActive = true, CreatedAt = DateTime.UtcNow });
        db.Products.Add(new Product { Id = Guid.NewGuid(), SupplierId = badSupplierId, Name = "Bad Product", Price = 10, IsActive = true, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var service = CreateService(db);
        var query = new ProductQuery { MinEsgGrade = "B", Page = 1, PageSize = 10 };

        var result = await service.GetProductsAsync(query);

        Assert.Single(result.Items);
        Assert.Equal("Good Product", result.Items.First().Name);
    }

    [Fact]
    public async Task GetProductsAsync_ShouldExcludeProduct_WhenSupplierHasNoScoreYet()
    {
        using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        db.SupplierProfiles.Add(new SupplierProfile { Id = supplierId, UserId = Guid.NewGuid(), CompanyName = "New Co", Industry = Industry.Other, CreatedAt = DateTime.UtcNow });
        db.Products.Add(new Product { Id = Guid.NewGuid(), SupplierId = supplierId, Name = "Unscored Product", Price = 10, IsActive = true, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var service = CreateService(db);
        var query = new ProductQuery { MinEsgGrade = "F", Page = 1, PageSize = 10 };

        var result = await service.GetProductsAsync(query);

        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task UpdateProductAsync_ShouldThrowNotFoundException_WhenProductBelongsToAnotherSupplier()
    {
        using var db = TestDbContextFactory.Create();
        var actualOwnerId = Guid.NewGuid();
        var strangerId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        db.SupplierProfiles.Add(new SupplierProfile { Id = strangerId, UserId = Guid.NewGuid(), CompanyName = "Stranger Co", Industry = Industry.Other, CreatedAt = DateTime.UtcNow });
        db.Products.Add(new Product { Id = productId, SupplierId = actualOwnerId, Name = "Not Yours", Price = 10, IsActive = true, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var service = CreateService(db);
        var request = new UpdateProductRequest { Name = "Hacked Name", Category = "Other", Price = 999, IsActive = true };

        await Assert.ThrowsAsync<NotFoundException>(() => service.UpdateProductAsync(productId, strangerId, request));
    }
}