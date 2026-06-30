using GreenVendor.Application.Services;
using GreenVendor.Domain.Enums;

namespace GreenVendor.Tests;

public class EsgScoringServiceTests
{
    private readonly EsgScoringService _service;
    public EsgScoringServiceTests()
    {
        _service = new EsgScoringService();
    }
    
    [Fact]
    public void Calculate_ShouldReturnCorrectTotalAndGrade_WhenScoresAreBalanced()
    {
        //Arrange
        var answers = new List<(decimal pointsEarned, decimal weight, QuestionCategory category)>
        {
            (0.40m, 1.0m, QuestionCategory.Environmental),
            (0.35m, 1.0m, QuestionCategory.Social),
            (0.25m, 1.0m, QuestionCategory.Governance),      
        };

        // Act
        var result = _service.Calculate(answers);

        // Assert
        Assert.Equal(34.5m, result.Total);
        Assert.Equal("F", result.Grade);
        Assert.Equal(40.0m, result.Environmental);
        Assert.Equal(35.0m, result.Social);
        Assert.Equal(25.0m, result.Governance);
    }
    
    
    [Fact]
    public void Calculate_ShoudReturnZeroForGovernance_WhenGovernanceIsMissing()
    {
        //Arrange
        var answers = new List<(decimal pointsEarned, decimal weight, QuestionCategory category)>
        {
            (1.0m, 1.0m, QuestionCategory.Environmental),
            (1.0m, 1.0m, QuestionCategory.Social)
        };

        //Act
        var result = _service.Calculate(answers);

        //Assert
        Assert.Equal(75.0m, result.Total);
        Assert.Equal("B", result.Grade);
        Assert.Equal(100.0m, result.Environmental);
        Assert.Equal(100.0m, result.Social);
        Assert.Equal(0m, result.Governance);
    }

    [Fact]
    public void Calculate_ShouldReturnGradeC_WhenGradeUnder70()
    {
        //Arrange
        var answers = new List<(decimal pointsEarned, decimal weight, QuestionCategory category)>
        {
            (0.42m, 1.0m, QuestionCategory.Environmental), 
            (1.0m, 1.0m, QuestionCategory.Social), 
            (0.725m, 1.0m, QuestionCategory.Governance)
        };

        //Act
        var result = _service.Calculate(answers);

        //Assert
        Assert.Equal(69.9m, result.Total);  
        Assert.Equal("C", result.Grade);
        Assert.Equal(42.0m, result.Environmental);
        Assert.Equal(100.0m, result.Social);
        Assert.Equal(72.5m, result.Governance);
    }
    
    [Fact]
    public void Calculate_ShouldReturnMaxScoreAndGradeA_WhenAllAnswersPerfect()
    {
        //Arrange
        var answers = new List<(decimal pointsEarned, decimal weight, QuestionCategory category)>
        {
            (1.0m, 1.0m, QuestionCategory.Environmental),
            (1.0m, 1.0m, QuestionCategory.Social),
            (1.0m, 1.0m, QuestionCategory.Governance)
        };

        //Act
        var result = _service.Calculate(answers);

        //Assert
        Assert.Equal(100.0m, result.Total);
        Assert.Equal("A", result.Grade);
        Assert.Equal(100.0m, result.Environmental);
        Assert.Equal(100.0m, result.Social);
        Assert.Equal(100.0m, result.Governance);
    }
    
    [Fact]
    public void Calculate_ShouldReturnMinimumScoreAndGradeF_WhenAnswersZero()
    {
        //Arrange
        var answers = new List<(decimal pointsEarned, decimal weight, QuestionCategory category)>
        {
            (0m, 1.0m, QuestionCategory.Environmental),
            (0m, 1.0m, QuestionCategory.Social),
            (0m, 1.0m, QuestionCategory.Governance)
        };

        //Act
        var result = _service.Calculate(answers);
        
        //Assert
        Assert.Equal(0m, result.Total);
        Assert.Equal("F", result.Grade);
        Assert.Equal(0m, result.Environmental);
        Assert.Equal(0m, result.Social);
        Assert.Equal(0m, result.Governance);
    }
}
