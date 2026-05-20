$(document).ready(function () {
    // ========== متغیرهای گلوبال ==========
    let nextSheetId = 1000;
    let nextGroupId = 1000;
    let nextPointId = 1000;

    // ذخیره دیتا در حافظه
    let sheetsData = [];

    // نمایش/مخفی کردن بخش فرمول
    $('#pointIsFormula').change(function () {
        if ($(this).is(':checked')) {
            $('#formulaSection').slideDown();
        } else {
            $('#formulaSection').slideUp();
        }
    });

    // ========== تابع رندر همه چیز ==========
    function renderAllSheets() {
        if (sheetsData.length === 0) {
            $('#emptySheetsMessage').show();
            $('#sheets-container').html(`
                            <div class="text-center text-muted p-5" id="emptySheetsMessage">
                                <i class="bi bi-inbox fs-1"></i>
                                <p class="mt-2">هیچ شیتی تعریف نشده است</p>
                                <button class="btn btn-primary btn-sm" id="addFirstSheetBtn">
                                    <i class="bi bi-plus-circle"></i> افزودن اولین شیت
                                </button>
                            </div>
                        `);
            $('#addFirstSheetBtn').click(() => openAddSheetModal());
            return;
        }

        $('#emptySheetsMessage').hide();
        let html = '<div class="sheets-container" id="sheets-container">';

        // مرتب‌سازی شیت‌ها بر اساس Order
        let sortedSheets = [...sheetsData].sort((a, b) => a.order - b.order);

        for (let sheet of sortedSheets) {
            html += `
                            <div class="sheet-card card mb-3 shadow-sm" data-sheet-id="${sheet.id}" data-sheet-name="${escapeHtml(sheet.name)}">
                                <div class="sheet-header card-header bg-white d-flex justify-content-between align-items-center flex-wrap">
                                    <div class="d-flex align-items-center gap-3">
                                        <i class="bi bi-file-earmark-text fs-4 text-primary"></i>
                                        <strong class="fs-5">${escapeHtml(sheet.name)} : ${sheet.order}</strong>
                                        <div class="order-box d-flex align-items-center gap-2">
                               
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2 mt-2 mt-sm-0">
                                        <button class="btn btn-sm btn-outline-primary toggle-groups" data-sheet-id="${sheet.id}">
                                            <i class="bi bi-chevron-right"></i> نمایش گروه‌ها
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-sheet" data-sheet-id="${sheet.id}" data-sheet-name="${escapeHtml(sheet.name)}">
                                            <i class="bi bi-trash"></i> حذف شیت
                                        </button>
                                    </div>
                                </div>
                                <div class="groups-container p-3" id="groups-container-${sheet.id}" style="display: none;" data-sheet-id="${sheet.id}">
                                    <div class="groups-list" id="groups-list-${sheet.id}">
                                        ${renderGroups(sheet.id, sheet.groups || [])}
                                    </div>
                                </div>
                            </div>
                        `;
        }

        html += '</div>';
        html += '<div class="text-center mt-3"><button class="btn btn-outline-primary" id="addNewSheetBottomBtn"><i class="bi bi-plus-circle"></i> + افزودن شیت جدید</button></div>';

        $('#sheets-container').html(html);

        // اتصال رویدادها
        attachSheetEvents();
        $('#addNewSheetBottomBtn').click(() => openAddSheetModal());
    }

    // رندر گروه‌های یک شیت
    function renderGroups(sheetId, groups) {
        if (!groups || groups.length === 0) {
            return `
                            <div class="groups-wrapper">
                                <div class="text-center p-4 text-muted">
                                    <i class="bi bi-folder-x fs-2"></i>
                                    <p class="mt-2">هیچ گروهی تعریف نشده است</p>
                                </div>
                                <div class="text-center mt-2">
                                    <button class="btn btn-outline-success add-new-group" data-sheet-id="${sheetId}">
                                        <i class="bi bi-plus-circle"></i> + افزودن گروه جدید
                                    </button>
                                </div>
                            </div>
                        `;
        }

        let sortedGroups = [...groups].sort((a, b) => a.order - b.order);
        let html = '<div class="groups-wrapper">';

        for (let group of sortedGroups) {
            let summeryHtml = group.summery ? `<span class="badge bg-info ms-2">سامری: ${escapeHtml(group.summery)}</span>` : '';

            html += `
                            <div class="group-card card mb-3 border-secondary" data-group-id="${group.id}" data-sheet-id="${sheetId}">
                                <div class="group-header card-header bg-secondary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap">
                                    <div class="d-flex align-items-center gap-3 flex-wrap">
                                        <i class="bi bi-folder2-open text-warning fs-5"></i>
                                        <strong class="fs-6">${escapeHtml(group.name)}</strong>
                                        ${summeryHtml}
                                        <div class="order-box d-flex align-items-center gap-2">
                                            <span class="text-muted small">ترتیب:</span>
                                            <input type="number" class="form-control form-control-sm group-order-input"
                                                   value="${group.order}" data-group-id="${group.id}" style="width: 70px;">
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2 mt-2 mt-sm-0">
                                        <button class="btn btn-sm btn-outline-info toggle-points" data-group-id="${group.id}">
                                            <i class="bi bi-chevron-right"></i> نمایش نقاط
                                        </button>
                                        <button class="btn btn-sm btn-outline-warning edit-group" 
                                                data-group-id="${group.id}"
                                                data-group-name="${escapeHtml(group.name)}"
                                                data-group-summery="${group.summery || ''}"
                                                data-group-order="${group.order}">
                                            <i class="bi bi-pencil"></i> ویرایش
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-group" 
                                                data-group-id="${group.id}" 
                                                data-group-name="${escapeHtml(group.name)}">
                                            <i class="bi bi-trash"></i> حذف
                                        </button>
                                    </div>
                                </div>
                                <div class="points-container p-3" id="points-container-${group.id}" style="display: none;">
                                    ${renderPoints(group.id, group.points || [])}
                                </div>
                            </div>
                        `;
        }

        html += `
                        <div class="text-center mt-2">
                            <button class="btn btn-outline-success add-new-group" data-sheet-id="${sheetId}">
                                <i class="bi bi-plus-circle"></i> + افزودن گروه جدید
                            </button>
                        </div>
                    </div>`;

        return html;
    }

    // رندر نقاط یک گروه (با نمایش فیلدهای کامل)
    function renderPoints(groupId, points) {
        if (!points || points.length === 0) {
            return `
                            <div class="text-center p-3 text-muted">
                                <i class="bi bi-dot"></i> هیچ نقطه اندازه‌گیری تعریف نشده است
                            </div>
                            <div class="text-center mt-2">
                                <button class="btn btn-sm btn-primary add-new-point" data-group-id="${groupId}">
                                    <i class="bi bi-plus-circle"></i> افزودن نقطه جدید
                                </button>
                            </div>
                        `;
        }

        let sortedPoints = [...points].sort((a, b) => a.order - b.order);
        let html = '<div class="table-responsive"><table class="table table-sm table-bordered"><thead class="table-light">';
        html += '<tr><th>توضیحات</th><th>موقعیت</th><th>خصوصیت</th><th>واحد</th><th>ترتیب</th><th style="width: 100px">عملیات</th></tr></thead><tbody>';

        for (let point of sortedPoints) {
            let formulaBadge = point.isFormula ? '<span class="badge bg-warning text-dark ms-1">فرمولی</span>' : '';

            html += `
                            <tr class="point-row" data-point-id="${point.id}">
                                <td>
                                    <i class="bi bi-dot text-info"></i>
                                    <span>${escapeHtml(point.description)}</span>
                                    ${formulaBadge}
                                </td>
                                <td><small>${escapeHtml(point.measuringPosition || '-')}</small></td>
                                <td><small>${escapeHtml(point.characteristic || '-')}</small></td>
                                <td><small>${escapeHtml(point.unitOfMeasure || '-')}</small></td>
                                <td>
                                    <input type="number" class="form-control form-control-sm point-order-input"
                                           value="${point.order}" data-point-id="${point.id}" style="width: 70px;">
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-warning edit-point me-1" 
                                            data-point-id="${point.id}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-point" 
                                            data-point-id="${point.id}" 
                                            data-point-description="${escapeHtml(point.description)}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
        }

        html += '</tbody></table></div>';
        html += '<div class="text-center mt-2"><button class="btn btn-sm btn-outline-success add-new-point" data-group-id="' + groupId + '"><i class="bi bi-plus-circle"></i> افزودن نقطه جدید</button></div>';

        return html;
    }

    // ========== رویدادهای شیت ==========
    function attachSheetEvents() {
        // نمایش/مخفی کردن گروه‌ها
        $('.toggle-groups').off('click').on('click', function () {
            let sheetId = $(this).data('sheet-id');
            let container = $('#groups-container-' + sheetId);

            if (container.is(':visible')) {
                container.slideUp();
                $(this).html('<i class="bi bi-chevron-right"></i> نمایش گروه‌ها');
            } else {
                container.slideDown();
                $(this).html('<i class="bi bi-chevron-down"></i> مخفی کردن گروه‌ها');
            }
        });

        // حذف شیت
        $('.delete-sheet').off('click').on('click', function () {
            let id = $(this).data('sheet-id');
            let name = $(this).data('sheet-name');

            Swal.fire({
                title: 'حذف شیت',
                text: `آیا از حذف شیت "${name}" اطمینان دارید؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'بله، حذف شود',
                cancelButtonText: 'انصراف'
            }).then((result) => {
                if (result.isConfirmed) {
                    sheetsData = sheetsData.filter(s => s.id !== id);
                    renderAllSheets();
                    Swal.fire('موفق', 'شیت با موفقیت حذف شد', 'success');
                }
            });
        });

        // تغییر ترتیب شیت
        $('.sheet-order-input').off('change').on('change', function () {
            let sheetId = $(this).data('sheet-id');
            let newOrder = parseInt($(this).val());
            let sheet = sheetsData.find(s => s.id === sheetId);
            if (sheet) {
                sheet.order = newOrder;
            }
        });

        // رویدادهای گروه
        attachGroupEvents();
    }

    // ========== رویدادهای گروه ==========
    function attachGroupEvents() {
        // ویرایش گروه
        $('.edit-group').off('click').on('click', function () {
            let groupId = $(this).data('group-id');
            let groupName = $(this).data('group-name');
            let groupSummery = $(this).data('group-summery');
            let groupOrder = $(this).data('group-order');

            let sheetCard = $(this).closest('.sheet-card');
            let sheetId = sheetCard.data('sheet-id');

            $('#editGroupId').val(groupId);
            $('#currentSheetId').val(sheetId);
            $('#groupName').val(groupName);
            $('#groupSummery').val(groupSummery);
            $('#groupOrder').val(groupOrder);
            $('#groupModal').modal('show');
        });

        // حذف گروه
        $('.delete-group').off('click').on('click', function () {
            let groupId = $(this).data('group-id');
            let groupName = $(this).data('group-name');

            Swal.fire({
                title: 'حذف گروه',
                text: `آیا از حذف گروه "${groupName}" اطمینان دارید؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'بله، حذف شود',
                cancelButtonText: 'انصراف'
            }).then((result) => {
                if (result.isConfirmed) {
                    for (let sheet of sheetsData) {
                        if (sheet.groups) {
                            let index = sheet.groups.findIndex(g => g.id === groupId);
                            if (index !== -1) {
                                sheet.groups.splice(index, 1);
                                break;
                            }
                        }
                    }
                    renderAllSheets();
                    Swal.fire('موفق', 'گروه با موفقیت حذف شد', 'success');
                }
            });
        });

        // تغییر ترتیب گروه
        $('.group-order-input').off('change').on('change', function () {
            let groupId = $(this).data('group-id');
            let newOrder = parseInt($(this).val());

            for (let sheet of sheetsData) {
                if (sheet.groups) {
                    let group = sheet.groups.find(g => g.id === groupId);
                    if (group) {
                        group.order = newOrder;
                        break;
                    }
                }
            }
        });

        // نمایش/مخفی کردن نقاط
        $('.toggle-points').off('click').on('click', function () {
            let groupId = $(this).data('group-id');
            let container = $('#points-container-' + groupId);

            if (container.is(':visible')) {
                container.slideUp();
                $(this).html('<i class="bi bi-chevron-right"></i> نمایش نقاط');
            } else {
                container.slideDown();
                $(this).html('<i class="bi bi-chevron-down"></i> مخفی کردن نقاط');
            }
        });

        // افزودن گروه جدید
        $('.add-new-group').off('click').on('click', function () {
            let sheetId = $(this).data('sheet-id');
            let sheet = sheetsData.find(s => s.id === sheetId);
            let lastOrder = sheet && sheet.groups && sheet.groups.length > 0
                ? Math.max(...sheet.groups.map(g => g.order)) + 1
                : 1;

            $('#editGroupId').val('');
            $('#currentSheetId').val(sheetId);
            $('#groupName').val('');
            $('#groupSummery').val('');
            $('#groupOrder').val(lastOrder);
            $('#groupModal').modal('show');
        });

        // رویدادهای نقطه
        attachPointEvents();
    }

    // ========== رویدادهای نقطه ==========
    function attachPointEvents() {
        // ویرایش نقطه - باز کردن Modal با داده‌های موجود
        $('.edit-point').off('click').on('click', function () {
            let pointId = $(this).data('point-id');
            let groupId = $(this).closest('.group-card').data('group-id');

            // پیدا کردن نقطه مورد نظر
            let targetPoint = null;
            for (let sheet of sheetsData) {
                if (sheet.groups) {
                    for (let group of sheet.groups) {
                        if (group.id === groupId && group.points) {
                            targetPoint = group.points.find(p => p.id === pointId);
                            break;
                        }
                    }
                }
                if (targetPoint) break;
            }

            if (targetPoint) {
                $('#editPointId').val(pointId);
                $('#currentHeaderId').val(groupId);
                $('#pointDescription').val(targetPoint.description || '');
                $('#pointMeasuringPosition').val(targetPoint.measuringPosition || '');
                $('#pointCharacteristic').val(targetPoint.characteristic || 'Pressure');
                $('#pointUnitOfMeasure').val(targetPoint.unitOfMeasure || '');
                $('#pointUpperRange').val(targetPoint.upperRange || '');
                $('#pointLowerRange').val(targetPoint.lowerRange || '');
                $('#pointOrder').val(targetPoint.order || 1);
                $('#pointIsFormula').prop('checked', targetPoint.isFormula || false);
                $('#pointFormulaRaw').val(targetPoint.formulaRaw || '');
                $('#pointConstantValue').val(targetPoint.constantValue || '');

                if (targetPoint.isFormula) {
                    $('#formulaSection').show();
                } else {
                    $('#formulaSection').hide();
                }

                $('#pointModal').modal('show');
            }
        });

        // حذف نقطه
        $('.delete-point').off('click').on('click', function () {
            let pointId = $(this).data('point-id');
            let pointDescription = $(this).data('point-description');

            Swal.fire({
                title: 'حذف نقطه',
                text: `آیا از حذف "${pointDescription}" اطمینان دارید؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'بله، حذف شود',
                cancelButtonText: 'انصراف'
            }).then((result) => {
                if (result.isConfirmed) {
                    for (let sheet of sheetsData) {
                        if (sheet.groups) {
                            for (let group of sheet.groups) {
                                if (group.points) {
                                    let index = group.points.findIndex(p => p.id === pointId);
                                    if (index !== -1) {
                                        group.points.splice(index, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    renderAllSheets();
                    Swal.fire('موفق', 'نقطه با موفقیت حذف شد', 'success');
                }
            });
        });

        // تغییر ترتیب نقطه
        $('.point-order-input').off('change').on('change', function () {
            let pointId = $(this).data('point-id');
            let newOrder = parseInt($(this).val());

            for (let sheet of sheetsData) {
                if (sheet.groups) {
                    for (let group of sheet.groups) {
                        if (group.points) {
                            let point = group.points.find(p => p.id === pointId);
                            if (point) {
                                point.order = newOrder;
                                break;
                            }
                        }
                    }
                }
            }
        });

        // افزودن نقطه جدید
        $('.add-new-point').off('click').on('click', function () {
            let groupId = $(this).data('group-id');

            // پیدا کردن گروه و محاسبه آخرین order
            let lastOrder = 1;
            for (let sheet of sheetsData) {
                if (sheet.groups) {
                    let group = sheet.groups.find(g => g.id === groupId);
                    if (group && group.points && group.points.length > 0) {
                        lastOrder = Math.max(...group.points.map(p => p.order)) + 1;
                    }
                }
            }

            // ریست فرم
            $('#editPointId').val('');
            $('#currentHeaderId').val(groupId);
            $('#pointDescription').val('');
            $('#pointMeasuringPosition').val('');
            $('#pointCharacteristic').val('Pressure');
            $('#pointUnitOfMeasure').val('');
            $('#pointUpperRange').val('');
            $('#pointLowerRange').val('');
            $('#pointOrder').val(lastOrder);
            $('#pointIsFormula').prop('checked', false);
            $('#pointFormulaRaw').val('');
            $('#pointConstantValue').val('');
            $('#formulaSection').hide();

            $('#pointModal').modal('show');
        });
    }

    // ========== توابع افزودن/ویرایش ==========

    function openAddSheetModal() {
        let lastOrder = sheetsData.length > 0 ? Math.max(...sheetsData.map(s => s.order)) + 1 : 1;
        $('#sheetName').val('');
        $('#sheetOrder').val(lastOrder);
        $('#sheetModal').modal('show');
    }

    // ذخیره شیت
    $('#saveSheetBtn').click(function () {
        let name = $('#sheetName').val().trim();
        let order = parseInt($('#sheetOrder').val());

        if (!name) {
            Swal.fire('خطا', 'نام شیت الزامی است', 'error');
            return;
        }

        let newSheet = {
            id: nextSheetId++,
            name: name,
            order: order,
            groups: []
        };

        sheetsData.push(newSheet);
        renderAllSheets();
        $('#sheetModal').modal('hide');
        Swal.fire('موفق', 'شیت با موفقیت اضافه شد', 'success');
    });

    // ذخیره گروه
    $('#saveGroupBtn').click(function () {
        let groupId = $('#editGroupId').val();
        let sheetId = parseInt($('#currentSheetId').val());
        let name = $('#groupName').val().trim();
        let summery = $('#groupSummery').val();
        let order = parseInt($('#groupOrder').val());

        if (!name) {
            Swal.fire('خطا', 'نام گروه الزامی است', 'error');
            return;
        }

        let sheet = sheetsData.find(s => s.id === sheetId);
        if (!sheet) {
            Swal.fire('خطا', 'شیت مورد نظر یافت نشد', 'error');
            return;
        }

        if (!sheet.groups) sheet.groups = [];

        if (groupId) {
            let existingGroup = sheet.groups.find(g => g.id === parseInt(groupId));
            if (existingGroup) {
                existingGroup.name = name;
                existingGroup.summery = summery;
                existingGroup.order = order;
            }
        } else {
            sheet.groups.push({
                id: nextGroupId++,
                name: name,
                summery: summery,
                order: order,
                points: []
            });
        }

        renderAllSheets();
        $('#groupModal').modal('hide');
        Swal.fire('موفق', 'گروه با موفقیت ذخیره شد', 'success');
    });

    // ذخیره نقطه با فیلدهای کامل
    $('#savePointBtn').click(function () {
        let pointId = $('#editPointId').val();
        let groupId = parseInt($('#currentHeaderId').val());
        let description = $('#pointDescription').val().trim();
        let measuringPosition = $('#pointMeasuringPosition').val().trim();
        let characteristic = $('#pointCharacteristic').val();
        let unitOfMeasure = $('#pointUnitOfMeasure').val().trim();
        let upperRange = $('#pointUpperRange').val().trim();
        let lowerRange = $('#pointLowerRange').val().trim();
        let order = parseInt($('#pointOrder').val());
        let isFormula = $('#pointIsFormula').is(':checked');
        let formulaRaw = $('#pointFormulaRaw').val().trim();
        let constantValue = $('#pointConstantValue').val().trim();

        if (!description) {
            Swal.fire('خطا', 'توضیحات نقطه الزامی است', 'error');
            return;
        }

        // پیدا کردن گروه
        let targetGroup = null;
        for (let sheet of sheetsData) {
            if (sheet.groups) {
                let group = sheet.groups.find(g => g.id === groupId);
                if (group) {
                    targetGroup = group;
                    break;
                }
            }
        }

        if (!targetGroup) {
            Swal.fire('خطا', 'گروه مورد نظر یافت نشد', 'error');
            return;
        }

        if (!targetGroup.points) targetGroup.points = [];

        if (pointId) {
            // ویرایش نقطه موجود
            let existingPoint = targetGroup.points.find(p => p.id === parseInt(pointId));
            if (existingPoint) {
                existingPoint.description = description;
                existingPoint.measuringPosition = measuringPosition;
                existingPoint.characteristic = characteristic;
                existingPoint.unitOfMeasure = unitOfMeasure;
                existingPoint.upperRange = upperRange;
                existingPoint.lowerRange = lowerRange;
                existingPoint.order = order;
                existingPoint.isFormula = isFormula;
                existingPoint.formulaRaw = formulaRaw;
                existingPoint.constantValue = constantValue;
            }
        } else {
            // افزودن نقطه جدید
            targetGroup.points.push({
                id: nextPointId++,
                description: description,
                measuringPosition: measuringPosition,
                characteristic: characteristic,
                unitOfMeasure: unitOfMeasure,
                upperRange: upperRange,
                lowerRange: lowerRange,
                order: order,
                isFormula: isFormula,
                formulaRaw: formulaRaw,
                constantValue: constantValue
            });
        }

        renderAllSheets();
        $('#pointModal').modal('hide');
        Swal.fire('موفق', 'نقطه با موفقیت ذخیره شد', 'success');
    });

    // ذخیره همه تغییرات
    $('#saveAllOrders').click(function () {
        console.log('دیتای نهایی:', JSON.stringify(sheetsData, null, 2));
        Swal.fire('موفق', 'دیتا در کنسول مرورگر ذخیره شد', 'success');
    });

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    $('#addNewSheetBtn').click(() => openAddSheetModal());
    $('#addFirstSheetBtn').click(() => openAddSheetModal());
});