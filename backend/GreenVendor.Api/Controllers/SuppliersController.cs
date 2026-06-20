using Microsoft.AspNetCore.Mvc;
using GreenVendor.Application.DTOs;

namespace GreenVendor.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;
    public SuppliersController(ISupplierService supplierService)
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
        if(response is null)
        {
            return NotFound(new {message = $"Supplier with Id={id} not found."});
        }
        return Ok(response);
    }

    [HttpGet("me")]
    public async Task<ActionResult<SupplierDetailsResponse>> GetMyProfile()
    {
        Guid currentSupplierId = Guid.NewGuid();
        var response = await _supplierService.GetSupplierDetailsAsync(currentSupplierId);
        return Ok(response);
    }

    [HttpPut("me")]
    public async Task<ActionResult<SupplierDetailsResponse>> UpdateMyProfile([FromBody] UpdateSupplierRequest request)
    {
        Guid currentSupplierId = Guid.NewGuid();
        var response = await _supplierService.UpdateSupplierAsync(currentSupplierId,request);
        if(response is null)
        {
            return NotFound(new {message = $"Supplier not found."});
        }
        return Ok(response);
    }

    [HttpPost("submit")]
    public async Task<ActionResult> UploadCertificate([FromForm] IFormFile file)
    {
        if(file == null || file.Length == 0)
        {
            return BadRequest(new {message = "File certificate not selected or empty."});
        }
        Guid currentSupplierId = Guid.NewGuid();

        using var stream = file.OpenReadStream();
        var isUploaded = await _supplierService.UploadCertificateAsync(currentSupplierId, stream, file.FileName);
        if (!isUploaded)
        {
            return BadRequest(new {message = "Couldn't upload certificate."});
        }
        return Ok(new {message = "Certificate successfully uploaded"});
    }
}