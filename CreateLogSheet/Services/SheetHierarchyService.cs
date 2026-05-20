using CreateLogSheet.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CreateLogSheet.Services
{
    public class SheetHierarchyService
    {
        private readonly string _connectionString;

        public SheetHierarchyService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public List<SheetViewModel> GetAllSheetsWithHierarchy()
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

        public void UpdateOrders(List<SheetViewModel> sheets)
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
                        Order = Convert.ToInt32(row["MeasuringPointOrder"])
                    };
                    header.MeasuringPoints.Add(point);
                }
            }

            return sheets;
        }
    }
}
