using CreateLogSheet.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Globalization;
using System.Xml.Linq;

namespace CreateLogSheet.Services
{
    public class LogSheetService
    {
        private readonly string _connectionString;

        public LogSheetService(string connectionString)
        {
            _connectionString = connectionString;
        }

        // گرفتن داده‌های کل شیت برای UnitId و تاریخ مشخص
        // گرفتن داده‌های شیت یا تمام شیت‌ها
        public List<MeasurementPoint> GetSheetData(int unitId, string getDate, string? sheetName = null)
        {
            DataTable dt = new DataTable();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = sheetName == null
                    ? @"exec getLogUnist @UnitId=@unitId, @Date=@date"
                    : @"exec getLogUnist @UnitId=@unitId, @Date=@date, @SheetName=@sheetName";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@unitId", unitId);
                    cmd.Parameters.AddWithValue("@date", getDate);

                    if (!string.IsNullOrEmpty(sheetName))
                        cmd.Parameters.AddWithValue("@sheetName", sheetName);

                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(dt);
                    }
                }
            }

            return dt.AsEnumerable().Select(row => MapToMeasurementPoint(row)).ToList();
        }

        public List<Model> GetSheetReport(
    int unitId,
    List<string>? sheetNames = null,
    List<string>? logSheetHeaderNames = null,
    List<string>? descriptions = null,
    List<string>? measuringPositions = null,
    List<string>? characteristics = null,
    List<string>? units = null,
    List<string>? operationalUnits = null // ← جدید
)
        {
            DataTable dt = new DataTable();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                // کوئری پایه
                string query = @" SELECT 
                        mp.Id AS [Id],
						mp.[Description],
						s.SheetName ,
						sh.Name AS LogSheetHeaderName,
						mp.MeasuringPosition,
						mp.Characteristic , 
						mp.UnitofMeasure,
						UnitId
                    FROM Sheet s
                    LEFT JOIN SheetHeader sh ON sh.SheetId = s.Id
                    LEFT JOIN Measuring_Point mp ON mp.SheetHeaderId = CAST(sh.Id AS NVARCHAR(255))
                     where Description is not null";

                // 🧩 فیلترهای داینامیک
                if (sheetNames != null && sheetNames.Any())
                    query += " AND SheetName IN (" + string.Join(",", sheetNames.Select((s, i) => "@sheet" + i)) + ")";

                if (logSheetHeaderNames != null && logSheetHeaderNames.Any())
                    query += " AND Name IN (" + string.Join(",", logSheetHeaderNames.Select((s, i) => "@header" + i)) + ")";

                if (descriptions != null && descriptions.Any())
                    query += " AND (" + string.Join(" OR ", descriptions.Select((s, i) => "Description LIKE '%' + @desc" + i + " + '%'")) + ")";

                if (measuringPositions != null && measuringPositions.Any())
                    query += " AND MeasuringPosition IN (" + string.Join(",", measuringPositions.Select((s, i) => "@pos" + i)) + ")";

                if (characteristics != null && characteristics.Any())
                    query += " AND Characteristic IN (" + string.Join(",", characteristics.Select((s, i) => "@char" + i)) + ")";

                if (units != null && units.Any())
                    query += " AND UnitOfMeasure IN (" + string.Join(",", units.Select((s, i) => "@unit" + i)) + ")";

                // 🟢 فیلتر جدید: واحد عملیاتی
                if (operationalUnits != null && operationalUnits.Any())
                    query += " AND OperationalUnit IN (" + string.Join(",", operationalUnits.Select((s, i) => "@op" + i)) + ")";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@unitId", unitId);

                    if (sheetNames != null)
                        for (int i = 0; i < sheetNames.Count; i++)
                            cmd.Parameters.AddWithValue("@sheet" + i, sheetNames[i]);

                    if (logSheetHeaderNames != null)
                        for (int i = 0; i < logSheetHeaderNames.Count; i++)
                            cmd.Parameters.AddWithValue("@header" + i, logSheetHeaderNames[i]);

                    if (descriptions != null)
                        for (int i = 0; i < descriptions.Count; i++)
                            cmd.Parameters.AddWithValue("@desc" + i, descriptions[i]);

                    if (measuringPositions != null)
                        for (int i = 0; i < measuringPositions.Count; i++)
                            cmd.Parameters.AddWithValue("@pos" + i, measuringPositions[i]);

                    if (characteristics != null)
                        for (int i = 0; i < characteristics.Count; i++)
                            cmd.Parameters.AddWithValue("@char" + i, characteristics[i]);

                    if (units != null)
                        for (int i = 0; i < units.Count; i++)
                            cmd.Parameters.AddWithValue("@unit" + i, units[i]);

                    // 🟢 پارامتر جدید برای واحد عملیاتی
                    if (operationalUnits != null)
                        for (int i = 0; i < operationalUnits.Count; i++)
                            cmd.Parameters.AddWithValue("@op" + i, operationalUnits[i]);

                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(dt);
                    }
                }
            }

            return dt.AsEnumerable().Select(row => MapToMeasurementPoint2(row)).ToList();
        }

        private Model MapToMeasurementPoint2(DataRow row)
        {
            return new Model
            {
                Id = row.Field<int>("Id"),
                Description = row.Field<string>("Description") ?? string.Empty,
                SheetName = row.Field<string>("SheetName") ?? string.Empty,
                LogSheetHeaderName = row.Field<string>("LogSheetHeaderName") ?? string.Empty,
                MeasuringPosition = row.Field<string>("MeasuringPosition") ?? string.Empty,
                Characteristic = row.Field<string>("Characteristic") ?? string.Empty,
                UnitOfMeasure = row.Field<string>("UnitOfMeasure") ?? string.Empty,
                //OperationalUnit = row.Field<string?>("OperationalUnit") ?? string.Empty, // ← اضافه شد
                UnitId = row.Field<int>("UnitId"),
            };
        }


        // ذخیره شیفت‌ها با Bulk Merge
        public void SaveAllShifts(SaveShiftsRequest request, int unitId, string userName)
        {
            if (!DateTime.TryParseExact(request.LogSheetDate, "yyyy/MM/dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime logSheetDate))
                throw new Exception("فرمت تاریخ صحیح نیست.");

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                var table = new DataTable();
                table.Columns.Add("Measuring_PointId", typeof(int));
                table.Columns.Add("ShiftName", typeof(string));
                table.Columns.Add("Value", typeof(decimal));
                table.Columns.Add("InsertDate", typeof(DateTime));
                table.Columns.Add("LogSheetDate", typeof(string));
                table.Columns.Add("UserInserted", typeof(string));

                foreach (var shift in request.ShiftData)
                {
                    string shiftName = shift.Key;
                    var inputs = shift.Value;

                    foreach (var item in inputs)
                    {
                        foreach (var kvp in item)
                        {
                            int measuringPointId = int.Parse(kvp.Key);
                            decimal value = (decimal)kvp.Value;

                            table.Rows.Add(measuringPointId, shiftName, value, DateTime.Now, logSheetDate.ToString("yyyy/MM/dd"), userName);
                        }
                    }
                }

                string tempTableName = "#TempLogSheetValues";
                string createTempTable = $@"
CREATE TABLE {tempTableName} (
    Measuring_PointId INT,
    ShiftName VARCHAR(2),
    Value DECIMAL(9,2),
    InsertDate DATETIME,
    LogSheetDate CHAR(10),
    UserInserted NVARCHAR(50)
)";

                using (var cmd = new SqlCommand(createTempTable, conn))
                {
                    cmd.ExecuteNonQuery();
                }

                using (var bulk = new SqlBulkCopy(conn))
                {
                    bulk.DestinationTableName = tempTableName;
                    bulk.WriteToServer(table);
                }

                string mergeSql = $@"
MERGE INTO DailyLogSheetValues AS Target
USING {tempTableName} AS Source
ON Target.Measuring_PointId = Source.Measuring_PointId
   AND Target.ShiftName = Source.ShiftName
   AND Target.LogSheetDate = Source.LogSheetDate
WHEN MATCHED THEN 
    UPDATE SET Value = Source.Value, InsertDate = Source.InsertDate, UserInserted = Source.UserInserted
WHEN NOT MATCHED THEN
    INSERT (Measuring_PointId, ShiftName, Value, InsertDate, LogSheetDate, UserInserted)
    VALUES (Source.Measuring_PointId, Source.ShiftName, Source.Value, Source.InsertDate, Source.LogSheetDate, Source.UserInserted);";

                using (var cmd = new SqlCommand(mergeSql, conn))
                {
                    cmd.ExecuteNonQuery();
                }
            }
        }

        // مپ کردن DataRow به MeasurementPoint
        private MeasurementPoint MapToMeasurementPoint(DataRow row)
        {
            string FormatValue(string? input)
            {
                if (string.IsNullOrEmpty(input)) return string.Empty;
                input = input.Replace('/', '.').Replace(',', '.');
                if (double.TryParse(input, out double num))
                    return (num % 1 == 0) ? ((int)num).ToString() : num.ToString("F2");
                return input;
            }

            return new MeasurementPoint
            {
                Id = row.Field<int>("Id"),
                MeasPoint = row.Field<string?>("MeasPoint") ?? string.Empty,
                FunctionalLocation = row.Field<string>("FunctionalLocation") ?? string.Empty,
                Description = row.Field<string>("Description") ?? string.Empty,
                MeasuringPosition = row.Field<string>("MeasuringPosition") ?? string.Empty,
                Characteristic = row.Field<string>("Characteristic") ?? string.Empty,
                UnitOfMeasure = row.Field<string>("UnitOfMeasure") ?? string.Empty,
                DecimalPlaces = row.Field<int?>("DecimalPlaces"),
                LowerRangeLimit = row.Field<string?>("LowerRangeLimit"),
                UpperRangeLimit = row.Field<string?>("UpperRangeLimit"),
                LogSheetHeaderName = row.Field<string>("LogSheetHeaderName") ?? string.Empty,
                IsCalculated = (row.Field<bool?>("IsCalculated") ?? false),
                FormulaResult = row.Field<string?>("FormulaResult") ?? "",
                RawFormula = row.Field<string?>("RawFormula") ?? string.Empty,
                FormulaCommand = row.Field<string?>("FormulaCommand") ?? string.Empty,
                SheetName = row.Field<string>("SheetName") ?? string.Empty,
                Morning_Value = FormatValue(row.Field<string?>("Morning_Value")),
                Afternoon_Value = FormatValue(row.Field<string?>("Afternoon_Value")),
                Evening_Value = FormatValue(row.Field<string?>("Evening_Value")),
                UnitId = row.Field<int>("UnitId"),
                SheetOrder = row.Field<int>("SheetOrder"),
                SheetHeaderOrder = row.Field<int>("SheetHeaderOrder"),
                FRConstantValue = row.Field<decimal?>("FRConstantValue"),
                HeaderSummery = string.IsNullOrWhiteSpace(row.Field<string?>("HeaderSummery")) ? null : XDocument.Parse(row.Field<string>("HeaderSummery")),
        };
        }
    }
}