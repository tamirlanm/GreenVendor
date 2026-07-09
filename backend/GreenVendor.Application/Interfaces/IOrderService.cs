using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Interfaces;
public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(Guid buyerId, CreateOrderRequest request);
    Task<PagedResult<ShortOrderResponse>> GetMyOrdersAsync(Guid buyerId, int pageSize, int pageNumber); 
    Task<PagedResult<SupplierOrdersResponse>> GetMySupplierOrdersAsync(Guid supplierId, int pageSize, int pageNumber);
    Task<OrderResponse> UpdateOrderAsync(Guid id, Guid supplierId, UpdateOrderRequest request);
}