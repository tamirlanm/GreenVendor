using System.Data.Common;
using FluentValidation;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GreenVendor.Application.Services;

public class OrderService : IOrderService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<CreateOrderRequest> _validator;
    public OrderService(IAppDbContext db, IValidator<CreateOrderRequest> validator)
    {
        _db = db;
        _validator = validator;
    }
    public async Task<OrderResponse> CreateOrderAsync(Guid buyerId, CreateOrderRequest request)
    {
        var validatorResult = await _validator.ValidateAsync(request);
        if (!validatorResult.IsValid)
        {
            var error = string.Join($"; ", validatorResult.Errors.Select(e => e.ErrorMessage));
            throw new BadRequestException($"Error validation: {error}");
        }

        var buyer = await _db.BuyerProfiles.FirstOrDefaultAsync(b => b.Id == buyerId);
        if(buyer is null)
        {
            throw new NotFoundException($"Buyer with Id={buyerId} not found.");
        }

        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId);
        if(product is null)
        {
            throw new NotFoundException($"Product with Id={request.ProductId} not found.");
        }

        if (!product.IsActive)
        {
            throw new BadRequestException("This product is no longer available for order.");
        }

        var totalPrice = product.Price * request.Quantity;

        var newOrder = new Order{
            Id = Guid.NewGuid(),
            BuyerId = buyerId,
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            TotalPrice = totalPrice,
            Status = Domain.Enums.OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Product = product,
            Buyer = buyer,
        };

        _db.Orders.Add(newOrder);
        await _db.SaveChangesAsync();

        var response = new OrderResponse
        {
            Id = newOrder.Id,
            BuyerId = newOrder.BuyerId,
            ProductId = newOrder.ProductId,
            ProductName = newOrder.Product.Name,
            Quantity = newOrder.Quantity,
            TotalPrice = newOrder.TotalPrice,
            Status = newOrder.Status.ToString(),
            CreatedAt = newOrder.CreatedAt,
            UpdatedAt = newOrder.UpdatedAt
        };
        
        return response;
    }

    public async Task<PagedResult<ShortOrderResponse>> GetMyOrdersAsync(Guid buyerId, int pageSize, int pageNumber)
    {
        if(pageNumber <= 0) pageNumber = 1;
        if(pageSize <= 0) pageSize = 10;

        var totalItems = await _db.Orders.CountAsync(o => o.BuyerId == buyerId);

        var orders = await _db.Orders.Include(o => o.Product).Where(o => o.BuyerId == buyerId)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize).ToListAsync();

        var mappedItems = orders.Select(o => new ShortOrderResponse
        {
            Id = o.Id,
            ProductId = o.ProductId,
            Name = o.Product.Name,
            Price = o.TotalPrice,
            Quantity = o.Quantity,
            Status = o.Status.ToString(),
            CreatedAt = o.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        }).ToList();

        return new PagedResult<ShortOrderResponse>
        {
            Items = mappedItems,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalItems
        };
    }

    public async Task<PagedResult<SupplierOrdersResponse>> GetMySupplierOrdersAsync(Guid supplierId, int pageSize, int pageNumber)
    {   
        if(pageNumber <= 0) pageNumber = 1;
        if(pageSize <= 0) pageSize = 10;

        var totalItems = await _db.Orders.CountAsync(o => o.Product.SupplierId == supplierId);

        var orders = await _db.Orders.Include(o => o.Product).Where(o => o.Product.SupplierId == supplierId)
            .OrderByDescending(o => o.CreatedAt).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        
        var mappedItems = orders.Select(o => new SupplierOrdersResponse
        {
            Id = o.Id,
            ProductName = o.Product.Name,
            TotalPrice = o.TotalPrice,
            Quantity = o.Quantity,
            Status = o.Status.ToString(),
            CreateAt = o.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        }).ToList();
        
        return new PagedResult<SupplierOrdersResponse>
        {
            Items = mappedItems,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalItems
        };
    }

    public async Task<OrderResponse> UpdateOrderAsync(Guid id, Guid supplierId, UpdateOrderRequest request)
    {
        var order = await _db.Orders.Include(o => o.Product).FirstOrDefaultAsync(o => o.Id == id && o.Product.SupplierId == supplierId);

        if(order is null)
        {
            throw new NotFoundException($"Order not found.");
        }

        if(order.Status != Domain.Enums.OrderStatus.Pending)
        {
            throw new BadRequestException($"Order is already {order.Status} and cannot be changed.");
        }

        if(!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus) 
            || (newStatus != OrderStatus.Confirmed && newStatus != OrderStatus.Rejected))
        {
            throw new BadRequestException("Status must be either 'Confirmed' or 'Rejected'.");
        }

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var response = new OrderResponse
        {
            Id = id,
            BuyerId = order.BuyerId,
            ProductId = order.ProductId,
            ProductName = order.Product.Name,
            Quantity = order.Quantity,
            TotalPrice = order.TotalPrice,
            Status = order.Status.ToString(),
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };

        return response;
    }

}   