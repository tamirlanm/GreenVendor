using GreenVendor.Api.Extensions;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenVendor.Api.Controllers;
[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ISupplierService _supplierService;
    private readonly IBuyerService _buyerService;

    public OrdersController(IOrderService orderService, ISupplierService supplierService, IBuyerService buyerService)
    {
        _orderService = orderService;
        _supplierService = supplierService;
        _buyerService = buyerService;        
    }

    [Authorize(Roles = "Buyer")]
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var buyer = await _buyerService.GetMyBuyerIdAsync(User.GetUserId());
        var response = await _orderService.CreateOrderAsync(buyer, request);
        return Ok(response);
    }

    [Authorize(Roles = "Buyer")]
    [HttpGet("my")]
    public async Task<ActionResult<PagedResult<ShortOrderResponse>>> GetMyOrders([FromQuery] int pageSize, [FromQuery] int pageNumber)
    {
        var buyer = await _buyerService.GetMyBuyerIdAsync(User.GetUserId());
        var response = await _orderService.GetMyOrdersAsync(buyer, pageSize, pageNumber);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpGet("/api/suppliers/me/orders")]
    public async Task<ActionResult<PagedResult<SupplierOrdersResponse>>> GetMySupplierOrders([FromQuery] int pageSize, [FromQuery] int pageNumber)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var response = await _orderService.GetMySupplierOrdersAsync(supplier, pageSize, pageNumber);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpPatch("/api/suppliers/me/orders/{id}")]
    public async Task<ActionResult<OrderResponse>> UpdateOrder(Guid id, [FromBody] UpdateOrderRequest request)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var response = await _orderService.UpdateOrderAsync(id, supplier, request);
        return Ok(response);
    }
}