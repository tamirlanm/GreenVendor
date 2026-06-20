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
    public async Task<ActionResult<List<SupplierCatalogItemResponse>>> GetSuppliersAsync([FromQuery] SupplierQuery query)
    {
        var suppliers = await _supplierService.GetSuppliersQuery(query);
        return Ok(suppliers);
    }

}