namespace GreenVendor.Application.DTOs;
public class FileDTO
{
    public Stream Content {get;set;} = Stream.Null;
    public string FileName {get;set;} = string.Empty;
    public string ContentType {get;set;} = string.Empty;
    public long Size {get;set;} 
}