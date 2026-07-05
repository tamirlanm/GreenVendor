namespace GreenVendor.Application.DTOs;
public class ProductQuery
{
    public string? Name {get;set;}
    public string? Category {get;set;}
    public decimal? MaxPrice {get;set;}
    public decimal? MinPrice {get;set;}
    public string? MinEsgGrade {get;set;}

    public int Page {get;set;} = 1;
    public int PageSize {get;set;} = 6;
}