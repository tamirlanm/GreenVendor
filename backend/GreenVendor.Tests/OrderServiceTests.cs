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

public class OrderServiceTests
{
    private readonly Mock<IValidator<CreateOrderRequest>> _validatorMock;

    public OrderServiceTests()
    {
        _validatorMock = new Mock<IValidator<CreateOrderRequest>>();
        _validatorMock.Setup(v => v.ValidateAsync(It.IsAny<CreateOrderRequest>(), default))
            .ReturnsAsync(new ValidationResult());   
    }

    private OrderService CreateService(GreenVendor.Infrastructure.Data.AppDbContext db)
        => new(db, _validatorMock.Object);

    [Fact]
    public async Task CreateOrderAsync_ShouldComputeTotalPriceFromDb_NotTrustClient()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var buyerId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        db.BuyerProfiles.Add(new BuyerProfile { Id = buyerId, UserId = Guid.NewGuid(), CompanyName = "Acme", Industry = Industry.Other, CreatedAt = DateTime.UtcNow });
        db.Products.Add(new Product { Id = productId, SupplierId = Guid.NewGuid(), Name = "Widget", Price = 50m, Quantity = 10, IsActive = true, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        var service = CreateService(db);
        var request = new CreateOrderRequest { ProductId = productId, Quantity = 3 };

        // Act
        var result = await service.CreateOrderAsync(buyerId, request);

        Assert.Equal(150m, result.TotalPrice);
        Assert.Equal("Pending", result.Status);
    }

    [Fact]
    public async Task CreateOrderAsync_ShouldThrowBadRequestException_WhenProductIsInactive()
    {
        using var db = TestDbContextFactory.Create();
        var buyerId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        db.BuyerProfiles.Add(new BuyerProfile { Id = buyerId, UserId = Guid.NewGuid(), CompanyName = "Acme", Industry = Industry.Other, CreatedAt = DateTime.UtcNow });
        db.Products.Add(new Product { Id = productId, SupplierId = Guid.NewGuid(), Name = "Widget", Price = 50m, Quantity = 10,IsActive = false, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        var service = CreateService(db);
        var request = new CreateOrderRequest { ProductId = productId, Quantity = 1 };

        await Assert.ThrowsAsync<BadRequestException>(() => service.CreateOrderAsync(buyerId, request));
    }

    [Fact]
    public async Task UpdateOrderAsync_ShouldThrowNotFoundException_WhenSupplierDoesNotOwnProduct()
    {
        using var db = TestDbContextFactory.Create();
        var actualSupplierId = Guid.NewGuid();
        var strangerSupplierId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        db.Products.Add(new Product { Id = productId, SupplierId = actualSupplierId, Name = "Widget", Price = 10m, Quantity = 10, IsActive = true, CreatedAt = DateTime.UtcNow });
        db.Orders.Add(new Order { Id = orderId, BuyerId = Guid.NewGuid(), ProductId = productId, Quantity = 1, TotalPrice = 10m, Status = OrderStatus.Pending, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(
            () => service.UpdateOrderAsync(orderId, strangerSupplierId, new UpdateOrderRequest { Status = "Confirmed" }));
    }

    [Fact]
    public async Task UpdateOrderAsync_ShouldThrowBadRequestException_WhenOrderAlreadyDecided()
    {
        using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        db.Products.Add(new Product { Id = productId, SupplierId = supplierId, Name = "Widget", Price = 10m, Quantity = 10, IsActive = true, CreatedAt = DateTime.UtcNow });
        db.Orders.Add(new Order { Id = orderId, BuyerId = Guid.NewGuid(), ProductId = productId, Quantity = 1, TotalPrice = 10m, Status = OrderStatus.Confirmed, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        var service = CreateService(db);

        await Assert.ThrowsAsync<BadRequestException>(
            () => service.UpdateOrderAsync(orderId, supplierId, new UpdateOrderRequest { Status = "Rejected" }));
    }
}