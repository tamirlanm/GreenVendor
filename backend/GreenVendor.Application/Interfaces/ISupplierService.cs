
using GreenVendor.Application.DTOs;

public interface ISupplierService
{
    Task<List<SupplierCatalogItemResponse>> GetSuppliersQuery(SupplierQuery query);
}