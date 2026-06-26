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
    }
}