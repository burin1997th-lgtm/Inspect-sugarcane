// ข้อมูลเป้าหมายตามโครงการและเขต
const PROJECT_TARGET_DATA = {
    'plant-cane-in-rice-field': {
        name: 'ปลูกอ้อยในนา',
        badgeColor: 'success',
        icon: 'fa-seedling',
        total: 15000,
        zoneTargets: {
            '1': 1000, '2': 875, '3': 1100, '4': 875, '5': 1200,
            '6': 1200, '7': 875, '8': 1000, '10': 1000, '11': 875,
            '12': 300, '21': 875, 'C1': 875, 'C2': 875, 'C3': 1200, 'C4': 875
        }
    },
    'change-to-cane': {
        name: 'เปลี่ยนพืชอื่นมาปลูกอ้อย',
        badgeColor: 'warning',
        icon: 'fa-exchange-alt',
        total: 30000,
        zoneTargets: {
            '1': 2000, '2': 2000, '3': 2000, '4': 1500, '5': 2000,
            '6': 2000, '7': 2000, '8': 2000, '10': 2000, '11': 2000,
            '12': 500, '21': 2000, 'C1': 2000, 'C2': 2000, 'C3': 2000, 'C4': 2000
        }
    }
};

let currentProjectType = 'plant-cane-in-rice-field';
let selectedZones = [];

// ฟังก์ชันเริ่มต้น Project Stats
function initializeProjectStats() {
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

// อัพเดตข้อมูลเป้าหมาย
function updateProjectTargets() {
    const project = PROJECT_TARGET_DATA[currentProjectType];
    
    // อัพเดตข้อมูลโครงการ
    $('#active-project-target').text(formatNumber(project.total));
    $('#current-project-badge').text(project.name).removeClass('bg-success bg-warning').addClass(`bg-${project.badgeColor}`);
    $('#current-project-type').text(project.name);
    
    // คำนวณเป้าหมายตามเขตที่เลือก
    calculateZoneTarget();
    
    // อัพเดตจำนวนที่เหลือ (เริ่มต้นคือเป้าหมายทั้งหมด)
    $('#remaining-projects').text(formatNumber(project.total));
}

// คำนวณเป้าหมายตามเขตที่เลือก
function calculateZoneTarget() {
    const project = PROJECT_TARGET_DATA[currentProjectType];
    
    if (selectedZones.length === 0) {
        // ถ้าไม่เลือกเขตใดเลย
        $('#selected-zone-target').text(formatNumber(project.total));
        $('#selected-zone-count').text('ทั้งหมด');
    } else {
        // คำนวณเฉพาะเขตที่เลือก
        let zoneTarget = 0;
        selectedZones.forEach(zone => {
            if (project.zoneTargets[zone]) {
                zoneTarget += project.zoneTargets[zone];
            }
        });
        
        $('#selected-zone-target').text(formatNumber(zoneTarget));
        $('#selected-zone-count').text(selectedZones.length);
    }
}

// อัพเดตความคืบหน้าโครงการ
function updateProjectProgress() {
    const totalProjects = parseInt($('#total-projects').text().replace(/,/g, '')) || 0;
    const projectTotal = PROJECT_TARGET_DATA[currentProjectType].total;
    
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

// อัพเดตเปอร์เซ็นต์ในสถิติ
function updateStatisticsPercentages(totalProjects) {
    if (totalProjects === 0) {
        $('#checked-percentage').text('0%');
        $('#not-checked-percentage').text('0%');
        $('#passed-percentage').text('0%');
        $('#failed-percentage').text('0%');
        return;
    }
    
    const checkedProjects = parseInt($('#checked-projects').text().replace(/,/g, '')) || 0;
    const notCheckedProjects = parseInt($('#not-checked-projects').text().replace(/,/g, '')) || 0;
    const passedProjects = parseInt($('#passed-projects').text().replace(/,/g, '')) || 0;
    const failedProjects = parseInt($('#failed-projects').text().replace(/,/g, '')) || 0;
    
    // คำนวณเปอร์เซ็นต์
    const checkedPercentage = Math.round((checkedProjects / totalProjects) * 100);
    const notCheckedPercentage = Math.round((notCheckedProjects / totalProjects) * 100);
    const passedPercentage = checkedProjects > 0 ? Math.round((passedProjects / checkedProjects) * 100) : 0;
    const failedPercentage = checkedProjects > 0 ? Math.round((failedProjects / checkedProjects) * 100) : 0;
    
    // อัพเดตแสดงผล
    $('#checked-percentage').text(`${checkedPercentage}%`);
    $('#not-checked-percentage').text(`${notCheckedPercentage}%`);
    $('#passed-percentage').text(`${passedPercentage}%`);
    $('#failed-percentage').text(`${failedPercentage}%`);
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

// ฟังก์ชันอัพเดตสถิติโครงการ (เรียกจากฟังก์ชันหลัก)
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
    $('#remaining-projects').text(formatNumber(PROJECT_TARGET_DATA[currentProjectType].total));
    $('#completion-estimate').text('-');
}

// เรียกใช้งานเมื่อโหลดหน้า
$(document).ready(function() {
    initializeProjectStats();
});
