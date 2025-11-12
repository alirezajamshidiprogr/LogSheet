let countChange = 0;



// کلیک روی sheets
document.querySelectorAll('.sheet-item').forEach(item => {
    item.addEventListener('click', async function () {
        checkAnyInputChanged();
        const value = document.getElementById('logSheetDate').value.trim();
        const sheetName = this.dataset.sheet;
        const safeId = sheetName.replace(/[^a-zA-Z0-9]/g, '_');

        if (!isValidDate(value)) {
            await Swal.fire({
                icon: 'warning',
                title: 'تاريخ را جهت ثبت مقادير لاگ شيبت مشخص كنيد.',
                showConfirmButton: true,
                confirmButtonText: 'باشه',
                timer: 4000,
                timerProgressBar: true
            });
            return;
        }

        // مدیریت استایل فعال/غیرفعال
        document.querySelectorAll('.sheet-item').forEach(li => li.classList.remove('active-sheet'));
        this.classList.add('active-sheet');

        // Fetch داده‌های جدید و رفرش div
        try {
            saveLogSheetData();

            const response = await fetch(`/Home/GetSheetData?sheetName=${encodeURIComponent(sheetName)}&getDate=${encodeURIComponent(value)}`);
            if (!response.ok) throw new Error('خطا در پاسخ سرور');

            const html = await response.text();

            // فقط اگر کاربر "بله" زد، div رفرش شود
            DisplaySheetData(html, safeId);

        } catch (error) {
            await Swal.fire('خطا', 'خطا در بارگذاری داده‌های Sheet', 'error');
            console.error('Fetch error:', error);
        }
    });
});

function DisplaySheetData(html, safeId) {
    $('#sheet-' + safeId).html(html).show();
    var $container = $('#sheet-' + safeId);
    $('#sheet-' + safeId).attr('data-active', 'true');
    $container.html(html).show();
    enableArrowNavigation($container[0]);
    $container.find('.form-control').each(function () {
        $(this).on('blur', function () {
            SetInputValuesLogsheet(this);
            // بررسي اعتبار مقدار input
            callValidationInputs(this);
        });
    });
}


// نمایش Sheet انتخاب شده
document.querySelectorAll('.sheet-item').forEach(item => {
    item.addEventListener('click', function () {
        let sheetKey = this.dataset.sheet;
        document.querySelectorAll('.sheet-data').forEach(div => div.style.display = 'none');
        let target = document.getElementById('sheet-' + sheetKey);
        if (target) target.style.display = 'block';
    });
});

// دکمه نوسازی
document.getElementById('resetBtn').addEventListener('click', function () {
    document.querySelectorAll('.sheet-data').forEach(div => {
        // گرفتن تمام inputهای فعال داخل هر div
        div.querySelectorAll('input:not([disabled])').forEach(input => input.value = "");
    });
});

// دکمه ذخیره
document.getElementById('saveBtn').addEventListener('click', function () {
    saveLogSheetData();
});

function saveLogSheetData() {

    var value = $('#logSheetDate').val().trim();
    if (!isValidDate(value)) {
        Swal.fire({
            icon: 'warning', // یا 'info' / 'success'
            title: ' تاريخ را جهت ثبت مقادير لاگ شيبت مشخص كنيد  . ',
            showConfirmButton: true,
            confirmButtonText: 'باشه',
            timer: 4000, // بعد از ۴ ثانیه خودکار بسته شود
            timerProgressBar: true
        });
        return;
    }
    const sheets = document.querySelectorAll('.sheet-data');
    // بررسی اینکه آیا حداقل یک div فعال داریم
    const hasActive = Array.from(sheets).some(el => el.getAttribute('data-active') === 'true');

    const shiftData = collectNightShiftInputs();
    // بررسی اینکه حداقل یک داده وجود دارد
    const hasData = Object.values(shiftData).some(arr => arr.length > 0);
    if (!hasActive || !hasData) {
        // هیچ div فعالی پیدا نشد → نمایش خطا
        //Swal.fire({
        //    icon: 'warning', // یا 'info' / 'success'
        //    title: 'هيچ داده اي جهت ذخيره سازي يافت نشد !',
        //    showConfirmButton: true,
        //    confirmButtonText: 'باشه',
        //    timer: 4000, // بعد از ۴ ثانیه خودکار بسته شود
        //    timerProgressBar: true
        //});
    } else {
        Swal.fire({
            title: 'آیا مطمئن هستید؟',
            text: 'تغييرات با عدم ذخيره سازي پاك مي شوند  .',
            icon: 'question',   // اینجا نوع question است
            showCancelButton: true, // نمایش دکمه لغو
            confirmButtonText: 'بله، ذخیره شود',
            cancelButtonText: 'خیر، فعلاً نه',
            reverseButtons: true   // جابجایی دکمه‌ها برای تجربه بهتر
        }).then((result) => {
            if (result.isConfirmed) {
                const payload = {
                    ShiftData: collectNightShiftInputs(),   // خروجی تابع بالا
                    LogSheetDate: $("#logSheetDate").val() // yyyy/MM/dd از input تاریخ
                };

                $.ajax({
                    url: '/Home/SaveAllShifts',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function (response) {
                        Swal.fire('موفقیت!', 'داده‌ها با موفقیت ذخیره شدند.', 'success');
                    },
                    error: function (err) {
                        Swal.fire('خطا!', 'مشکلی در ذخیره‌سازی رخ داد.', 'error');
                    }
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // کاربر لغو کرده
                console.log('کاربر ذخیره را لغو کرد');
            }
        });
    }
}
// تابعی که Arrow Key navigation رو روی input های فعال اعمال می‌کنه
function enableArrowNavigation(container) {
    const sheet = container || document;
    const activeInputs = Array.from(sheet.querySelectorAll('input[type="text"]:not([disabled])'));

    activeInputs.forEach(input => {
        input.addEventListener('keydown', function (e) {
            const row = input.closest('.row');
            if (!row) return;

            const rows = Array.from(sheet.querySelectorAll('.row'));
            const rowIndex = rows.indexOf(row);
            const rowInputs = Array.from(row.querySelectorAll('input[type="text"]:not([disabled])'));
            const colIndex = rowInputs.indexOf(input);

            switch (e.key) {
                case "ArrowRight":
                    e.preventDefault();
                    if (colIndex + 1 < rowInputs.length)
                        rowInputs[colIndex + 1].focus();
                    break;

                case "ArrowLeft":
                    e.preventDefault();
                    if (colIndex - 1 >= 0)
                        rowInputs[colIndex - 1].focus();
                    break;

                case "ArrowDown":
                case "Enter": // ✅ اضافه شد: Enter هم مثل ArrowDown عمل کند
                    e.preventDefault();
                    const nextRow = rows[rowIndex + 1];
                    if (nextRow) {
                        const nextRowInputs = Array.from(nextRow.querySelectorAll('input[type="text"]:not([disabled])'));
                        if (nextRowInputs[colIndex]) {
                            nextRowInputs[colIndex].focus();
                            nextRowInputs[colIndex].select(); // متن را انتخاب کند
                        }
                    }
                    break;

                case "ArrowUp":
                    e.preventDefault();
                    const prevRow = rows[rowIndex - 1];
                    if (prevRow) {
                        const prevRowInputs = Array.from(prevRow.querySelectorAll('input[type="text"]:not([disabled])'));
                        if (prevRowInputs[colIndex]) {
                            prevRowInputs[colIndex].focus();
                            prevRowInputs[colIndex].select();
                        }
                    }
                    break;
            }
        });
    });
}

// وقتی صفحه لود شد، اگر input اولیه داریم
document.addEventListener('DOMContentLoaded', () => {
    enableArrowNavigation();
});

// تابع کمکی: escape regex برای نام متغیرها (برای ساخت regex امن)
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// تابع اصلی که وقتی input تغییر کرد اجرا میشه
function SetInputValuesLogsheet(element) {
    const parentGroup = element.closest('.input-group');
    if (!parentGroup) return;

    const span = parentGroup.querySelector('.input-group-text.p-0.text-center');
    if (!span) return;

    const rawFormula = span.dataset.formularaw || '';
    const jsonFormula = span.dataset.formula || '{}';

    let varsObj = {};
    try {
        varsObj = JSON.parse(jsonFormula);
    } catch {
        varsObj = {};
    }

    // مقدار ورودی کاربر
    const inputValue = Number(element.value.replace(',', '.')) || 0;

    // اگر کاربر تغییری نداده، کاری نکن
    if (span.dataset.lastInputValue !== undefined && Number(span.dataset.lastInputValue) === inputValue) {
        return; // مقدار قبلی با مقدار فعلی یکی است، محاسبه دوباره لازم نیست
    }

    // کپی از فرمول خام
    let expr = rawFormula;

    // تابع escape برای Regex
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // جایگزینی @This با مقدار input
    expr = expr.replace(new RegExp(escapeRegex('@This'), 'g'), `(${inputValue})`);

    // جایگزینی سایر متغیرها (به جز @This و @Result)
    const matches = expr.match(/@[_A-Za-z0-9]+/g) || [];
    const used = new Set();

    matches.forEach(vname => {
        if (used.has(vname)) return;
        used.add(vname);

        if (vname === '@This' || vname === '@Result') return;

        let val = 0;
        if (varsObj[vname]?.value !== undefined)
            val = Number(varsObj[vname].value);
        if (!isFinite(val)) val = 0;

        expr = expr.replace(new RegExp(escapeRegex(vname), 'g'), `(${val})`);
    });

    // محاسبه فرمول
    let result = 0;
    try {
        if (/^[0-9\.\+\-\*\/\%\(\)\s]+$/.test(expr)) {
            result = Function('"use strict";return (' + expr + ');')();
        }
    } catch (e) {
        console.error('خطا در محاسبه:', expr, e);
    }

    if (!isFinite(result)) result = 0;

    // نمایش نتیجه در input
    element.value = result.toFixed(2);
    // ذخیره مقدار فعلی برای بررسی در دفعات بعد
    span.dataset.lastInputValue = result.toFixed(2);


}


function callValidationInputs(element) {
    // 🔹 بررسی محدوده (Range Check)
    const lower = parseFloat(element.dataset.lowerrange);
    const upper = parseFloat(element.dataset.upperrange);
    const numericValue = parseFloat(element.value);

    if (!isNaN(numericValue) && (!isNaN(lower) || !isNaN(upper))) {
        if ((!isNaN(lower) && numericValue < lower) || (!isNaN(upper) && numericValue > upper)) {
            element.style.color = 'red';
            element.style.fontWeight = 'bold';
            element.title = '⚠ مقدار خارج از محدوده مجاز است';
        } else {
            element.style.color = '';
            element.style.fontWeight = '';
            element.removeAttribute('title');
        }
    }

    // 🔹 ثبت مقدار اولیه فقط یک بار
    if (!element.hasAttribute('data-originalValue')) {
        element.setAttribute('data-originalValue', element.value);
    }

    // 🔹 بررسی تغییر مقدار و بروزرسانی data-hasChanged
    //const originalValue = element.getAttribute('data-originalValue');
    element.setAttribute('data-hasChanged', 'true');
}

// تابع برای فعال کردن همه Popoverهای صفحه
function initializePopovers(element) {
    const formula = element.dataset.formula;
    const formulaRaw = element.dataset.formularaw;
    const popup = document.getElementById('formulaPopup');

    // تابع برای escape HTML
    const escapeHtml = (str) => {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    // تابع فرمت عدد
    const formatValue = (val) => {
        if (val === null || val === undefined) return '0';
        const n = Number(val);
        return !isNaN(n) ? n.toFixed(2) : String(val);
    };

    // تبدیل JSON به HTML
    function renderFormulaHtml(jsonText) {
        if (!jsonText) return '<div style="color:red">No data</div>';

        let raw = jsonText.trim();
        if (raw.startsWith('Result:')) {
            raw = raw.substring('Result:'.length).trim();
        }

        let obj;
        try {
            obj = JSON.parse(raw);
        } catch (e) {
            return `<div style="color:red">Invalid JSON</div>`;
        }

        const spans = [];
        Object.keys(obj).forEach(key => {
            // حذف @This و Result از خروجی
            if (key === '@This' || key === 'Result') return;

            const valObj = obj[key];
            const val = valObj && typeof valObj === 'object' && 'value' in valObj
                ? valObj.value
                : valObj;
            const formatted = formatValue(val);
            spans.push(
                `<span style="display:inline-block;margin:3px 6px;padding:4px 10px;
                    background:#222;color:#00ffcc;border-radius:6px;
                    font-family:monospace;font-size:15px;">
                    ${escapeHtml(key)} : ${escapeHtml(formatted)}
                 </span>`
            );
        });

        if (spans.length === 0)
            return `<div style="color:#aaa">No variables to display</div>`;

        return spans.join(' ');
    }

    // تولید HTML نهایی برای پاپ‌آپ
    const resultHtml = renderFormulaHtml(formula);

    popup.innerHTML = `
        <div style='color:wheat;font-size:18px;direction:ltr;'>${resultHtml}</div>
        <hr />
        <div style="color:#ccc;font-size:14px;">
            Formula Raw:<br><pre style="background:#111;color:#bbb;padding:8px;border-radius:5px;">${escapeHtml(formulaRaw)}</pre>
        </div>
    `;

    const rect = element.getBoundingClientRect();
    popup.style.top = (window.scrollY + rect.bottom + 6) + 'px';
    popup.style.left = (window.scrollX + rect.left) + 'px';
    popup.style.display = 'block';

    // بستن پاپ‌آپ با کلیک بیرون
    document.addEventListener('click', function handler(e) {
        if (!popup.contains(e.target) && e.target !== element) {
            popup.style.display = 'none';
            document.removeEventListener('click', handler);
        }
    });
}
// تابع ساخت tooltip ساده و زیبا
function showTooltip(target, text) {
    // حذف tooltip قبلی
    document.querySelectorAll('.custom-tooltip').forEach(t => t.remove());

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = text;

    // استایل پایه tooltip
    Object.assign(tooltip.style, {
        position: 'absolute',
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        borderRadius: '4px',
        fontSize: '13px',
        lineHeight: '1.4',
        textAlign: 'center',
        pointerEvents: 'none', // تا کلیک را مسدود نکند
        opacity: '0',
        transform: 'translateY(0px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        zIndex: 9999
    });

    document.body.appendChild(tooltip);

    // موقعیت‌یابی
    const rect = target.getBoundingClientRect();
    tooltip.style.top = (window.scrollY + rect.top - tooltip.offsetHeight - 8) + 'px';
    tooltip.style.left = (window.scrollX + rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';

    // نمایش با افکت fade
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-4px)';
    });

    // حذف هنگام blur یا کلیک بیرون
    const removeTooltip = () => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(0px)';
        setTimeout(() => tooltip.remove(), 200);
    };

    target.addEventListener('blur', removeTooltip, { once: true });
    document.addEventListener('click', (e) => {
        if (!tooltip.contains(e.target) && e.target !== target) removeTooltip();
    }, { once: true });
}
// رویداد focus برای نمایش tooltip
function DisplayToolTipDate(ev) {
    const target = ev && ev.target;

    // ایمن‌سازی: باید یک عنصر واقعی باشد و input باشد
    if (!target || target.tagName !== 'INPUT' || !target.classList.contains('form-control')) return;

    // انتخاب متن داخل input (برخی المان‌ها select ندارند)
    try { target.select(); } catch (err) { /* ignore */ }

    // خواندن data-attributeها
    const upperRange = target.dataset.upperrange;
    const lowerRange = target.dataset.lowerrange;

    if (upperRange !== undefined || lowerRange !== undefined) {
        const html = `
            <div style="direction:ltr; text-align:center; font-family: Tahoma, sans-serif;">
                <div style="font-weight:600; margin-bottom:6px;">Range</div>
                <div style="font-size:13px; color:#0ff;">
                    Min: <b>${lowerRange ?? '-'}</b> &nbsp; | &nbsp;
                    Max: <b>${upperRange ?? '-'}</b>
                </div>
            </div>
        `;
        showTooltip(target, html);
    }
}

function collectNightShiftInputs() {
    const shifts = ['M', 'A', 'E']; // Morning, Afternoon, Evening
    const result = {};

    shifts.forEach(shift => {
        const inputs = document.querySelectorAll(`input.inputToSave[data-shift="${shift}"]`);
        const shiftData = [];

        inputs.forEach(input => {
            const value = input.value.trim();
            const measuringPointId = input.getAttribute('data-measuringPointId');
            const numValue = parseFloat(value);

            if (!isNaN(numValue) && measuringPointId) {
                const obj = {};
                obj[measuringPointId] = numValue;
                shiftData.push(obj);
            }
        });

        result[shift] = shiftData;
    });

    return result;
}



function checkAnyInputChanged() {
    countChange = 0; // ریست قبل از بررسی
    const inputs = document.querySelectorAll('input.inputToSave');
    for (let input of inputs) {
        if (input.getAttribute('data-hasChanged') === 'true') {
            countChange += 1;
            break; // پیدا شد، دیگه ادامه نده
        }
    }
}


function isValidDate(value) {
    // regex برای yyyy/mm/dd
    var pattern = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!pattern.test(value)) return false;

    // بررسی منطقی ماه و روز
    var parts = value.split('/');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // بررسی دقیق‌تر برای ماه و روز (30/31 و فوریه) - اختیاری
    var daysInMonth = [31, (year % 4 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) return false;

    return true;
}


document.getElementById('btnGenerateReport').addEventListener('click', async () => {
    const sheetName = document.getElementById('sheetName').value.trim();
    const logSheetHeaderName = document.getElementById('headerName').value.trim();
    const description = document.getElementById('description').value.trim();

    const url = `/Home/LogSheetReport?sheetName=${encodeURIComponent(sheetName)}&logSheetHeaderName=${encodeURIComponent(logSheetHeaderName)}&description=${encodeURIComponent(description)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const reportList = document.getElementById('reportList');
        reportList.innerHTML = '';

        if (data.length === 0) {
            reportList.innerHTML = '<li class="list-group-item">هیچ رکوردی یافت نشد.</li>';
        } else {
            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = item.Description; // فرض بر اینه که data لیستی از MeasurementPoint است
                reportList.appendChild(li);
            });
        }
    } catch (err) {
        console.error(err);
        alert('خطا در بارگذاری گزارش');
    }
});
