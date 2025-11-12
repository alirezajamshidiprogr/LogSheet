using CreateLogSheet.Models;
using CreateLogSheet.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Diagnostics;
using System.Globalization;

namespace CreateLogSheet.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly LogSheetService _logSheetService;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
            _logSheetService = new LogSheetService("Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True");
        }

        public IActionResult Index(int unitId)
        {
            PersianCalendar pc = new PersianCalendar();
            DateTime getDateNow = DateTime.Now;

            string persianDate = $"{pc.GetYear(getDateNow)}/{pc.GetMonth(getDateNow):00}/{pc.GetDayOfMonth(getDateNow):00}";

            // برگرداندن تمام داده‌های sheet‌ها
            var allSheets = _logSheetService.GetSheetData(unitId, persianDate, null);

            return View(allSheets);
        }

        public IActionResult GetSheetData(string sheetName, string getDate)
        {
            var result = _logSheetService.GetSheetData(3,getDate, sheetName);
            return PartialView("_SheetDataPartial", result);
        }

        [HttpPost]
        public IActionResult SaveAllShifts([FromBody] SaveShiftsRequest request)
        {
            if (request == null) return BadRequest("هیچ داده‌ای ارسال نشده است.");

            _logSheetService.SaveAllShifts(request, 3, "jamshidi");
            return Ok(new { success = true });
        }
    }
}
