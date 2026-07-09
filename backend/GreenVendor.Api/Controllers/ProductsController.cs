using GreenVendor.Api.Extensions;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenVendor.Api.Controllers;
[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ISupplierService _supplierService;
    public ProductsController(IProductService productService, ISupplierService supplierService)
    {
        _productService = productService;
        _supplierService = supplierService;
    }   

    [Authorize(Roles = "Buyer")]
    [HttpGet("")]
    public async Task<ActionResult<PagedResult<ProductsCatalog>>> GetProducts([FromQuery] ProductQuery query)
    {
        var response = await _productService.GetProductsAsync(query);
        return Ok(response);
    }

    [Authorize(Roles = "Buyer")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetProduct(Guid id)
    {
        var response = await _productService.GetProductAsync(id);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpGet("/api/suppliers/me/products")]
    public async Task<ActionResult<SupplierProductsCatalog>> GetMyProducts([FromQuery] ProductQuery query)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var response = await _productService.GetMyProductsAsync(supplier, query);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpPost("/api/suppliers/me/products")]
    public async Task<ActionResult<ProductResponse>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var response = await _productService.CreateProductAsync(supplier, request);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpPut("/api/suppliers/me/products/{id}")]
    public async Task<ActionResult<ProductResponse>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var response = await _productService.UpdateProductAsync( id, supplier, request);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpDelete("/api/suppliers/me/products/{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        await _productService.DeleteProductAsync(id, supplier);
        return NoContent();
    }

    [Authorize(Roles = "Supplier")]
    [HttpPost("/api/suppliers/me/products/{id}/photo")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5*1024*1024)]
    public async Task<ActionResult<ProductResponse>> UploadProductImage(Guid id, [FromForm] IFormFile image)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var file = new FileDTO
        {
            Content = image.OpenReadStream(),
            FileName = image.FileName,
            ContentType = image.ContentType,
            Size = image.Length
        };

        var response = await _productService.UploadProductPhotoAsync(id, supplier, file);
        return Ok(response);
    }

    [Authorize(Roles = "Supplier")]
    [HttpDelete("/api/suppliers/me/products/{id}/photo")]
    public async Task<IActionResult> DeleteProductPhoto(Guid id)
    {
        var supplier = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        await _productService.DeleteProductPhotoAsync(id, supplier);
        return NoContent();
    }
}