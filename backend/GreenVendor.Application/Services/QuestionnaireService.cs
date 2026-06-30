using System.Text.Json;
using GreenVendor.Domain.Entities;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using GreenVendor.Domain.Enums;
namespace GreenVendor.Infrastructure.Services;

public class QuestionnaireService : IQuestionnaireService
{
    private readonly IEsgScoringService _esgScoringService;
    private readonly IAppDbContext _db;
    public QuestionnaireService(IAppDbContext db, IEsgScoringService esgScoringSerivce)
    {
        _db = db;
        _esgScoringService = esgScoringSerivce;
    }

    public async Task<IEnumerable<QuestionDTO>> GetQuestionsAsync()
    {
        var questions = await _db.Questions.Where(q => q.IsActive).ToListAsync();
        var jsonOptions = new JsonSerializerOptions {PropertyNameCaseInsensitive = true};
        
        return questions.Select(question => new QuestionDTO
        {
            Id = question.Id,
            Text = question.Text,
            Category = question.Category,
            
            Options = string.IsNullOrWhiteSpace(question.OptionsJson)
                ? new List<string>() : JsonSerializer.Deserialize<List<OptionItem>>(question.OptionsJson, jsonOptions)?
                    .Select(o => o.Text).ToList() ?? new List<string>()
        }).ToList();
    }

    public async Task<QuestionnaireStatusDTO?> GetMyQuestionnaireStatusAsync(Guid supplierId)
    {
        var questionnaire = await _db.Questionnaires.FirstOrDefaultAsync(q => q.SupplierId == supplierId);
        if(questionnaire is null)
        {
            return null;
        }
        return  new QuestionnaireStatusDTO
        {
            Status = questionnaire.Status,
            CreatedAt = questionnaire.CreatedAt,
            SubmittedAt = questionnaire.SubmittedAt,
            TotalScore = questionnaire.Score?.Total,
            EsgGrade = questionnaire.Score?.Grade
        };
    }

    public async Task<EsgScoreResultDTO> SubmitQuestionnaireAsync(Guid supplierId, SubmitQuestionnaireRequest request)
    {
        var questionnaire = await GetQuestionnaireForSubmitAsync(supplierId);
        var scoringInput = await ReplaceAnswerAsync(questionnaire.Id, request.Answers);


        var result = _esgScoringService.Calculate(scoringInput);

        var esgScore = new EsgScore
        {
            Id = Guid.NewGuid(),
            SupplierId = supplierId,
            Environmental = result.Environmental,
            Social = result.Social,
            Governance = result.Governance,
            Total = result.Total,
            Grade = result.Grade,
            CalculatedTime = DateTime.UtcNow
        };
        _db.EsgScores.Add(esgScore);

        questionnaire.Status = QuestionnaireStatus.Submitted;
        questionnaire.SubmittedAt = DateTime.UtcNow;
        questionnaire.Score = esgScore;

        
        var supplierProfile = await _db.SupplierProfiles.FirstAsync(s => s.Id == supplierId);
        supplierProfile.LatestScore = esgScore;

        await _db.SaveChangesAsync();

        return new EsgScoreResultDTO
        {
            TotalScore = result.Total,
            EsgGrade = result.Grade
        };
    }

    private async Task<Questionnaire> GetQuestionnaireForSubmitAsync(Guid supplierId)
    {
        var questionnaire = await _db.Questionnaires.FirstOrDefaultAsync(q => q.SupplierId == supplierId);
        if(questionnaire is null)
        {
            throw new BadRequestException("You have not yet been assigned a survey.");
        }
        if(questionnaire.Status == QuestionnaireStatus.Submitted)
        {
            throw new BadRequestException("Questionnaire has already been submitted.");
        }
        return questionnaire;
    }

    private async Task<List<(decimal pointsEarned, decimal weight, QuestionCategory category)>> ReplaceAnswerAsync(Guid questionnaireId, List<UserAnswerDTO> requestAnswers)
    {
        var existing = await _db.QuestionnaireAnswers.Where(a => a.QuestionnaireId == questionnaireId).ToListAsync();
        _db.QuestionnaireAnswers.RemoveRange(existing);

        var questionsId = requestAnswers.Select(a => a.QuestionId).ToList();
        var questions = await _db.Questions.Where(q => questionsId.Contains(q.Id)).ToDictionaryAsync(q => q.Id);

        var scoringInput = new List<(decimal pointsEarned, decimal weight, QuestionCategory category)>();

        foreach(var answer in requestAnswers)
        {
            if(!questions.TryGetValue(answer.QuestionId, out var question))
            {
                throw new NotFoundException($"Question {answer.QuestionId} not found.");
            }

            var options = JsonSerializer.Deserialize<List<OptionItem>>(question.OptionsJson, JsonOptions) ?? [];
            var selected = options.FirstOrDefault(o => o.Text == answer.SelectedOption);

            if(selected is null)
            {
                throw new BadRequestException($"\"{answer.SelectedOption}\" is not a valid option for question {answer.QuestionId}");
            }

            scoringInput.Add((selected.Points, question.Weight, question.Category));
            _db.QuestionnaireAnswers.Add(new QuestionnaireAnswer
            {
                Id = Guid.NewGuid(),
                QuestionId = question.Id,
                QuestionnaireId = questionnaireId,
                PointsEarned = selected.Points
            });
        }

        return scoringInput;
    }

    public async Task CreateQuestionnaireAsync(Guid supplierId)
    {
        var supplierExists = await _db.SupplierProfiles.AnyAsync(s => s.Id == supplierId);
        if (!supplierExists)
        {
            throw new NotFoundException($"Supplier with Id={supplierId} not found.");
        }

        var exists = await _db.Questionnaires.AnyAsync(q => q.SupplierId == supplierId);
        if (exists)
        {
            throw new BadRequestException("Questionnaire already exists for this supplier.");
        }

        _db.Questionnaires.Add(new Questionnaire
        {
            Id = Guid.NewGuid(),
            SupplierId = supplierId,
            Status = QuestionnaireStatus.InProgress,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }

    private static readonly JsonSerializerOptions JsonOptions = new() {PropertyNameCaseInsensitive = true};
    private record OptionItem(string Text, decimal Points);

}
