namespace GreenVendor.Application.DTOs;
public class SupplierQuery
{
    public string? CompanyName {get;set;}
    public string? Industry {get;set;}
    public decimal? LatestEsgScore {get;set;}

    public int Page {get;set;} = 1;
    public int PageSize {get;set;} = 6;
}