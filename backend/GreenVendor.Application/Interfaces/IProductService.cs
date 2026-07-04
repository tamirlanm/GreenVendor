using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Interfaces;
public interface IProductService
{
    Task<PagedResult<ProductsCatalog>> GetProductsAsync(int pageSize, int pageNumber);
    Task<ProductResponse> GetProductAsync(Guid id);    
    Task<PagedResult<SupplierProductsCatalog>> GetMyProductsAsync(Guid supplierId, int pageSize, int pageNumber);
    Task<ProductResponse?> CreateProductAsync(Guid id, CreateProductRequest request);
    Task<ProductResponse?> UpdateProductAsync(Guid id, Guid supplierId, UpdateProductRequest request);
    Task<bool> DeleteProductAsync(Guid id, Guid supplierId);
}