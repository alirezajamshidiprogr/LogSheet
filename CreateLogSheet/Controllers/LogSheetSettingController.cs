using CreateLogSheet.Models;
using CreateLogSheet.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CreateLogSheet.Controllers
{
    public class LogSheetSettingController : Controller
    {
        //private readonly SheetHierarchyService _sheetService;
        private readonly string _connectionString = "Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True";

        private List<SheetViewModel> GetAllSheetsWithHierarchy()
        {
            DataTable dt = new DataTable();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = @"
                    SELECT 
                        s.Id AS SheetId, s.SheetName, s.[Order] AS SheetOrder, s.UnitId,
                        sh.Id AS SheetHeaderId, sh.Name AS SheetHeaderName, sh.[Order] AS SheetHeaderOrder, sh.HeaderSummery,
                        mp.Id AS MeasuringPointId, mp.Description AS MeasuringPointDescription, mp.[Order] AS MeasuringPointOrder
                    FROM Sheet s
                    LEFT JOIN SheetHeader sh ON sh.SheetId = s.Id
                    LEFT JOIN Measuring_Point mp ON mp.SheetHeaderId = CAST(sh.Id AS NVARCHAR(255))
                    ORDER BY s.[Order], sh.[Order], mp.[Order];
                ";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(dt);
                    }
                }
            }

            return MapToHierarchy(dt);
        }

        private void UpdateOrders(List<SheetViewModel> sheets)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                foreach (var sheet in sheets)
                {
                    // Update Sheet
                    using var cmdSheet = new SqlCommand("UPDATE Sheet SET [Order]=@Order WHERE Id=@Id", conn);
                    cmdSheet.Parameters.AddWithValue("@Order", sheet.Order);
                    cmdSheet.Parameters.AddWithValue("@Id", sheet.Id);
                    cmdSheet.ExecuteNonQuery();

                    foreach (var header in sheet.SheetHeaders)
                    {
                        // Update SheetHeader
                        using var cmdHeader = new SqlCommand("UPDATE SheetHeader SET [Order]=@Order WHERE Id=@Id", conn);
                        cmdHeader.Parameters.AddWithValue("@Order", header.Order);
                        cmdHeader.Parameters.AddWithValue("@Id", header.Id);
                        cmdHeader.ExecuteNonQuery();

                        foreach (var point in header.MeasuringPoints)
                        {
                            // Update MeasuringPoint
                            using var cmdPoint = new SqlCommand("UPDATE Measuring_Point SET [Order]=@Order WHERE Id=@Id", conn);
                            cmdPoint.Parameters.AddWithValue("@Order", point.Order);
                            cmdPoint.Parameters.AddWithValue("@Id", point.Id);
                            cmdPoint.ExecuteNonQuery();
                        }
                    }
                }
            }
        }

        private List<SheetViewModel> MapToHierarchy(DataTable dt)
        {
            var sheets = new List<SheetViewModel>();
            var sheetDict = new Dictionary<int, SheetViewModel>();
            var headerDict = new Dictionary<int, SheetHeaderViewModel>();

            foreach (DataRow row in dt.Rows)
            {
                int sheetId = row.Field<int>("SheetId");
                int? headerId = row.Field<int?>("SheetHeaderId");
                int? pointId = row.Field<int?>("MeasuringPointId");

                // Sheet
                if (!sheetDict.ContainsKey(sheetId))
                {
                    var sheet = new SheetViewModel
                    {
                        Id = sheetId,
                        Name = row.Field<string>("SheetName") ?? string.Empty,
                        Order = Convert.ToInt32(row["SheetOrder"]),
                        UnitId = Convert.ToInt32(row["UnitId"])
                    };
                    sheets.Add(sheet);
                    sheetDict[sheetId] = sheet;
                }

                var currentSheet = sheetDict[sheetId];

                // SheetHeader
                SheetHeaderViewModel? header = null;
                if (headerId.HasValue)
                {
                    if (!headerDict.ContainsKey(headerId.Value))
                    {
                        header = new SheetHeaderViewModel
                        {
                            Id = headerId.Value,
                            Name = row.Field<string>("SheetHeaderName") ?? string.Empty,
                            Order = Convert.ToInt32(row["SheetHeaderOrder"]),
                            HeaderSummery = row.Field<string?>("HeaderSummery")
                        };
                        currentSheet.SheetHeaders.Add(header);
                        headerDict[headerId.Value] = header;
                    }
                    else
                    {
                        header = headerDict[headerId.Value];
                    }
                }

                // MeasuringPoint
                if (pointId.HasValue && header != null)
                {
                    var point = new MeasuringPointViewModel
                    {
                        Id = pointId.Value,
                        Description = row.Field<string>("MeasuringPointDescription") ?? string.Empty,
                        Order = row["MeasuringPointOrder"] == null ? 0 :  Convert.ToInt32(row["MeasuringPointOrder"])
                    };
                    header.MeasuringPoints.Add(point);
                }
            }

            return sheets;
        }

        //public LogSheetSettingController(SheetHierarchyService sheetService)
        //{
        //    _sheetService = sheetService;
        //}

        // اکشن اصلی
        public IActionResult IndexLogSheetSetting(int unitId)
        {
            var sheets = GetAllSheetsWithHierarchy()
                                      .Where(s => s.UnitId == unitId)
                                      .ToList();
            return View(sheets);
        }

        // پارشیال: فرزند SheetHeaders هر Sheet
        public IActionResult SheetHeadersPartial(int sheetId)
        {
            var sheet = GetAllSheetsWithHierarchy()
                                     .FirstOrDefault(s => s.Id == sheetId);

            if (sheet == null)
                return PartialView("_SheetHeadersPartial", new List<SheetHeaderViewModel>());

            return PartialView("_SheetHeadersPartial", sheet.SheetHeaders);
        }

        // پارشیال: فرزند MeasuringPoints هر SheetHeader
        public IActionResult MeasuringPointsPartial(int headerId)
        {
            var header = GetAllSheetsWithHierarchy()
                                      .SelectMany(s => s.SheetHeaders)
                                      .FirstOrDefault(h => h.Id == headerId);

            if (header == null)
                return PartialView("_MeasuringPointsPartial", new List<MeasuringPointViewModel>());

            return PartialView("_MeasuringPointsPartial", header.MeasuringPoints);
        }

        // اکشن ذخیره ترتیب‌ها
        [HttpPost]
        public IActionResult SaveOrder([FromBody] List<SheetViewModel> sheets)
        {
            try
            {
                UpdateOrders(sheets);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
