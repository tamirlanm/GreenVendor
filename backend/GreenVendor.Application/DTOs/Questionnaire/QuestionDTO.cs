using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.DTOs;
public class QuestionDTO
{
    public int Id {get;set;}
    public string Text {get;set;} = string.Empty;
    public QuestionCategory Category {get;set;}
    public List<string> Options {get;set;} = new();
}