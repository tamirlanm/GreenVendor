using System.Text.Json;
using GreenVendor.Domain.Entities;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
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
        var questionnaire = await _db.Questionnaires.FirstOrDefaultAsync(q => q.SupplierId == supplierId);
        bool isNew = questionnaire is null;
        
        if(questionnaire is not null && questionnaire.Status == Domain.Enums.QuestionnaireStatus.Submitted)
        {
            throw new BadRequestException("Questionnaire has already been submitted.");
        }
        
        questionnaire ??= new Questionnaire
        {
            Id = Guid.NewGuid(),
            SupplierId = supplierId,
            Status = Domain.Enums.QuestionnaireStatus.InProgress,
            CreatedAt = DateTime.UtcNow
        };

        var questionIds = request.Answers.Select(a => a.QuestionId).ToList();
        var questions = await _db.Questions.Where(q => questionIds.Contains(q.Id)).ToDictionaryAsync(q => q.Id);

        var scoringInput = new List<(decimal pointsEarned, decimal weight, QuestionCategory category)>();
        var answerEntities = new List<QuestionnaireAnswer>();

        foreach(var answer in request.Answers)
        {
            if(!questions.TryGetValue(answer.QuestionId, out var question))
            {
                throw new NotFoundException($"Question {answer.QuestionId} not found.");
            }

            var options = JsonSerializer.Deserialize<List<OptionItem>>(question.OptionsJson, JsonOptions) ?? [];
            var selected = options.FirstOrDefault(o => o.Text == answer.SelectedOption);
            if(selected is null)
            {
                throw new BadRequestException($"\"{answer.SelectedOption}\" is not a valid option for question {answer.QuestionId}.");
            }

            scoringInput.Add((selected.Points, question.Weight, question.Category));
            answerEntities.Add(new QuestionnaireAnswer
            {
                Id = Guid.NewGuid(),
                QuestionId = question.Id,
                QuestionnaireId = questionnaire.Id,
                PointsEarned = selected.Points
            });
        }

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

        if (isNew)
        {
            _db.Questionnaires.Add(questionnaire);
        }

        _db.QuestionnaireAnswers.AddRange(answerEntities);

        var supplierProfile = await _db.SupplierProfiles.FirstAsync(s => s.Id == supplierId);
        supplierProfile.LatestScore = esgScore;

        await _db.SaveChangesAsync();

        return new EsgScoreResultDTO
        {
            TotalScore = result.Total,
            EsgGrade = result.Grade
        };
    }
    private static readonly JsonSerializerOptions JsonOptions = new() {PropertyNameCaseInsensitive = true};
    private record OptionItem(string Text, decimal Points);

}
