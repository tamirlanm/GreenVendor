namespace GreenVendor.Infrastructure.Services;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;

public class SupplierService : ISupplierService
{
    public Task<List<SupplierCatalogItemResponse>> GetSuppliersQueryAsync(SupplierQuery query)
    {
        var mockSuppliers = new List<SupplierCatalogItemResponse>
        {
            new() { Id = 1, CompanyName = "EcoPack", Industry = "Packaging", Description = "Green packaging", IsVerified = true, LatestEsgScore = 85.5m },
            new() { Id = 2, CompanyName = "BioFuel Co", Industry = "Energy", Description = "Pure biofuel", IsVerified = false, LatestEsgScore = 92.0m }
        };

        return Task.FromResult(mockSuppliers);
    }
    public Task<SupplierDetailsResponse?> GetSupplierDetailsAsync(Guid id)
    {
        var mockSupplier = new SupplierDetailsResponse
        {
            Id = id,
            CompanyName = "EcoPack",
            Industry = "Packaging",
            Description = "Green packaging",
            IsVerified = true,
            Email = "ecopack@mail.kz",
            Phone = "+7777777777",
            TotalEsgScore = 70,
            EsgGrade = "C"
        };
        return Task.FromResult<SupplierDetailsResponse?>(mockSupplier);
    }
    public Task<SupplierDetailsResponse?> UpdateSupplierAsync(Guid id, UpdateSupplierRequest request)
    {
        var updatedMockSupplier = new SupplierDetailsResponse
        {
            Id = id,
            CompanyName = request.CompanyName,
            Industry = request.Industry,
            Description = request.Description,
            Phone = request.Phone,
            Email = request.Email,

            IsVerified = true,
            TotalEsgScore = 70.0m,
            EsgGrade = "C"
        };
        return Task.FromResult<SupplierDetailsResponse?>(updatedMockSupplier);
    }
    public Task<bool> UploadCertificateAsync(Guid id, Stream fileStream, string fileName)
    {
        return Task.FromResult(true);
    }
}