using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Interfaces;
public interface IAdminService
{
    Task<IEnumerable<SupplierCatalogItemResponse>> GetSuppliersAdminAsync();
    Task<SupplierDetailsResponse?> VerifySupplierAsync(Guid id);
    Task<PlatformAnalyticsDTO> GetAnalyticsAsync();
}