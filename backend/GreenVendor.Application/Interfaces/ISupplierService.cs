using GreenVendor.Application.DTOs;

public interface ISupplierService
{
    Task<List<SupplierCatalogItemResponse>> GetSuppliersQueryAsync(SupplierQuery query);
    Task<SupplierDetailsResponse?> GetSupplierDetailsAsync(Guid id);
    Task<SupplierDetailsResponse?> UpdateSupplierAsync(Guid id, UpdateSupplierRequest request);
    Task<bool> UploadCertificateAsync(Guid id, Stream fileStream, string fileName);
}