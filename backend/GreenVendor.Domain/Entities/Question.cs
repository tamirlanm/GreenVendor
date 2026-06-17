using GreenVendor.Domain.Enums;
namespace GreenVendor.Domain.Entities;

public class Question
{
    public int Id {get;set;}
    public string Text {get;set;} = string.Empty;
    public QuestionCategory Category {get;set;}
    public decimal Weight {get;set;}
    public string OptionsJson {get;set;} = string.Empty;
    public bool IsActive {get;set;}
}