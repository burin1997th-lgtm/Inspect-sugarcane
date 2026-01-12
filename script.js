// เพิ่มข้อมูลเป้าหมาย
const TARGET_DATA = {
    '1': { caneInRiceField: 1000, changeToCane: 2000 },
    '2': { caneInRiceField: 875, changeToCane: 2000 },
    '3': { caneInRiceField: 1100, changeToCane: 2000 },
    '4': { caneInRiceField: 875, changeToCane: 1500 },
    '5': { caneInRiceField: 1200, changeToCane: 2000 },
    '6': { caneInRiceField: 1200, changeToCane: 2000 },
    '7': { caneInRiceField: 875, changeToCane: 2000 },
    '8': { caneInRiceField: 1000, changeToCane: 2000 },
    '10': { caneInRiceField: 1000, changeToCane: 2000 },
    '11': { caneInRiceField: 875, changeToCane: 2000 },
    '12': { caneInRiceField: 300, changeToCane: 500 },
    '21': { caneInRiceField: 875, changeToCane: 2000 },
    'C1': { caneInRiceField: 875, changeToCane: 2000 },
    'C2': { caneInRiceField: 875, changeToCane: 2000 },
    'C3': { caneInRiceField: 1200, changeToCane: 2000 },
    'C4': { caneInRiceField: 875, changeToCane: 2000 }
};

// ฟังก์ชันอัพเดตเป้าหมายตามเขตที่เลือก
function updateTargetsBasedOnFilter(selectedZones = []) {
    let totalCaneInRiceField = 0;
    let totalChangeToCane = 0;
    
    if (selectedZones.length === 0) {
        // ถ้าไม่เลือกเขตใดเลย ให้แสดงผลรวมทั้งหมด
        Object.values(TARGET_DATA).forEach(target => {
            totalCaneInRiceField += target.caneInRiceField;
            totalChangeToCane += target.changeToCane;
        });
    } else {
        // คำนวณเฉพาะเขตที่เลือก
        selectedZones.forEach(zone => {
            if (TARGET_DATA[zone]) {
                totalCaneInRiceField += TARGET_DATA[zone].caneInRiceField;
                totalChangeToCane += TARGET_DATA[zone].changeToCane;
            }
        });
    }
    
    const totalTarget = totalCaneInRiceField + totalChangeToCane;
    
    // อัพเดตแสดงผล
    $('#target-cane-in-rice-field').text(formatNumber(totalCaneInRiceField));
    $('#target-change-to-cane').text(formatNumber(totalChangeToCane));
    $('#target-total-projects').text(formatNumber(totalTarget));
    $('#target-display').text(formatNumber(totalTarget));
    
    // อัพเดตเป้าหมายทั้งหมดสำหรับการคำนวณ
    $('#target-total-cane-in-rice-field').text(totalCaneInRiceField);
    $('#target-total-change-to-cane').text(totalChangeToCane);
    
    // คำนวณและอัพเดตความคืบหน้า
    calculateAndUpdateProgress();
}

// ฟังก์ชันคำนวณและอัพเดตความคืบหน้า
function calculateAndUpdateProgress() {
    const totalProjects = parseInt($('#total-projects').text().replace(/,/g, '')) || 0;
    const totalCaneInRiceFieldTarget = parseInt($('#target-total-cane-in-rice-field').text()) || 1;
    const totalChangeToCaneTarget = parseInt($('#target-total-change-to-cane').text()) || 1;
    const totalTarget = totalCaneInRiceFieldTarget + totalChangeToCaneTarget;
    
    // คำนวณเปอร์เซ็นต์ความคืบหน้า (สมมติว่า 50% ของแปลงเป็นอ้อยในนา, 50% เป็นเปลี่ยนมาปลูกอ้อย)
    const achievedCaneInRiceField = Math.min(Math.round(totalProjects * 0.5), totalCaneInRiceFieldTarget);
    const achievedChangeToCane = Math.min(totalProjects - achievedCaneInRiceField, totalChangeToCaneTarget);
    
    // คำนวณเปอร์เซ็นต์
    const progressCaneInRiceField = totalCaneInRiceFieldTarget > 0 ? 
        Math.round((achievedCaneInRiceField / totalCaneInRiceFieldTarget) * 100) : 0;
    const progressChangeToCane = totalChangeToCaneTarget > 0 ? 
        Math.round((achievedChangeToCane / totalChangeToCaneTarget) * 100) : 0;
    const totalProgress = totalTarget > 0 ? 
        Math.round((totalProjects / totalTarget) * 100) : 0;
    
    // อัพเดตแสดงผล
    $('#achieved-cane-in-rice-field').text(formatNumber(achievedCaneInRiceField));
    $('#achieved-change-to-cane').text(formatNumber(achievedChangeToCane));
    
    $('#progress-cane-in-rice-field').css('width', `${progressCaneInRiceField}%`);
    $('#progress-change-to-cane').css('width', `${progressChangeToCane}%`);
    $('#progress-total-projects').css('width', `${totalProgress}%`);
    
    $('#total-progress-percentage').text(`${totalProgress}%`);
    $('#remaining-target').text(formatNumber(Math.max(0, totalTarget - totalProjects)));
    
    // อัพเดตเปอร์เซ็นต์ในสถิติอื่นๆ
    updateStatisticsPercentages(totalProjects);
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

// ฟังก์ชันจัดรูปแบบตัวเลข
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ฟังก์ชันเมื่อมีการเลือกเขตใน filter
function onZoneFilterChange(selectedZones) {
    // อัพเดตเป้าหมายตามเขตที่เลือก
    updateTargetsBasedOnFilter(selectedZones);
    
    // อัพเดตสถิติอื่นๆ (เรียกจากฟังก์ชันที่มีอยู่แล้ว)
    updateProjectStats(filteredData);
}

// ฟังก์ชันอัพเดตสถิติโครงการ (ฟังก์ชันเดิม)
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
    
    // อัพเดตความคืบหน้าเป้าหมาย
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
    
    // รีเซ็ตความคืบหน้าเป้าหมาย
    $('#progress-cane-in-rice-field').css('width', '0%');
    $('#progress-change-to-cane').css('width', '0%');
    $('#progress-total-projects').css('width', '0%');
    $('#total-progress-percentage').text('0%');
    $('#remaining-target').text('45,000');
}

// เรียกใช้งานครั้งแรกเมื่อโหลดหน้า
$(document).ready(function() {
    // ตั้งค่าเป้าหมายเริ่มต้น (ทั้งหมด)
    updateTargetsBasedOnFilter([]);
    
    // เมื่อมีการเปลี่ยน filter
    $('#zone-filter').on('change', function() {
        const selectedZones = $(this).val() || [];
        onZoneFilterChange(selectedZones);
    });
});
