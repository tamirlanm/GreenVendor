namespace GreenVendor.Application.DTOs;
public class EsgScoreResult
{
    public decimal Environmental {get;set;}
    public decimal Social {get;set;}
    public decimal Governance {get;set;}
    public decimal Total {get;set;}
    public string Grade {get;set;} = string.Empty;
}