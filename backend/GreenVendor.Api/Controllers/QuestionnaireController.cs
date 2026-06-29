using GreenVendor.Api.Extensions;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenVendor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Supplier")]
public class QuestionnaireController : ControllerBase
{
    private readonly IQuestionnaireService _questionnaireService;
    private readonly ISupplierService _supplierService;
    public QuestionnaireController(IQuestionnaireService questionnaireService, ISupplierService supplierService)
    {
        _questionnaireService = questionnaireService;
        _supplierService = supplierService;
    }

    [HttpGet("questions")]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestions()
    {
        var questions = await _questionnaireService.GetQuestionsAsync();
        return Ok(questions);
    }

    [HttpGet("my")]
    public async Task<ActionResult<QuestionnaireStatusDTO>> GetMyStatus()
    {
        // var supplier = User.GetUserId();
        var supplierId = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var status = await _questionnaireService.GetMyQuestionnaireStatusAsync(supplierId);

        return Ok(status);
    }

    [HttpPost("submit")]
    public async Task<ActionResult<EsgScoreResultDTO>> SubmitQuestionnaire([FromBody] SubmitQuestionnaireRequest request)
    {
        // var supplier = User.GetUserId();
        var supplierId = await _supplierService.GetMySupplierIdAsync(User.GetUserId());
        var supplierQuestionnaireResult = await _questionnaireService.SubmitQuestionnaireAsync(supplierId, request);
        return Ok(supplierQuestionnaireResult);
    }
} 
