using GreenVendor.Application.DTOs;
using GreenVendor.Domain.Enums;
namespace GreenVendor.Application.Interfaces;
public interface IEsgScoringService
{
    public EsgScoreResult Calculate(IReadOnlyList<(decimal pointsEarned, decimal weight, QuestionCategory category)> answers);
}