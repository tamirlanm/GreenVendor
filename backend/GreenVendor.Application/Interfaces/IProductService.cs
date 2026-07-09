using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Interfaces;
public interface IProductService
{
    Task<PagedResult<ProductsCatalog>> GetProductsAsync(ProductQuery query);
    Task<ProductResponse> GetProductAsync(Guid id);    
    Task<PagedResult<SupplierProductsCatalog>> GetMyProductsAsync(Guid supplierId, ProductQuery query);
    Task<ProductResponse?> CreateProductAsync(Guid id, CreateProductRequest request);
    Task<ProductResponse?> UpdateProductAsync(Guid id, Guid supplierId, UpdateProductRequest request);
    Task<bool> DeleteProductAsync(Guid id, Guid supplierId);

    Task<ProductResponse> UploadProductPhotoAsync(Guid productId, Guid supplierId, FileDTO file);
    Task<bool> DeleteProductPhotoAsync(Guid productId, Guid supplierId);
}