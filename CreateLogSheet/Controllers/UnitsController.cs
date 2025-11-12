using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CreateLogSheet.Controllers
{
    public class UnitsController : Controller
    {
        public IActionResult Index()
        {
            string connectionString = "Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True";

            DataTable dt = new DataTable();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"
                    SELECT 
                        U.id AS UnitId,
                        U.UnitName,
                        U.AreaName,
                        U.ParentID
                    FROM Units AS U
where parentId is not null 
                    ORDER BY U.id";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    adapter.Fill(dt);
                }
            }

            return View(dt);
        }

        public IActionResult Details(int id)
        {
            string connectionString = "Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True";

            DataTable dt = new DataTable();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"SELECT 
                            MeasPoint,
                            FunctionalLocation,
                            Description,
                            MeasuringPosition,
                            Characteristic,
                            UnitOfMeasure,
                            DecimalPlaces,
                            LowerRangeLimit,
                            UpperRangeLimit,
                            LogSheetHeaderName,
                            IsCalculated,
                            FormalueID,
                            SheetName
                        FROM Measuring_Point
                        WHERE UnitId = @UnitId";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UnitId", id);
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(dt);
                    }
                }
            }

            return PartialView("_MeasuringPoints", dt); // PartialView برای نمایش داخل modal یا div
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            string connectionString = "Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True";
            DataTable dt = new DataTable();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"SELECT id AS UnitId, UnitName, AreaName, ParentID
                         FROM Units
                         WHERE id = @UnitId";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UnitId", id);
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(dt);
                    }
                }
            }

            if (dt.Rows.Count == 0)
                return NotFound();

            return View(dt.Rows[0]); // می‌توان یک مدل ساده Unit هم ساخت
        }

        [HttpPost]
        public IActionResult Edit(int id, string UnitName, string AreaName, int? ParentID)
        {
            string connectionString = "Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"UPDATE Units
                         SET UnitName = @UnitName,
                             AreaName = @AreaName,
                             ParentID = @ParentID
                         WHERE id = @UnitId";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UnitName", UnitName);
                    cmd.Parameters.AddWithValue("@AreaName", AreaName);
                    cmd.Parameters.AddWithValue("@ParentID", (object?)ParentID ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@UnitId", id);

                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Delete(int id)
        {
            string connectionString = "Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = "DELETE FROM Units WHERE id = @UnitId";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UnitId", id);
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }

            return RedirectToAction("Index");
        }
    }
}