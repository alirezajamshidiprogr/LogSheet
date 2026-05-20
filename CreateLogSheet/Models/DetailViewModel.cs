namespace CreateLogSheet.Models
{
    public class DetailViewModel
    {
        public int Id { get; set; }                // شناسه شرح
        public string Description { get; set; }    // شرح
        public int Order { get; set; }             // ترتیب (قابل ویرایش)
    }
}
