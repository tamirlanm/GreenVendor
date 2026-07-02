using Microsoft.AspNetCore.Mvc;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using GreenVendor.Api.Extensions;
namespace GreenVendor.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class SupplierController : ControllerBase
{
    private readonly ISupplierService _supplierService;
    public SupplierController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SupplierCatalogItemResponse>>> GetSuppliers([FromQuery] SupplierQuery query)
    {
        var suppliers = await _supplierService.GetSuppliersQueryAsync(query);
        return Ok(suppliers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDetailsResponse>> GetSupplier([FromRoute] Guid id)
    {
        var response = await _supplierService.GetSupplierDetailsAsync(id);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpGet("me")]
    public async Task<ActionResult<SupplierDetailsResponse>> GetMyProfile()
    {
        // var supplier = User.GetUserId();
        var supplierId = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var response = await _supplierService.GetSupplierDetailsAsync(supplierId);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpPut("me")]
    public async Task<ActionResult<SupplierDetailsResponse>> UpdateMyProfile([FromBody] UpdateSupplierRequest request)
    {
        // var supplier = User.GetUserId();
        var supplierId = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var response = await _supplierService.UpdateSupplierAsync(supplierId, request);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpPost("certificate")]
    public async Task<IActionResult> UploadCertificate([FromForm] IFormFile file)
    {
        var supplierId = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        using var stream = file.OpenReadStream();
        var isUploaded = await _supplierService.UploadCertificateAsync(supplierId, stream, file.FileName);
    
        return Ok(new {message = "Certificate successfully uploaded"});
    }
    
    [Authorize]
    [HttpGet("{supplierId}/certificate")]
    public async Task<IActionResult> GetCertificate(Guid supplierId)
    {
        var supplier = await _supplierService.GetCertificateAsync(supplierId);

        return File(supplier.FileStream, supplier.ContentType, supplier.FileName);
    }
}