namespace GreenVendor.Domain.Entities;

public class EsgScore
{
    public Guid Id {get;set;}
    public Guid SupplierId {get;set;}
    public decimal Environmental {get;set;}
    public decimal Social {get;set;}
    public decimal Governance {get;set;}
    public decimal Total {get;set;}
    public string Grade {get;set;} = string.Empty; // A, B, C, D, F
    public DateTime CalculatedTime {get;set;}
}