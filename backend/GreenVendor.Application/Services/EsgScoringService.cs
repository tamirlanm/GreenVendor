using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.Services;

public class EsgScoringService : IEsgScoringService
{
    public EsgScoreResult Calculate
        (IReadOnlyList<(decimal pointsEarned, decimal weight, QuestionCategory category)> answers)
    {
        var env = ScoreCategory(answers, QuestionCategory.Environmental);
        var soc = ScoreCategory(answers, QuestionCategory.Social);
        var gov = ScoreCategory(answers, QuestionCategory.Governance);
        var total = env * 0.40m + soc * 0.35m + gov * 0.25m;

        return new EsgScoreResult
        {
            Environmental = Math.Round(env, 1),
            Social = Math.Round(soc, 1),
            Governance = Math.Round(gov, 1),
            Total = Math.Round(total, 1),
            Grade = ToGrade(total)
        };
    }

    private static decimal ScoreCategory(IReadOnlyList<(decimal points, decimal weight, QuestionCategory cat)> answers, QuestionCategory category)
    {
        var filtered = answers.Where(a => a.cat == category).ToList();
        if(filtered.Count == 0) return 0m;
        var totalWeight = filtered.Sum(a => a.weight);
        var earnedScore = filtered.Sum(a => a.points * a.weight);
        return totalWeight == 0 ? 0m : earnedScore / totalWeight * 100m;
    }

    private static string ToGrade(decimal score) => score switch
    {
        >= 85 => "A", >= 70 => "B", >= 55 => "C", >= 40 => "D", _ => "F"   
    };
}