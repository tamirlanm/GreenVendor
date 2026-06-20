namespace GreenVendor.Application.DTOs;

public class SupplierCatalogItemResponse
{
    public int Id {get;set;}
    public string CompanyName {get;set;} = string.Empty;
    public string Industry {get;set;} = string.Empty;
    public string Description {get;set;} = string.Empty;
    public bool IsVerified {get;set;}
    public decimal? LatestEsgScore {get;set;}

}