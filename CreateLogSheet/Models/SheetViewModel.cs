namespace CreateLogSheet.Models
{
    public class SheetViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }   // ترتیب
        public int UnitId { get; set; }  // UnitId اضافه شد
        public List<SheetHeaderViewModel> SheetHeaders { get; set; } = new List<SheetHeaderViewModel>();
    }
}
