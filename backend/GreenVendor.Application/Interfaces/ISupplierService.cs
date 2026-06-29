using GreenVendor.Application.DTOs;
namespace GreenVendor.Application.Interfaces;
public interface ISupplierService
{
    Task<IEnumerable<SupplierCatalogItemResponse>> GetSuppliersQueryAsync(SupplierQuery query);
    Task<SupplierDetailsResponse?> GetSupplierDetailsAsync(Guid id);
    Task<Guid> GetMySupplierIdAsync(Guid userId);
    Task<SupplierDetailsResponse?> UpdateSupplierAsync(Guid id, UpdateSupplierRequest request);
    Task<bool> UploadCertificateAsync(Guid id, Stream fileStream, string fileName);
    Task<(Stream FileStream, string ContentType, string FileName)> GetCertificateAsync(Guid supplierId);
}