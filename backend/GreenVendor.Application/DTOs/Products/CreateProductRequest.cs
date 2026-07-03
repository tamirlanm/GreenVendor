
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.DTOs;
public class CreateProductRequest
{
    public Guid SupplierId {get;set;}
    public string Name {get;set;} = string.Empty;
    public string? Description {get;set;} = string.Empty;
    public string Category {get;set;} = string.Empty;
    public decimal Price {get;set;}
    public bool IsActive {get;set;}
    // public DateTime CreatedAt {get;set;}
    public string Supplier {get;set;} = string.Empty;
}