using FluentValidation;
using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Validators;
public class FileDTOValidator : AbstractValidator<FileDTO>
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };
    private const long MaxSizeBytes = 5 * 1024 * 1024; 

    public FileDTOValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required.")
            .Must(name => AllowedExtensions.Contains(Path.GetExtension(name)))
            .WithMessage("Only .jpg, .jpeg, .png and .webp files are allowed.");

        RuleFor(x => x.ContentType)
            .Must(ct => AllowedContentTypes.Contains(ct))
            .WithMessage("Invalid file content type.");

        RuleFor(x => x.Size)
            .GreaterThan(0).WithMessage("File is empty.")
            .LessThanOrEqualTo(MaxSizeBytes).WithMessage("File size must not exceed 5 MB.");
    }
}