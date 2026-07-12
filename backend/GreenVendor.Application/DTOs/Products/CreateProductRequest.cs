namespace GreenVendor.Application.DTOs;
public class CreateProductRequest
{
    public string Name {get;set;} = string.Empty;
    public string? Description {get;set;}
    public string Category {get;set;} = string.Empty;
    public decimal Price {get;set;}
    public bool IsActive {get;set;}
    public int Quantity {get;set;}
}