using CreateLogSheet.Models;
using CreateLogSheet.Services;
using Microsoft.AspNetCore.Mvc;

namespace CreateLogSheet.Controllers
{
    public class LogSheetReportController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly LogSheetService _logSheetService;

        public LogSheetReportController(ILogger<HomeController> logger)
        {
            _logger = logger;
            _logSheetService = new LogSheetService("Server=SAP-16;User Id=sa;Password=137011;Database=logsheet;TrustServerCertificate=True");
        }

        public IActionResult Index()
        {
            // گرفتن همه رکوردها برای پر کردن MultiSelect ها
            var allData = _logSheetService.GetSheetReport(3);

            // View مدل List<MeasurementPoint> خواهد بود
            return View(allData);
        } 
        
        public IActionResult IndexCreatedReports()
        {
            return View();
        }

        [HttpPost]
        public IActionResult LogSheetReport([FromBody] ReportRequest request)
        {
            int unitId = 3;

            // فراخوانی سرویس با پارامتر جدید "واحد عملیاتی"
            var reportData = _logSheetService.GetSheetReport(
                unitId,
                request.SheetNames,
                request.HeaderNames,
                request.Descriptions,
                request.MeasuringPositions,
                request.Characteristics,
                request.UnitOfMeasures,
                request.OperationalUnits // ← اضافه شد
            );

            return Json(reportData);
        }

        // 📦 مدل درخواست شامل فیلد جدید
        public class ReportRequest
        {
            public List<string>? SheetNames { get; set; }
            public List<string>? HeaderNames { get; set; }
            public List<string>? Descriptions { get; set; }
            public List<string>? MeasuringPositions { get; set; }
            public List<string>? Characteristics { get; set; }
            public List<string>? UnitOfMeasures { get; set; }

            // ✅ فیلد جدید برای واحد عملیاتی
            public List<string>? OperationalUnits { get; set; }
        }
    }
}
