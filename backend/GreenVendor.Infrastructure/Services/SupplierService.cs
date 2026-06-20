namespace GreenVendor.Infrastructure.Services;
using GreenVendor.Application.DTOs;

public class SupplierService : ISupplierService
{
    public Task<List<SupplierCatalogItemResponse>> GetSuppliersQuery(SupplierQuery query)
    {
        var mockSuppliers = new List<SupplierCatalogItemResponse>
        {
            new() { Id = 1, CompanyName = "EcoPack", Industry = "Packaging", Description = "Green packaging", IsVerified = true, LatestEsgScore = 85.5m },
            new() { Id = 2, CompanyName = "BioFuel Co", Industry = "Energy", Description = "Pure biofuel", IsVerified = false, LatestEsgScore = 92.0m }
        };

        return Task.FromResult(mockSuppliers);
    }
}