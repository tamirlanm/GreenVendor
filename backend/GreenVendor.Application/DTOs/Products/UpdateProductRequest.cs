namespace GreenVendor.Application.DTOs;
public class UpdateProductRequest
{
    public string Name {get;set;} = string.Empty;
    public string? Description {get;set;} = string.Empty;
    public string Category {get;set;} = string.Empty;
    public decimal Price {get;set;}
    public bool IsActive {get;set;}
}