namespace CreateLogSheet.Models
{
    public class Model
    {
        public int Id { get; set; }
        public string MeasPoint { get; set; } = string.Empty;
        public string FunctionalLocation { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MeasuringPosition { get; set; } = string.Empty;
        public string Characteristic { get; set; } = string.Empty;
        public string UnitOfMeasure { get; set; } = string.Empty;
        public int DecimalPlaces { get; set; }
        public string LowerRangeLimit { get; set; } = string.Empty;
        public string UpperRangeLimit { get; set; } = string.Empty;
        public string LogSheetHeaderName { get; set; } = string.Empty;
        public bool? IsCalculated { get; set; }
        public int? FormulaId { get; set; }
        public string SheetName { get; set; } = string.Empty;
        public string OperationalUnit { get; set; } = string.Empty;
        public int UnitId { get; set; }
    }
}
