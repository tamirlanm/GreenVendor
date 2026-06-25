using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.Extensions.Options;
namespace GreenVendor.Infrastructure.Services;

public class QuestionnaireService : IQuestionnaireService
{
    public Task<IEnumerable<QuestionDTO>> GetQuestionsAsync()
    {
        var questions = new List<QuestionDTO>
        {
            new()
            {
                Id = 1,
                Category = Domain.Enums.QuestionCategory.Environmental,
                Text = "Does your company use renewable energy?",
                Options = new() {"Yes", "No", "In process"}
            },
            new()
            {
                Id = 2,
                Category = Domain.Enums.QuestionCategory.Social,
                Text = "Are employees provided with health insurance?",
                Options = new() {"Yes", "No"}
            },
            new()
            {
                Id = 3,
                Category = Domain.Enums.QuestionCategory.Governance,
                Text = "Does your company have an approved code of business ethics?",
                Options = new() {"Yes", "No"}
            }
        };
        return Task.FromResult<IEnumerable<QuestionDTO>>(questions);
    }
    public Task<QuestionnaireStatusDTO?> GetMyQuestionnaireStatusAsync(Guid supplierId)
    {
        if(supplierId == Guid.Empty)
        {
            return Task.FromResult<QuestionnaireStatusDTO?>(new QuestionnaireStatusDTO
            {
               Status = Domain.Enums.QuestionnaireStatus.InProgress,
               CreatedAt = DateTime.UtcNow.AddDays(-1),
               SubmittedAt = null,
               TotalScore = null, 
               EsgGrade = null 
            });
        }
        return Task.FromResult<QuestionnaireStatusDTO?>(new QuestionnaireStatusDTO
        {
           Status = Domain.Enums.QuestionnaireStatus.Submitted,
           CreatedAt = DateTime.UtcNow.AddDays(-5),
           SubmittedAt = DateTime.UtcNow.AddDays(-4),
           TotalScore = 85.5m,
           EsgGrade = "B" 
        });
    }

    public Task<EsgScoreResultDTO> SubmitQuestionnaireAsync(Guid supplierId, SubmitQuestionnaireRequest request)
    {
        return Task.FromResult(new EsgScoreResultDTO
        {
            TotalScore = 92.3m,
            EsgGrade = "A"
        });
    }

    
}