using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Interfaces;
public interface IBuyerService
{
    Task<Guid> GetMyBuyerIdAsync(Guid userId);
    Task<BuyerDetailsResponse?> GetBuyerDetailsAsync(Guid id);
    Task<BuyerDetailsResponse?> UpdateMyBuyerProfileAsync(Guid id, UpdateBuyerRequest request); 
}