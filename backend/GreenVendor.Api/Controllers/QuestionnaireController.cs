using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GreenVendor.Api.Controllers;

[ApiController]
[Route("api/[contorller]")]
public class QuestionnaireController : ControllerBase
{
    private readonly IQuestionnaireService _questionnaireService;
    public QuestionnaireController(IQuestionnaireService questionnaireService)
    {
        _questionnaireService = questionnaireService;
    }

    [HttpGet("questions")]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestions()
    {
        var questions = await _questionnaireService.GetQuestionsAsync();
        return Ok(questions);
    }

    [HttpGet("my")]
    public async Task<ActionResult<QuestionnaireStatusDTO>> GetMyStatus([FromQuery] string? testStatus = null)
    {
        Guid currentSupplierId = testStatus?.ToLower() == "inprogress" ? Guid.Empty : Guid.NewGuid();

        var status = await _questionnaireService.GetMyQuestionnaireStatusAsync(currentSupplierId);
        if(status is null)
        {
            return NotFound(new {message = "Questionnaire for this supplier not found."});
        }
        return Ok(status);
    }

    [HttpPost("submit")]
    public async Task<ActionResult<EsgScoreResultDTO>> SubmitQuestionnaire(Guid supplierId,[FromBody] SubmitQuestionnaireRequest request)
    {
        var supplierQuestionnaireResult = await _questionnaireService.SubmitQuestionnaireAsync(supplierId, request);
        return Ok(supplierQuestionnaireResult);
    }
} 
