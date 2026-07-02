
using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Interfaces;
public interface IQuestionnaireService
{
    Task<IEnumerable<QuestionDTO>> GetQuestionsAsync();
    Task<QuestionnaireStatusDTO?> GetMyQuestionnaireStatusAsync(Guid supplierId);
    Task<EsgScoreResultDTO> SubmitQuestionnaireAsync(Guid supplierId, SubmitQuestionnaireRequest request);

    //for adminService
    Task CreateQuestionnaireAsync(Guid supplierId);
}