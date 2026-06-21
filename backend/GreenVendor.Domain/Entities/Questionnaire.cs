using GreenVendor.Domain.Enums;
namespace GreenVendor.Domain.Entities;
public class Questionnaire
{
    public Guid Id {get;set;}
    public Guid SupplierId {get;set;}
    public QuestionnaireStatus Status {get;set;}
    public DateTime CreatedAt {get;set;}
    public DateTime? SubmittedAt {get;set;}
    public SupplierProfile Supplier {get;set;} = null!;
    public ICollection<QuestionnaireAnswer> Answers {get;set;} = [];
    public EsgScore? Score {get;set;}
}