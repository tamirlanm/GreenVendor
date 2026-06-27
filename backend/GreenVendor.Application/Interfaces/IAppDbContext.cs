using GreenVendor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace GreenVendor.Application.Interfaces;
public interface IAppDbContext
{
    DbSet<User> Users {get;}
    DbSet<RefreshToken> RefreshTokens {get;}
    DbSet<BuyerProfile> BuyerProfiles {get;}
    DbSet<Product> Products {get;}
    DbSet<Order> Orders {get;}
    DbSet<SupplierProfile> SupplierProfiles {get;}
    DbSet<EsgScore> EsgScores {get;}
    DbSet<Question> Questions {get;}
    DbSet<Questionnaire> Questionnaires {get;}
    DbSet<QuestionnaireAnswer> QuestionnaireAnswers {get;}
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}