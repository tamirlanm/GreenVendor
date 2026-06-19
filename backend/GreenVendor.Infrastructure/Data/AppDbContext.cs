using Microsoft.EntityFrameworkCore;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
namespace GreenVendor.Infrastructure.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

    public DbSet<User> Users { get; set; }
    public DbSet<SupplierProfile> SupplierProfiles { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<EsgScore> EsgScores { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Questionnaire> Questionnaires { get; set; }
    public DbSet<QuestionnaireAnswer> QuestionnaireAnswers { get; set; }

    
}