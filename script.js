// คอนฟิกสำหรับดึงข้อมูลเป้าหมาย
const TARGET_CONFIG = {
    SHEET_ID: '15eCkphn1ZCWJu1fg3ppe3Os-bKxAb4alvC33mAEgGrw', // ID เดียวกัน
    SHEET_NAME: 'เป้าหมาย',
    DATA_URLS: [
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHlqFXL5N8DKNhyg8au_M9eypFk65rXRgXdCna7pO9gadqpHLmtcz8FHKeCaBlxuqGcIY60PxUhyu-/pub?gid=980262450&single=true&output=csv',
        `https://opensheet.elk.sh/${CONFIG.SHEET_ID}/${encodeURIComponent('เป้าหมาย')}`
    ]
};

// ตัวแปรเก็บข้อมูลเป้าหมาย
let targetData = null;
let currentProjectType = 'plant-cane-in-rice-field';
let selectedZones = [];

// ฟังก์ชันโหลดข้อมูลเป้าหมาย
function loadTargetData(forceRefresh = false) {
    $('#target-loading-status').html('<small><i class="fas fa-spinner fa-spin me-1"></i> กำลังโหลดข้อมูลเป้าหมาย...</small>');
    
    // ตรวจสอบแคชก่อน
    if (!forceRefresh) {
        const cachedTargets = getCachedData('targetData');
        if (cachedTargets) {
            targetData = cachedTargets;
            processTargetData();
            return;
        }
    }
    
    // ดึงข้อมูลจาก Google Sheet
    fetchTargetData();
}

// ดึงข้อมูลเป้าหมายจาก Google Sheet
function fetchTargetData() {
    console.log('📥 กำลังโหลดข้อมูลเป้าหมายจากชีท "เป้าหมาย"...');
    
    // ลองโหลดด้วย URL ต่างๆ
    tryLoadTargetData(0);
}

function tryLoadTargetData(index) {
    if (index >= TARGET_CONFIG.DATA_URLS.length) {
        console.error('❌ ไม่สามารถโหลดข้อมูลเป้าหมายได้');
        $('#target-loading-status').html('<small class="text-warning"><i class="fas fa-exclamation-triangle me-1"></i> ไม่สามารถโหลดข้อมูลเป้าหมาย</small>');
        return;
    }
    
    const url = TARGET_CONFIG.DATA_URLS[index];
    
    if (url.includes('opensheet.elk.sh')) {
        // JSON format
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            timeout: 15000,
            success: function(data) {
                handleTargetDataSuccess(data);
            },
            error: function(xhr, status, error) {
                console.error(`❌ โหลดเป้าหมาย JSON ล้มเหลว:`, error);
                tryLoadTargetData(index + 1);
            }
        });
    } else {
        // CSV format
        Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-8',
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    handleTargetDataSuccess(results.data);
                } else {
                    console.log(`❌ เป้าหมาย CSV ไม่มีข้อมูล`);
                    tryLoadTargetData(index + 1);
                }
            },
            error: function(error) {
                console.error(`❌ เป้าหมาย CSV ล้มเหลว:`, error);
                tryLoadTargetData(index + 1);
            }
        });
    }
}

function handleTargetDataSuccess(data) {
    console.log(`✅ โหลดข้อมูลเป้าหมายสำเร็จ: ${data.length} รายการ`);
    
    targetData = data;
    
    // แคชข้อมูล
    cacheData('targetData', data);
    
    // ประมวลผลข้อมูล
    processTargetData();
    
    // อัพเดต UI
    $('#target-loading-status').html('<small class="text-success"><i class="fas fa-check-circle me-1"></i> โหลดข้อมูลเป้าหมายสำเร็จ</small>');
    
    setTimeout(() => {
        $('#target-loading-status').html('');
    }, 2000);
}

function processTargetData() {
    if (!targetData || targetData.length === 0) {
        console.warn('⚠️ ไม่พบข้อมูลเป้าหมาย');
        return;
    }
    
    // ตรวจสอบโครงสร้างข้อมูล
    console.log('โครงสร้างข้อมูลเป้าหมาย:', targetData[0]);
    
    // อัพเดตเป้าหมาย
    updateProjectTargets();
}

// ฟังก์ชันเริ่มต้น Project Stats
function initializeProjectStats() {
    // โหลดข้อมูลเป้าหมาย
    loadTargetData();
    
    // เพิ่ม event listener สำหรับปุ่มเลือกโครงการ
    $('.project-type-btn').click(function() {
        $('.project-type-btn').removeClass('active');
        $(this).addClass('active');
        
        currentProjectType = $(this).data('project-type');
        updateProjectTargets();
        updateProjectProgress();
    });
    
    // ตั้งค่าเริ่มต้น
    updateProjectTargets();
}

// อัพเดตข้อมูลเป้าหมายจากข้อมูลที่โหลดมา
function updateProjectTargets() {
    if (!targetData) {
        $('#active-project-target').text('0');
        return;
    }
    
    // ค้นหาหัวคอลัมน์ที่เกี่ยวข้อง
    const firstRow = targetData[0];
    const headers = Object.keys(firstRow);
    
    console.log('headers ในชีทเป้าหมาย:', headers);
    
    // ค้นหาคอลัมน์ที่เกี่ยวข้อง (รองรับหลายชื่อ)
    let zoneColumn = null;
    let target1Column = null;
    let target2Column = null;
    
    // ค้นหาคอลัมน์เขต
    const zoneKeywords = ['เขต', 'พื้นที่', 'Zone', 'Area'];
    zoneColumn = headers.find(h => zoneKeywords.some(keyword => h.includes(keyword)));
    
    // ค้นหาคอลัมน์เป้าหมายปลูกอ้อยในนา
    const target1Keywords = ['เป้าปลูกอ้อยในนา', 'ปลูกอ้อยในนา', 'เป้าหมาย1', 'Target1'];
    target1Column = headers.find(h => target1Keywords.some(keyword => h.includes(keyword)));
    
    // ค้นหาคอลัมน์เป้าหมายเปลี่ยนพืชอื่นมาปลูกอ้อย
    const target2Keywords = ['เป้าเปลี่ยนพืชอื่นมาปลูกอ้อย', 'เปลี่ยนพืชอื่นมาปลูกอ้อย', 'เป้าหมาย2', 'Target2'];
    target2Column = headers.find(h => target2Keywords.some(keyword => h.includes(keyword)));
    
    console.log('พบคอลัมน์:', { zoneColumn, target1Column, target2Column });
    
    // ถ้าหาไม่เจอ ให้ใช้คอลัมน์แรกๆ
    if (!zoneColumn && headers.length > 0) zoneColumn = headers[0];
    if (!target1Column && headers.length > 1) target1Column = headers[1];
    if (!target2Column && headers.length > 2) target2Column = headers[2];
    
    // คำนวณผลรวมตามโครงการที่เลือก
    let totalTarget = 0;
    const zoneTargets = {};
    
    targetData.forEach(row => {
        const zone = row[zoneColumn] ? row[zoneColumn].toString().trim() : '';
        
        if (zone) {
            // คำนวณเป้าหมายตามโครงการที่เลือก
            if (currentProjectType === 'plant-cane-in-rice-field') {
                const targetValue = parseTargetValue(row[target1Column]);
                if (!isNaN(targetValue)) {
                    totalTarget += targetValue;
                    zoneTargets[zone] = targetValue;
                }
            } else if (currentProjectType === 'change-to-cane') {
                const targetValue = parseTargetValue(row[target2Column]);
                if (!isNaN(targetValue)) {
                    totalTarget += targetValue;
                    zoneTargets[zone] = targetValue;
                }
            }
        }
    });
    
    // บันทึกข้อมูลเป้าหมายตามเขต
    window.targetZoneData = {
        projectType: currentProjectType,
        total: totalTarget,
        zoneTargets: zoneTargets
    };
    
    // อัพเดต UI
    const projectName = currentProjectType === 'plant-cane-in-rice-field' ? 'ปลูกอ้อยในนา' : 'เปลี่ยนพืชอื่นมาปลูกอ้อย';
    const badgeColor = currentProjectType === 'plant-cane-in-rice-field' ? 'success' : 'warning';
    
    $('#active-project-target').text(formatNumber(totalTarget));
    $('#current-project-badge').text(projectName).removeClass('bg-success bg-warning').addClass(`bg-${badgeColor}`);
    $('#current-project-type').text(projectName);
    
    // คำนวณเป้าหมายตามเขตที่เลือก
    calculateZoneTarget();
    
    // อัพเดตจำนวนที่เหลือ
    $('#remaining-projects').text(formatNumber(totalTarget));
}

// ฟังก์ชันแปลงค่าจาก string เป็น number
function parseTargetValue(value) {
    if (!value) return 0;
    
    // ลบ comma และแปลงเป็นตัวเลข
    const cleanValue = value.toString().replace(/,/g, '').trim();
    const num = parseFloat(cleanValue);
    
    return isNaN(num) ? 0 : num;
}

// คำนวณเป้าหมายตามเขตที่เลือก
function calculateZoneTarget() {
    if (!window.targetZoneData) {
        $('#selected-zone-target').text('0');
        $('#selected-zone-count').text('0');
        return;
    }
    
    const { zoneTargets } = window.targetZoneData;
    
    if (selectedZones.length === 0) {
        // ถ้าไม่เลือกเขตใดเลย
        $('#selected-zone-target').text(formatNumber(window.targetZoneData.total));
        $('#selected-zone-count').text('ทั้งหมด');
    } else {
        // คำนวณเฉพาะเขตที่เลือก
        let zoneTarget = 0;
        let matchedZones = 0;
        
        selectedZones.forEach(zone => {
            // ลองค้นหาเขตโดยไม่สนใจ case และช่องว่าง
            const normalizedZone = zone.toString().trim();
            
            // ค้นหาใน zoneTargets
            for (const targetZone in zoneTargets) {
                const normalizedTargetZone = targetZone.toString().trim();
                if (normalizedTargetZone === normalizedZone || 
                    normalizedTargetZone.includes(normalizedZone) || 
                    normalizedZone.includes(normalizedTargetZone)) {
                    zoneTarget += zoneTargets[targetZone];
                    matchedZones++;
                    break;
                }
            }
        });
        
        $('#selected-zone-target').text(formatNumber(zoneTarget));
        $('#selected-zone-count').text(matchedZones);
    }
}

// อัพเดตความคืบหน้าโครงการ
function updateProjectProgress() {
    const totalProjects = parseInt($('#total-projects').text().replace(/,/g, '')) || 0;
    const projectTotal = window.targetZoneData ? window.targetZoneData.total : 0;
    
    // คำนวณเปอร์เซ็นต์ความคืบหน้า
    const progressPercent = projectTotal > 0 ? 
        Math.min(Math.round((totalProjects / projectTotal) * 100), 100) : 0;
    
    // คำนวณจำนวนที่เหลือ
    const remaining = Math.max(0, projectTotal - totalProjects);
    
    // อัพเดต UI
    $('#overall-progress-percent').text(`${progressPercent}%`);
    $('#overall-progress-bar').css('width', `${progressPercent}%`);
    $('#achieved-projects').text(formatNumber(totalProjects));
    $('#remaining-projects').text(formatNumber(remaining));
    
    // คำนวณวันแล้วเสร็จประมาณการ
    updateCompletionEstimate(totalProjects, projectTotal);
    
    // อัพเดตเปอร์เซ็นต์ในสถิติ
    updateStatisticsPercentages(totalProjects);
}

// คำนวณวันแล้วเสร็จประมาณการ
function updateCompletionEstimate(current, target) {
    const remaining = target - current;
    
    if (remaining <= 0) {
        $('#completion-estimate').text('แล้วเสร็จ');
        return;
    }
    
    // สมมติว่าแต่ละวันดำเนินการได้ 50 แปลง
    const dailyRate = 50;
    const daysRemaining = Math.ceil(remaining / dailyRate);
    
    // คำนวณวันที่แล้วเสร็จ
    const today = new Date();
    const completionDate = new Date(today);
    completionDate.setDate(today.getDate() + daysRemaining);
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const estimateText = completionDate.toLocaleDateString('th-TH', options);
    
    $('#completion-estimate').text(estimateText);
}

// ฟังก์ชันเมื่อมีการเปลี่ยน filter เขต
function onZoneFilterChange(filteredZones) {
    selectedZones = filteredZones;
    
    // อัพเดตเป้าหมายตามเขตที่เลือก
    calculateZoneTarget();
    
    // คำนวณความคืบหน้าใหม่
    updateProjectProgress();
}

// ฟังก์ชันจัดรูปแบบตัวเลข
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ฟังก์ชันอัพเดตสถิติโครงการ
function updateProjectStats(data) {
    if (!data || data.length === 0) {
        resetProjectStats();
        return;
    }
    
    const totalProjects = data.length;
    const totalArea = calculateTotalArea(data);
    
    // คำนวณข้อมูลอื่นๆ
    const checkedData = data.filter(item => item['สถานะการตรวจ'] === 'ตรวจแล้ว');
    const notCheckedData = data.filter(item => item['สถานะการตรวจ'] !== 'ตรวจแล้ว');
    const passedData = checkedData.filter(item => item['ผลการตรวจ'] === 'ผ่าน');
    const failedData = checkedData.filter(item => item['ผลการตรวจ'] === 'ไม่ผ่าน');
    
    const checkedProjects = checkedData.length;
    const notCheckedProjects = notCheckedData.length;
    const passedProjects = passedData.length;
    const failedProjects = failedData.length;
    
    const checkedArea = calculateTotalArea(checkedData);
    const notCheckedArea = calculateTotalArea(notCheckedData);
    const passedArea = calculateTotalArea(passedData);
    const failedArea = calculateTotalArea(failedData);
    
    // อัพเดตแสดงผล
    $('#total-projects').text(formatNumber(totalProjects));
    $('#total-area').text(formatNumber(totalArea));
    $('#checked-projects').text(formatNumber(checkedProjects));
    $('#checked-area').text(formatNumber(checkedArea));
    $('#not-checked-projects').text(formatNumber(notCheckedProjects));
    $('#not-checked-area').text(formatNumber(notCheckedArea));
    $('#passed-projects').text(formatNumber(passedProjects));
    $('#passed-area').text(formatNumber(passedArea));
    $('#failed-projects').text(formatNumber(failedProjects));
    $('#failed-area').text(formatNumber(failedArea));
    
    // อัพเดตความคืบหน้า
    updateProjectProgress();
}

// ฟังก์ชันคำนวณพื้นที่รวม
function calculateTotalArea(data) {
    if (!data || data.length === 0) return 0;
    
    let totalArea = 0;
    data.forEach(item => {
        const area = parseFloat(item['พื้นที่'] || item['ขนาดพื้นที่'] || item['ไร่'] || 0);
        if (!isNaN(area)) {
            totalArea += area;
        }
    });
    
    return Math.round(totalArea);
}

// ฟังก์ชันรีเซ็ตสถิติ
function resetProjectStats() {
    $('#total-projects').text('0');
    $('#total-area').text('0');
    $('#checked-projects').text('0');
    $('#checked-area').text('0');
    $('#not-checked-projects').text('0');
    $('#not-checked-area').text('0');
    $('#passed-projects').text('0');
    $('#passed-area').text('0');
    $('#failed-projects').text('0');
    $('#failed-area').text('0');
    
    // รีเซ็ตเปอร์เซ็นต์
    $('#checked-percentage').text('0%');
    $('#not-checked-percentage').text('0%');
    $('#passed-percentage').text('0%');
    $('#failed-percentage').text('0%');
    
    // รีเซ็ตความคืบหน้า
    $('#overall-progress-percent').text('0%');
    $('#overall-progress-bar').css('width', '0%');
    $('#achieved-projects').text('0');
    $('#remaining-projects').text('0');
    $('#completion-estimate').text('-');
}

// ฟังก์ชันแคชข้อมูล
function cacheData(key, data) {
    try {
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(`target_${key}`, JSON.stringify(cacheData));
    } catch (e) {
        console.warn(`⚠️ ไม่สามารถแคชข้อมูล ${key} ได้:`, e);
    }
}

function getCachedData(key) {
    try {
        const cached = localStorage.getItem(`target_${key}`);
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.timestamp;
        
        // แคชไว้ 30 นาที
        if (age < 30 * 60 * 1000) {
            return cacheData.data;
        }
    } catch (e) {
        console.warn(`⚠️ ปัญหาในการอ่านแคช ${key}:`, e);
    }
    return null;
}

// เรียกใช้งานเมื่อโหลดหน้า
$(document).ready(function() {
    initializeProjectStats();
    
    // เพิ่มปุ่มรีเฟรชข้อมูลเป้าหมาย
    $('#refresh-targets-btn').click(function() {
        loadTargetData(true);
        $(this).html('<i class="fas fa-spinner fa-spin me-1"></i> รีเฟรช...');
        setTimeout(() => {
            $(this).html('<i class="fas fa-sync-alt me-1"></i> รีเฟรชเป้าหมาย');
        }, 2000);
    });
});
