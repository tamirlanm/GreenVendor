using GreenVendor.Application.DTOs;

namespace GreenVendor.Application.Interfaces;
public interface IFileStorageService
{
    Task<string> SaveFileAsync(FileDTO file, string folderName);
    void DeleteFile(string fileUrl);
}