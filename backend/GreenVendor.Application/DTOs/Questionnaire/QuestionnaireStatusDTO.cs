
using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.DTOs;
public class QuestionnaireStatusDTO
{
    public QuestionnaireStatus Status {get;set;}
    public DateTime CreatedAt {get;set;}
    public DateTime? SubmittedAt {get;set;}
    public decimal? TotalScore {get;set;}
    public string? EsgGrade {get;set;}
}