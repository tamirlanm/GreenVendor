using GreenVendor.Application.Interfaces;
using GreenVendor.Application.Services;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
using Moq;

namespace GreenVendor.Tests;

public class AdminServiceTests
{
    private readonly Mock<IQuestionnaireService> _questionnaireServiceMock = new();

    private AdminService CreateService(GreenVendor.Infrastructure.Data.AppDbContext db)
        => new(db, _questionnaireServiceMock.Object);

    [Fact]
    public async Task GetAnalyticsAsync_ShouldReturnZeroAverage_WhenNoScoresExistYet()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);

        var result = await service.GetAnalyticsAsync();
        Assert.Equal(0m, result.AverageEsgScore);
    }

    [Fact]
    public async Task GetAnalyticsAsync_ShouldComputeCorrectAverage_WhenScoresExist()
    {
        using var db = TestDbContextFactory.Create();
        db.EsgScores.AddRange(
            new EsgScore { Id = Guid.NewGuid(), SupplierId = Guid.NewGuid(), Total = 40, Grade = "D", CalculatedTime = DateTime.UtcNow },
            new EsgScore { Id = Guid.NewGuid(), SupplierId = Guid.NewGuid(), Total = 90, Grade = "A", CalculatedTime = DateTime.UtcNow },
            new EsgScore { Id = Guid.NewGuid(), SupplierId = Guid.NewGuid(), Total = 60, Grade = "C", CalculatedTime = DateTime.UtcNow }
        );
        await db.SaveChangesAsync();
        var service = CreateService(db);

        var result = await service.GetAnalyticsAsync();

        Assert.Equal((40m + 90m + 60m) / 3m, result.AverageEsgScore);
    }

    [Fact]
    public async Task CreateQuestionnaireForSupplierAsync_ShouldDelegateToQuestionnaireService()
    {
        using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        var service = CreateService(db);

        await service.CreateQuestionnaireForSupplierAsync(supplierId);

        _questionnaireServiceMock.Verify(q => q.CreateQuestionnaireAsync(supplierId), Times.Once);
    }
}