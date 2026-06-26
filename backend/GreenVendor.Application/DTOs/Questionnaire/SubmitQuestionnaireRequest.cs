namespace GreenVendor.Application.DTOs;
public class SubmitQuestionnaireRequest
{
    public List<UserAnswerDTO> Answers {get;set;} = new();
}