
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenVendor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("suppliers")]
    public async Task<ActionResult<IEnumerable<SupplierCatalogItemResponse>>> GetSuppliers()
    {
        var suppliers = await _adminService.GetSuppliersAdminAsync();
        return Ok(suppliers);
    }

    [HttpPatch("suppliers/{id}/verify")]
    public async Task<ActionResult<SupplierDetailsResponse>> VerifySupplier([FromRoute] Guid id)
    {
        var response = await _adminService.VerifySupplierAsync(id);
        return Ok(response);
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<PlatformAnalyticsDTO>> GetAnalytics()
    {
        var platformAnalytics = await _adminService.GetAnalyticsAsync();
        return Ok(platformAnalytics);
    }

    [HttpPost("suppliers/{id}/questionnaire")]
    public async Task<IActionResult> CreateQuestionnaire([FromRoute(Name = "id")] Guid supplierid)
    {
        await _adminService.CreateQuestionnaireForSupplierAsync(supplierid);
        return Ok();
    }
}