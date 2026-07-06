using System.Text.Json;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using GreenVendor.Application.Services;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
using Moq;

namespace GreenVendor.Tests;
public class QuestionnaireServiceTests
{
    private readonly Mock<IEsgScoringService> _scoringMock;
    public QuestionnaireServiceTests()
    {
        _scoringMock = new Mock<IEsgScoringService>();
        _scoringMock.Setup(s => s.Calculate(It.IsAny<IReadOnlyList<(decimal, decimal, QuestionCategory)>>()))
        .Returns(new EsgScoreResult { Environmental = 80, Social = 70, Governance = 60, Total = 73, Grade = "B"});
    }

    private QuestionnaireService CreateService(GreenVendor.Infrastructure.Data.AppDbContext db) 
        => new(db, _scoringMock.Object);

    private static string OptionsJson(params (string text, decimal points)[] opts) 
        => JsonSerializer.Serialize(opts.Select(o => new { o.text, o.points}));

    [Fact]
    public async Task GetQuestionsAsync_ShouldReturnOnlyActiveQuestions_WithParsedOptionTexts()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        db.Questions.AddRange(
        new Question { Id = 1, Text = "Active Q", Category = QuestionCategory.Environmental, Weight = 1, IsActive = true,
            OptionsJson = OptionsJson(("No", 0), ("Yes", 1)) },
        new Question { Id = 2, Text = "Inactive Q", Category = QuestionCategory.Social, Weight = 1, IsActive = false,
            OptionsJson = OptionsJson(("No", 0), ("Yes", 1)) });
        await db.SaveChangesAsync();
        var service = CreateService(db);

        // Act
        var result = (await service.GetQuestionsAsync()).ToList();

        // Assert
        Assert.Single(result);
        Assert.Equal("Active Q", result[0].Text);
        Assert.Equal(new[] { "No", "Yes" }, result[0].Options);
    }


    [Fact]
    public async Task GetMyQuestionnaireStatusAsync_ShouldReturnNull_WhenNoQuestionnaireExists()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);

        // Act
        var result = await service.GetMyQuestionnaireStatusAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetMyQuestionnaireStatusAsync_ShouldReturnNullScore_WhenQuestionnaireNotYetSubmitted()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        db.Questionnaires.Add(new Questionnaire { Id = Guid.NewGuid(), SupplierId = supplierId, Status = QuestionnaireStatus.InProgress, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        var service = CreateService(db);

        // Act
        var result = await service.GetMyQuestionnaireStatusAsync(supplierId);

        // Assert — та самая защита от NullReferenceException на Score, которую мы разбирали раньше
        Assert.NotNull(result);
        Assert.Equal(QuestionnaireStatus.InProgress, result!.Status);
        Assert.Null(result.TotalScore);
        Assert.Null(result.EsgGrade);
    }

    [Fact]
    public async Task SubmitQuestionnaireAsync_ShouldThrowBadRequestException_WhenNoQuestionnaireAssigned()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var request = new SubmitQuestionnaireRequest { Answers = [] };

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => service.SubmitQuestionnaireAsync(Guid.NewGuid(), request));
    }

    [Fact]
    public async Task SubmitQuestionnaireAsync_ShouldThrowBadRequestException_WhenAlreadySubmitted()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        db.Questionnaires.Add(new Questionnaire { Id = Guid.NewGuid(), SupplierId = supplierId, Status = QuestionnaireStatus.Submitted, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        var service = CreateService(db);
        var request = new SubmitQuestionnaireRequest { Answers = [] };

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => service.SubmitQuestionnaireAsync(supplierId, request));
    }
}
