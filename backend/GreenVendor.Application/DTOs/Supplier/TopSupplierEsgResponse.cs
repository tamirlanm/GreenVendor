namespace GreenVendor.Application.DTOs;

public class TopSupplierEsgResponse
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public bool IsVerified { get; set; }

    public decimal Environmental { get; set; }
    public decimal Social { get; set; }
    public decimal Governance { get; set; }

    public decimal TotalEsgScore { get; set; }
    public string EsgGrade { get; set; } = string.Empty;
    public DateTime CalculatedTime { get; set; }
}