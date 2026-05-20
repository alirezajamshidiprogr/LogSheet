namespace CreateLogSheet.Models
{
    public class SheetHeaderViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
        public string? HeaderSummery { get; set; }
        public List<MeasuringPointViewModel> MeasuringPoints { get; set; } = new List<MeasuringPointViewModel>();
    }
}
