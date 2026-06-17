
using GreenVendor.Domain.Entities;

public class QuestionnaireAnswer
{
    public Guid Id {get;set;}
    public int QuestionId {get;set;}
    public Question Question {get;set;} = null!;
    public Guid QuestionnaireId {get;set;}
    public Questionnaire Questionnaire {get;set;} =null!;
    public decimal PointsEarned {get;set;}
}