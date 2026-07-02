using GreenVendor.Api.Extensions;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenVendor.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Buyer")]
public class BuyerController : ControllerBase
{
    private readonly IBuyerService _buyerService;
    public BuyerController(IBuyerService buyerService)
    {
        _buyerService = buyerService;
    }


    [HttpGet("me")]
    public async Task<ActionResult<BuyerDetailsResponse>> GetMyProfile()
    {
        var buyer = await _buyerService.GetMyBuyerIdAsync(User.GetUserId());
        var response = await _buyerService.GetBuyerDetailsAsync(buyer);
        return Ok(response);
    }
    
    [HttpPut("me")]
    public async Task<ActionResult<BuyerDetailsResponse>> UpdateMyProfile([FromBody] UpdateBuyerRequest request)
    {
        var buyer = await _buyerService.GetMyBuyerIdAsync(User.GetUserId());
        var response = await _buyerService.UpdateMyBuyerProfileAsync(buyer,request);
        return Ok(response);
    }
}