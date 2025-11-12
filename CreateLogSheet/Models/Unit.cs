namespace CreateLogSheet.Models
{
    public class Unit
    {
        public int Id { get; set; }
        public int? ParentID { get; set; }
        public string? UnitName { get; set; }
        public string? AreaName { get; set; }
    }
}
