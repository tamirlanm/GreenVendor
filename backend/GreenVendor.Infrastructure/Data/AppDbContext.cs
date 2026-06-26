using Microsoft.EntityFrameworkCore;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
using GreenVendor.Application.Interfaces;
namespace GreenVendor.Infrastructure.Data;
public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

    public DbSet<User> Users { get; set; }
    public DbSet<SupplierProfile> SupplierProfiles { get; set; }
    public DbSet<BuyerProfile> BuyerProfiles {get;set;}
    public DbSet<Order> Orders {get;set;}
    public DbSet<Product> Products {get;set;}
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<EsgScore> EsgScores { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Questionnaire> Questionnaires { get; set; }
    public DbSet<QuestionnaireAnswer> QuestionnaireAnswers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Product)
            .WithMany()
            .HasForeignKey(o => o.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Buyer)
            .WithMany(b => b.Orders)
            .HasForeignKey(o => o.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalPrice)
            .HasPrecision(18,2);
        
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18,2);

        modelBuilder.Entity<BuyerProfile>()
            .Property(b => b.Industry)
            .HasConversion<string>();

        modelBuilder.Entity<SupplierProfile>()
            .Property(s => s.Industry)
            .HasConversion<string>();

        modelBuilder.Entity<EsgScore>(entity =>
        {
            entity.Property(e => e.Environmental).HasPrecision(18,2);
            entity.Property(e => e.Social).HasPrecision(18,2);
            entity.Property(e => e.Governance).HasPrecision(18,2);
            entity.Property(e => e.Total).HasPrecision(18,2);
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.Property(q => q.Weight).HasPrecision(18,2);
        });

        modelBuilder.Entity<QuestionnaireAnswer>(entity =>
        {
            entity.Property(q => q.PointsEarned).HasPrecision(18,2);
        });

        modelBuilder.Entity<Question>().HasData(
            new Question
            {
                Id = 1,
                Text = "Does your company use renewable energy sources (RES)?",
                Category = QuestionCategory.Environmental,
                Weight = 1.0m,
                OptionsJson = "[{\"Text\":\"No\", \"Points\":0}, {\"Text\":\"Partially (up to 30%)\", \"Points\":0.5}, {\"Text\":\"Yes (more than 30%)\", \"Points\": 1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 2,
                Text = "Has the company implemented a system for the separate collection and safe disposal of hazardous waste?",
                Category = QuestionCategory.Environmental,
                Weight = 1.2m,
                OptionsJson = "[{\"Text\":\"No\", \"Points\":0}, {\"Text\":\"In the production process\", \"Points\":0.3}, {\"Text\":\"Yes it works completely\", \"Points\": 1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 3,
                Text = "Does your company regularly record and audit its greenhouse gas (CO2) emissions?",
                Category = QuestionCategory.Environmental,
                Weight = 1.0m,
                OptionsJson = "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Accounting is maintained, but auditing is not carried out\",\"Points\":0.5},{\"Text\":\"Yes, the data is certified by an external auditor\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 4,
                Text = "Does the company use closed-loop water supply technologies?",
                Category = QuestionCategory.Environmental,
                Weight = 0.8m,
                OptionsJson = "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Yes, in some areas\",\"Points\":0.6},{\"Text\":\"Yes, in all production\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 5,
                Text = "Does the company have formal occupational safety and health and injury reduction programs?",
                Category = QuestionCategory.Social,
                Weight = 1.2m,
                OptionsJson = "[{\"Text\":\"There are no basic regulations\",\"Points\":0},{\"Text\":\"There are basic instructions\",\"Points\":0.5},{\"Text\":\"Yes, international standards (ISO 45001) have been implemented\",\"Points\":1.0}]",
                IsActive = true,
            },
            new Question
            {
                Id = 6,
                Text = "Does the company provide regular training, workshops, or advanced training courses for employees at its own expense?",
                Category =QuestionCategory.Social,
                Weight = 1.0m,
                OptionsJson = "[{\"Text\":\"No, employees train themselves.\",\"Points\":0},{\"Text\":\"Yes, for some departments\",\"Points\":0.5},{\"Text\":\"Yes, systematically for all staff\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 7,
                Text = "Does the company have a formal equality, inclusion and non-discrimination policy?",
                Category = QuestionCategory.Social,
                Weight = 0.9m,
                OptionsJson = "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Declared orally\",\"Points\":0.4},{\"Text\":\"Yes, it is enshrined in the Company Code\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 8,
                Text = "Does the company finance charitable, environmental, or social projects in the regions where it operates?",
                Category = QuestionCategory.Social,
                Weight = 0.9m,
                OptionsJson = "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Rarely / one-time promotions\",\"Points\":0.5},{\"Text\":\"Yes, on a regular long-term basis\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 9,
                Text = "Has the company adopted a Code of Business Ethics and an anti-corruption compliance policy?",
                Category = QuestionCategory.Governance,
                Weight = 1.2m,
                OptionsJson = "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"There are only general rules in contracts\",\"Points\":0.4},{\"Text\":\"Yes, there is a dedicated compliance officer and regulations.\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 10,
                Text = "Are your company's financial statements regularly audited by an independent external auditor?",
                Category = QuestionCategory.Governance,
                Weight = 1.1m,
                OptionsJson = "[{\"Text\":\"No, only government audits\",\"Points\":0},{\"Text\":\"Once every few years\",\"Points\":0.5},{\"Text\":\"Yes, annually by independent auditors\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 11,
                Text = "Does the company have transparent and secure channels for anonymous whistleblowing?",
                Category = QuestionCategory.Governance,
                Weight = 1.0m,
                OptionsJson = "[{\"Text\":\"No channels\",\"Points\":0},{\"Text\":\"There is a regular suggestion box (does not guarantee anonymity)\",\"Points\":0.4},{\"Text\":\"Yes, there is a dedicated hotline / anonymous portal\",\"Points\":1.0}]",
                IsActive = true
            },
            new Question
            {
                Id = 12,
                Text = "Does the company disclose the structure of its ultimate beneficial owners and top management on its official website?",
                Category = QuestionCategory.Governance,
                Weight = 0.7m,
                OptionsJson = "[{\"Text\":\"Information is completely closed\",\"Points\":0},{\"Text\":\"Partially disclosed upon request\",\"Points\":0.6},{\"Text\":\"Yes, the information is completely public and transparent\",\"Points\":1.0}]",
                IsActive = true
            }
        );
    }
}