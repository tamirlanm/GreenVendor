using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;

namespace GreenVendor.Application.Services;
public class AdminService : IAdminService
{
    public Task<IEnumerable<SupplierCatalogItemResponse>> GetSuppliersAdminAsync()
    {
        var mockSuppliers = new List<SupplierCatalogItemResponse>
        {
            new() { Id = Guid.NewGuid(), CompanyName = "EcoPack", Industry = "Packaging", Description = "Green packaging", IsVerified = true, LatestEsgScore = 85.5m },
            new() { Id = Guid.NewGuid(), CompanyName = "BioFuel Co", Industry = "Energy", Description = "Pure biofuel", IsVerified = false, LatestEsgScore = 92.0m }
        };

        return Task.FromResult<IEnumerable<SupplierCatalogItemResponse>>(mockSuppliers);
    }

    public Task<SupplierDetailsResponse?> VerifySupplierAsync(Guid id)
    {
        var mockSupplier = new SupplierDetailsResponse{
            Id = id,
            CompanyName = "EcoPack",
            Industry = "Packaging",
            Description = "Green packaging",
            IsVerified = false,
            Email = "ecopack@mail.kz",
            Phone = "+7777777777",
            TotalEsgScore = 49,
            EsgGrade = "F"
        };
        return Task.FromResult<SupplierDetailsResponse?>(mockSupplier);
    }

    public Task<PlatformAnalyticsDTO> GetAnalyticsAsync()
    {
        var mockAnalytics = new PlatformAnalyticsDTO
        {
            TotalSuppliers = 150,
            VerifiedSuppliersCount = 95,
            SubmittedQuestionnairesCount = 110,
            AverageEsgScore = 82.3m
        };
        return Task.FromResult<PlatformAnalyticsDTO>(mockAnalytics);
    }
}