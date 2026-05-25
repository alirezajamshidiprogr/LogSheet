# 📊 LogSheet - سیستم ثبت و مدیریت داده‌های تولیدی

![C#](https://img.shields.io/badge/C%23-12%25-239120?logo=csharp)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8.0-512BD4?logo=dotnet)
![JavaScript](https://img.shields.io/badge/JavaScript-17%25-F7DF1E?logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green.svg)

[🇺🇸 English](README.md) | [🇮🇷 فارسی](README.fa.md)

> **LogSheet** یک نرم‌افزار تحت وب برای ثبت، مدیریت و گزارش‌گیری از داده‌های تولیدی در خطوط تولید صنعتی است. این سیستم به اپراتورها و مدیران اجازه می‌دهد تا داده‌های شیفت‌های مختلف را ثبت کرده و فرمول‌های محاسباتی را به صورت داینامیک اعمال کنند.

---
## 🖼️ دمو و پیش‌نمایش

> در حال تکمیل... (به زودی لینک دمو قرار می‌گیرد)
<img width="1852" height="1074" alt="Capture" src="https://github.com/user-attachments/assets/33f945f6-44e0-4f5a-9af6-c4c2d471d189" />


![LogSheet Demo](https://via.placeholder.com/800x400?text=Screenshot+Coming+Soon)

---
## ✨ امکانات کلیدی

- ✅ **تعریف ساختار تولید:** امکان تعریف `Measuring Point`ها، هدرها و شیت‌های مختلف.
- ✅ **ثبت داده سه شیفت:** پشتیبانی از شیفت‌های **M (صبح)**، **A (عصر)** و **E (شب)**.(در صورت نياز ميتوان برنامه شيفت ها را تغيير داد) 
- ✅ **فرمول‌نویسی پویا:** اعتبارسنجی و محاسبه خودکار مقادیر با استفاده از فرمول‌های تعریف شده در پایگاه داده (`LogSheetFormula`).
- ✅ **مدیریت کاربران و واحدها:** تعریف واحدهای مختلف سازمانی و دسترسی‌ها.
- ✅ **ذخیره‌سازی داده‌های تاریخی:** نگهداری تاریخچه کامل لاگ‌ها برای تحلیل روند تولید.
- ✅ **گزارش‌گیری هوشمند:** خروجی گزارش‌های روزانه، ماهانه و دوره‌ای.
- ✅ **پشتیبانی از تاریخ شمسی:** نمایش و ثبت داده‌ها بر اساس تقویم هجری شمسی.

---
## 🛠️ تکنولوژی‌های استفاده شده

**Back-End:**
- **.NET 8 / .NET Core:** فریمورک اصلی توسعه
- **Entity Framework Core:**ORM برای ارتباط با دیتابیس (Code-First)
- **SQL Server:** پایگاه داده رابطه‌ای

**Front-End:**
- **ASP.NET Core MVC / Razor Pages:** معماری سمت سرور
- **HTML5, CSS3, JavaScript:** ساختار و تعاملات پایه
- **Bootstrap 5:** ریسپانسیو و استایل‌بندی (در صورت استفاده)
- **SweetAlert2 / Select2:** کتابخانه‌های کمکی برای بهبود UI/UX

**ابزارها و متدولوژی:**
- **Git & GitHub:** کنترل نسخه
- **Clean Code & SOLID Principles:** اصول کدنویسی

---
## 🚀 نحوه نصب و اجرا

برای راه‌اندازی پروژه روی سیستم خود، مراحل زیر را دنبال کنید.

### پیش‌نیازها
- [.NET 7 SDK](https://dotnet.microsoft.com/en-us/download) یا بالاتر
- [SQL Server]
- [Git](https://git-scm.com/) (برای clone کردن)

### مراحل گام به گام

1.  **Clone مخزن**
    ```bash
    git clone https://github.com/alirezajamshidiprogr/LogSheet.git
    cd LogSheet/CreateLogSheet
