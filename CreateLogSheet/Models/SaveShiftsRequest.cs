namespace CreateLogSheet.Models
{
    public class SaveShiftsRequest
    {
        // کلید: شیفت (M, A, E)
        // مقدار: لیست از آبجکت‌هایی که key = FunctionLocation و value = عدد
        public Dictionary<string, List<Dictionary<string, double>>> ShiftData { get; set; }

        public string LogSheetDate { get; set; } // رشته تاریخ، بعدا در اکشن تبدیل به DateTime
    }
}
