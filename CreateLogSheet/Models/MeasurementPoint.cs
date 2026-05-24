using System.Xml.Linq;

namespace CreateLogSheet.Models
{
    public class MeasurementPoint
    {
        public int Id { get; set; }
        public string MeasPoint { get; set; }  // float
        public string FunctionalLocation { get; set; } = string.Empty;  // nvarchar
        public string Description { get; set; } = string.Empty;  // nvarchar
        public string MeasuringPosition { get; set; } = string.Empty;  // nvarchar
        public string Characteristic { get; set; } = string.Empty;  // nvarchar
        public decimal? FRConstantValue { get; set; }
        public string UnitOfMeasure { get; set; } = string.Empty;  // nvarchar
        public int? DecimalPlaces { get; set; }  // float (ممکنه خالی باشه)
        public string? LowerRangeLimit { get; set; }  // float
        public string? UpperRangeLimit { get; set; }  // float
        public string LogSheetHeaderName { get; set; } = string.Empty;  // nvarchar
        public bool? IsCalculated { get; set; }  // nvarchar (true/false ذخیره کن)
        public string? FormulaResult { get; set; } = "" ;  // nvarchar
        public string? RawFormula { get; set; } = "" ;  // nvarchar
        public string? FormulaCommand { get; set; } = "" ;  // nvarchar
        public string SheetName { get; set; } = string.Empty;  // nvarchar
        public string? Morning_Value { get; set; } = "";
        public string? Afternoon_Value { get; set; } = "";
        public string? Evening_Value { get; set; } = "";
        public int UnitId { get; set; } 
        public int SheetHeaderOrder { get; set; } 
        public int SheetOrder { get; set; }
        public XDocument? HeaderSummery { get; set; }
    }
}
