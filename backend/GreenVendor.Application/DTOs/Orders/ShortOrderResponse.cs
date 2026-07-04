namespace GreenVendor.Application.DTOs;
public class ShortOrderResponse
{
    public Guid Id {get;set;}
    public Guid ProductId {get;set;}
    public string Name {get;set;} = string.Empty;
    public decimal Price {get;set;}
    public int Quantity {get;set;}
    public string Status {get;set;} = string.Empty;
    public string CreatedAt {get;set;} = string.Empty;
}