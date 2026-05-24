using System;
using System.Collections.Generic;

namespace CreateLogSheet.Models
{
    public class SavedReportViewModel
    {
        /// <summary>
        /// شناسه یکتای گزارش
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// نام گزارش
        /// </summary>
        public string ReportName { get; set; }

        /// <summary>
        /// واحد عملیاتی مربوط به گزارش
        /// </summary>
        public string OperationalUnit { get; set; }

        /// <summary>
        /// نوع دسترسی (public / private)
        /// </summary>
        public string AccessType { get; set; }

        /// <summary>
        /// تاریخ شروع بازه زمانی گزارش
        /// </summary>
        public string StartDate { get; set; }

        /// <summary>
        /// تاریخ پایان بازه زمانی گزارش
        /// </summary>
        public string EndDate { get; set; }

        /// <summary>
        /// تاریخ ایجاد گزارش
        /// </summary>
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// شناسه کاربر ایجاد کننده گزارش (برای گزارش‌های خصوصی)
        /// </summary>
        public int? CreatedByUserId { get; set; }

        /// <summary>
        /// نام کاربر ایجاد کننده گزارش
        /// </summary>
        public string CreatedByUserName { get; set; }

        /// <summary>
        /// تعداد فیلترهای اعمال شده در گزارش
        /// </summary>
        public int FiltersCount { get; set; }

        /// <summary>
        /// فیلترهای اعمال شده در گزارش (به صورت JSON)
        /// </summary>
        public ReportFilters Filters { get; set; }

        /// <summary>
        /// دیتای جدول گزارش (به صورت JSON)
        /// </summary>
        public List<Dictionary<string, object>> ReportData { get; set; }

        /// <summary>
        /// توضیحات اضافی (اختیاری)
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// آیا گزارش فعال است؟
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// آخرین تاریخ ویرایش
        /// </summary>
        public DateTime? LastModifiedDate { get; set; }
    }

    /// <summary>
    /// مدل فیلترهای گزارش
    /// </summary>
    public class ReportFilters
    {
        public List<string> SheetNames { get; set; } = new List<string>();
        public List<string> HeaderNames { get; set; } = new List<string>();
        public List<string> Descriptions { get; set; } = new List<string>();
        public List<string> MeasuringPositions { get; set; } = new List<string>();
        public List<string> Characteristics { get; set; } = new List<string>();
        public List<string> UnitOfMeasures { get; set; } = new List<string>();
        public List<string> OperationalUnits { get; set; } = new List<string>();
    }

    /// <summary>
    /// مدل برای ایجاد گزارش جدید
    /// </summary>
    public class CreateReportViewModel
    {
        public string ReportName { get; set; }
        public string OperationalUnit { get; set; }
        public string AccessType { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public ReportFilters Filters { get; set; }
        public List<Dictionary<string, object>> ReportData { get; set; }
    }

    /// <summary>
    /// مدل برای ویرایش گزارش
    /// </summary>
    public class UpdateReportViewModel
    {
        public int Id { get; set; }
        public string ReportName { get; set; }
        public string AccessType { get; set; }
        public string Description { get; set; }
    }
}