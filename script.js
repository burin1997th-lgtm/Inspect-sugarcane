// ข้อมูลเป้าหมายตามโครงการ
const PROJECT_TARGETS = {
    'plant-cane-in-rice-field': {
        name: 'ปลูกอ้อยในนา',
        color: 'success',
        zoneTargets: {
            '1': 1000,
            '2': 875,
            '3': 1100,
            '4': 875,
            '5': 1200,
            '6': 1200,
            '7': 875,
            '8': 1000,
            '10': 1000,
            '11': 875,
            '12': 300,
            '21': 875,
            'C1': 875,
            'C2': 875,
            'C3': 1200,
            'C4': 875
        },
        total: 15000
    },
    'change-to-cane': {
        name: 'เปลี่ยนพืชอื่นมาปลูกอ้อย',
        color: 'warning',
        zoneTargets: {
            '1': 2000,
            '2': 2000,
            '3': 2000,
            '4': 1500,
            '5': 2000,
            '6': 2000,
            '7': 2000,
            '8': 2000,
            '10': 2000,
            '11': 2000,
            '12': 500,
            '21': 2000,
            'C1': 2000,
            'C2': 2000,
            'C3': 2000,
            'C4': 2000
        },
        total: 30000
    }
};

// ตัวแปรเก็บโครงการที่เลือก
let selectedProjectType = null;
let selectedZones = [];

// ฟังก์ชันเมื่อเลือกโครงการ
function selectProjectType(projectType) {
    selectedProjectType = projectType;
    
    // อัพเดต UI
    updateProjectUI();
    
    // คำนวณเป้าหมายใหม่
    calculateActiveProjectTarget();
    
    // คำนวณความคืบหน้า
    calculateAndUpdateProgress();
}

// ฟังก์ชันเมื่อเลือกเขต
function onZoneFilterChange(zones) {
    selectedZones = zones;
    
    // ถ้ามีเลือกโครงการแล้ว ให้คำนวณเป้าหมายใหม่
    if (selectedProjectType) {
        calculateActiveProjectTarget();
        calculateAndUpdateProgress();
    }
}

// ฟังก์ชันคำนวณเป้าหมายของโครงการที่เลือก
function calculateActiveProjectTarget() {
    if (!selectedProjectType) {
        // ถ้ายังไม่ได้เลือกโครงการ
        $('#target-active-project').text('-');
        $('#active-project-name').text('โปรดเลือกโครงการ');
        $('#project-type-badge').text('ยังไม่เลือก').removeClass('bg-success bg-warning').addClass('bg-info');
        $('#progress-active-project').css('width', '0%');
        $('#active-project-progress').text('0%');
        $('#active-project-remaining').text('0');
        $('#current-project-type').text('-');
        return;
    }
    
    const project = PROJECT_TARGETS[selectedProjectType];
    let totalTarget = 0;
    
    if (selectedZones.length === 0) {
        // ถ้าไม่เลือกเขตใดเลย ให้ใช้เป้าหมายรวมทั้งหมด
        totalTarget = project.total;
    } else {
        // คำนวณเฉพาะเขตที่เลือก
        selectedZones.forEach(zone => {
            if (project.zoneTargets[zone]) {
                totalTarget += project.zoneTargets[zone];
            }
        });
    }
    
    // อัพเดต UI
    $('#target-active-project').text(formatNumber(totalTarget));
    $('#active-project-name').text(project.name);
    $('#project-type-badge').text(project.name)
        .removeClass('bg-success bg-warning bg-info')
        .addClass(`bg-${project.color}`);
    $('#current-project-type').text(project.name);
    
    // บันทึกเป้าหมายปัจจุบันสำหรับคำนวณความคืบหน้า
    $('#active-project-target').data('value', totalTarget);
}

// ฟังก์ชันคำนวณและอัพเดตความคืบหน้า
function calculateAndUpdateProgress() {
    if (!selectedProjectType) {
        // ถ้ายังไม่ได้เลือกโครงการ
        resetProgressBars();
        return;
    }
    
    const totalProjects = parseInt($('#total-projects').text().replace(/,/g, '')) || 0;
    const activeProjectTarget = $('#active-project-target').data('value') || 0;
    
    // คำนวณเปอร์เซ็นต์ความคืบหน้า
    const progressPercentage = activeProjectTarget > 0 ? 
        Math.min(Math.round((totalProjects / activeProjectTarget) * 100), 100) : 0;
    
    // คำนวณที่เหลือ
    const remaining = Math.max(0, activeProjectTarget - totalProjects);
    
    // อัพเดตความคืบหน้าโครงการที่เลือก
    $('#progress-active-project').css('width', `${progressPercentage}%`);
    $('#active-project-progress').text(`${progressPercentage}%`);
    $('#active-project-remaining').text(formatNumber(remaining));
    
    // อัพเดตเปอร์เซ็นต์ในสถิติอื่นๆ
    updateStatisticsPercentages(totalProjects);
    
    // อัพเดตความคืบหน้าของทั้งสองโครงการ (แสดงข้อมูลรวม)
    updateBothProjectsProgress(totalProjects);
}

// ฟังก์ชันอัพเดตความคืบหน้าของทั้งสองโครงการ
function updateBothProjectsProgress(totalProjects) {
    // คำนวณว่าโครงการที่เลือกมีกี่แปลง (สมมติว่าทุกแปลงเป็นโครงการที่เลือก)
    const selectedProjectCount = totalProjects;
    
    // โครงการปลูกอ้อยในนา
    const caneInRiceFieldTarget = PROJECT_TARGETS['plant-cane-in-rice-field'].total;
    let caneInRiceFieldProgress = 0;
    
    if (selectedProjectType === 'plant-cane-in-rice-field') {
        // ถ้าเลือกโครงการปลูกอ้อยในนา ให้คำนวณจากแปลงทั้งหมด
        caneInRiceFieldProgress = Math.min(Math.round((selectedProjectCount / caneInRiceFieldTarget) * 100), 100);
        $('#achieved-cane-in-rice-field').text(formatNumber(selectedProjectCount));
    } else {
        // ถ้าเลือกโครงการอื่น ให้แสดง 0
        caneInRiceFieldProgress = 0;
        $('#achieved-cane-in-rice-field').text('0');
    }
    
    $('#progress-cane-in-rice-field').css('width', `${caneInRiceFieldProgress}%`);
    
    // โครงการเปลี่ยนพืชอื่นมาปลูกอ้อย
    const changeToCaneTarget = PROJECT_TARGETS['change-to-cane'].total;
    let changeToCaneProgress = 0;
    
    if (selectedProjectType === 'change-to-cane') {
        // ถ้าเลือกโครงการเปลี่ยนพืชอื่นมาปลูกอ้อย
        changeToCaneProgress = Math.min(Math.round((selectedProjectCount / changeToCaneTarget) * 100), 100);
        $('#achieved-change-to-cane').text(formatNumber(selectedProjectCount));
    } else {
        // ถ้าเลือกโครงการอื่น ให้แสดง 0
        changeToCaneProgress = 0;
        $('#achieved-change-to-cane').text('0');
    }
    
    $('#progress-change-to-cane').css('width', `${changeToCaneProgress}%`);
}

// ฟังก์ชันรีเซ็ต progress bars
function resetProgressBars() {
    $('#progress-cane-in-rice-field').css('width', '0%');
    $('#progress-change-to-cane').css('width', '0%');
    $('#progress-active-project').css('width', '0%');
    
    $('#active-project-progress').text('0%');
    $('#active-project-remaining').text('0');
    $('#achieved-cane-in-rice-field').text('0');
    $('#achieved-change-to-cane').text('0');
}

// ฟังก์ชันอัพเดต UI เมื่อเลือกโครงการ
function updateProjectUI() {
    const project = PROJECT_TARGETS[selectedProjectType];
    
    // อัพเดตสีและสไตล์ตามโครงการ
    $('.stat-item').removeClass('project-cane-in-rice-field project-change-to-cane');
    
    if (selectedProjectType === 'plant-cane-in-rice-field') {
        $('.stat-item').addClass('project-cane-in-rice-field');
        $('.stat-value').css('color', '#28a745'); // สีเขียว
    } else if (selectedProjectType === 'change-to-cane') {
        $('.stat-item').addClass('project-change-to-cane');
        $('.stat-value').css('color', '#ffc107'); // สีเหลือง
    }
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
    calculateAndUpdateProgress();
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
    resetProgressBars();
}

// ฟังก์ชันจัดรูปแบบตัวเลข
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ฟังก์ชันอัพเดตเปอร์เซ็นต์ในสถิติ
function updateStatisticsPercentages(totalProjects) {
    const checkedProjects = parseInt($('#checked-projects').text().replace(/,/g, '')) || 0;
    const notCheckedProjects = parseInt($('#not-checked-projects').text().replace(/,/g, '')) || 0;
    const passedProjects = parseInt($('#passed-projects').text().replace(/,/g, '')) || 0;
    const failedProjects = parseInt($('#failed-projects').text().replace(/,/g, '')) || 0;
    
    // คำนวณเปอร์เซ็นต์
    const checkedPercentage = totalProjects > 0 ? 
        Math.round((checkedProjects / totalProjects) * 100) : 0;
    const notCheckedPercentage = totalProjects > 0 ? 
        Math.round((notCheckedProjects / totalProjects) * 100) : 0;
    const passedPercentage = checkedProjects > 0 ? 
        Math.round((passedProjects / checkedProjects) * 100) : 0;
    const failedPercentage = checkedProjects > 0 ? 
        Math.round((failedProjects / checkedProjects) * 100) : 0;
    
    // อัพเดตแสดงผล
    $('#checked-percentage').text(`${checkedPercentage}%`);
    $('#not-checked-percentage').text(`${notCheckedPercentage}%`);
    $('#passed-percentage').text(`${passedPercentage}%`);
    $('#failed-percentage').text(`${failedPercentage}%`);
}

// เริ่มต้นเมื่อโหลดหน้า
$(document).ready(function() {
    // สร้าง dropdown หรือปุ่มสำหรับเลือกโครงการ
    createProjectSelector();
    
    // ตั้งค่าเริ่มต้น
    selectProjectType('plant-cane-in-rice-field'); // เลือกโครงการแรกเป็นค่าเริ่มต้น
    
    // เมื่อมีการเปลี่ยน filter เขต
    $('#zone-filter').on('change', function() {
        const selectedZones = $(this).val() || [];
        onZoneFilterChange(selectedZones);
    });
});

// ฟังก์ชันสร้างตัวเลือกโครงการ
function createProjectSelector() {
    const selectorHtml = `
        <div class="project-selector mb-3">
            <label class="form-label fw-bold">เลือกโครงการ</label>
            <div class="btn-group w-100" role="group">
                <button type="button" class="btn btn-success project-btn active" data-project="plant-cane-in-rice-field">
                    <i class="fas fa-seedling me-2"></i>ปลูกอ้อยในนา
                </button>
                <button type="button" class="btn btn-warning project-btn" data-project="change-to-cane">
                    <i class="fas fa-exchange-alt me-2"></i>เปลี่ยนพืชอื่นมาปลูกอ้อย
                </button>
            </div>
        </div>
    `;
    
    // แทรกก่อนส่วน project stats
    $('#project-stats').before(selectorHtml);
    
    // เพิ่ม event listener
    $('.project-btn').click(function() {
        $('.project-btn').removeClass('active');
        $(this).addClass('active');
        
        const projectType = $(this).data('project');
        selectProjectType(projectType);
    });
}
