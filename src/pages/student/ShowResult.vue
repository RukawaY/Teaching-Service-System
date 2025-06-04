<template>
  <div class="show-result container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <h2>选课结果</h2>
        </div>
      </template>

      <el-form inline class="id-input-form" @submit.prevent="fetchSelectedCourses">
        <el-form-item label="学生ID:">
          <el-input
            v-model.number="studentId"
            placeholder="请输入学生ID查看结果"
            type="number"
            style="width: 250px; margin-right: 10px;"
            @keyup.enter="fetchSelectedCourses"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchSelectedCourses" :loading="loading">
            查看选课结果
          </el-button>
        </el-form-item>
      </el-form>
      <p v-if="!loading && selectedCourses.length > 0" style="text-align: center; margin-bottom: 15px;">
        以下是ID为 <strong>{{ currentFetchedId }}</strong> 的学生已选课程列表
      </p>

      <el-table :data="selectedCourses" style="font-size: 15px;" v-loading="loading">
        <el-table-column prop="course_id" label="课程ID" width="120" />
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column prop="teacher_name" label="授课教师" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="class_time" label="上课时间" />
        <el-table-column prop="classroom" label="上课教室" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleDropCourse(scope.row)"
              :loading="scope.row.dropping"
            >退课</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="hasFetched && selectedCourses.length > 0 && !loading" style="text-align: center; margin-top: 20px; margin-bottom: 10px;">
        <el-button type="success" @click="openTimetableDialog">
          查看/打印课表
        </el-button>
      </div>

      <el-empty v-if="!loading && selectedCourses.length === 0 && hasFetched" description="该学生暂无选课结果或ID不存在，无法生成课表" />
      <el-empty v-if="!loading && !hasFetched" description="请输入学生ID并点击查看" />
    </el-card>

    <!-- Timetable Dialog -->
    <el-dialog v-model="timetableDialogVisible" title="学生课表" width="85%" top="5vh">
      <div id="timetable-to-print" style="padding: 10px;">
        <h3 style="text-align: center; margin-bottom: 15px;">
          学生ID: {{ currentFetchedId }} 的课表
        </h3>
        <el-table
          :data="timetableForDisplay"
          border
          style="width: 100%; font-size: 14px;"
          :span-method="tableSpanMethod"
        >
          <el-table-column prop="timeLabel" label="时间" width="110" align="center" header-align="center"/>
          <el-table-column
            v-for="day in daysOfWeekForTable"
            :key="day"
            :label="day"
            min-width="100"
            align="center"
            header-align="center"
          >
            <template #default="scope">
              <div v-if="scope.row[day] && scope.row[day].isStartSlot"
                   style="min-height: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; word-break: break-all; padding: 2px; line-height: 1.4;">
                <span style="font-size: 1.2em; font-weight: bold;">{{ scope.row[day].name }}</span>
                <span v-if="scope.row[day].classroom" style="font-size: 1em; color: #555;">{{ scope.row[day].classroom }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timetableDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="printTimetable" :loading="printingTimetable">
            下载课表 (PDF)
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getStudentSelectedCourses, dropStudentCourse } from '../../api/student.ts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const studentId = ref('');
const currentFetchedId = ref('');
const selectedCourses = ref([]);
const loading = ref(false);
const hasFetched = ref(false);

// Timetable related refs and constants
const timetableDialogVisible = ref(false);
const printingTimetable = ref(false);
const timetableGrid = ref({}); // Stores raw timetable data: { '周一': { '上午': [...], ...}, ... }
const timetableForDisplay = ref([]); // Stores data formatted for el-table

const daysOfWeekForTable = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const timeSlotLabels = [
  ...Array(5).fill(0).map((_, i) => `上午第${i+1}节`), // 1-5
  ...Array(5).fill(0).map((_, i) => `下午第${i+1}节`), // 6-10
  ...Array(3).fill(0).map((_, i) => `晚上第${i+1}节`), // 11-13
];

const initializeTimetableGrid = () => {
  const newGrid = {};
  daysOfWeekForTable.forEach(day => {
    newGrid[day] = {
      '上午': Array(5).fill(null), // 5 slots for morning
      '下午': Array(5).fill(null), // 5 slots for afternoon
      '晚上': Array(3).fill(null)  // 3 slots for evening
    };
  });
  timetableGrid.value = newGrid;
};

// Parses strings like "12" into [1, 2] or "101112" into [10, 11, 12]
const parseSlotStringRevised = (slotStr) => {
  const slots = [];
  let i = 0;
  while (i < slotStr.length) {
    if (slotStr[i] === '1' && i + 1 < slotStr.length) {
      const twoDigitNum = parseInt(slotStr.substring(i, i + 2));
      if (twoDigitNum >= 10 && twoDigitNum <= 13) {
        slots.push(twoDigitNum);
        i += 2;
        continue;
      }
    }
    const oneDigitNum = parseInt(slotStr[i]);
    if (oneDigitNum >= 1 && oneDigitNum <= 9) {
      slots.push(oneDigitNum);
      i += 1;
      continue;
    }
    // Fallback for unexpected characters, though input should be clean
    console.error(`Unexpected character or format in slot string: ${slotStr[i]} from "${slotStr}"`);
    i++;
  }
  return slots.sort((a, b) => a - b); // Ensure slots are sorted for duration calculation
};

const parseAndPlaceCourses = () => {
  initializeTimetableGrid();
  if (!selectedCourses.value || selectedCourses.value.length === 0) return;

  selectedCourses.value.forEach(course => {
    if (!course.class_time) return; // Skip if class_time is missing

    const timeEntries = course.class_time.split(/[,;，；]/); // Split by comma or semicolon, Chinese or English

    timeEntries.forEach(entry => {
      entry = entry.trim();
      // Regex to capture day (周X) and slot numbers (e.g., 345, 1011)
      const classTimeRegex = /(周[一二三四五六日])(\d+)节/g;
      let parsedTime;
      // Use while loop for global regex to find all matches in an entry if structure allows
      while((parsedTime = classTimeRegex.exec(entry)) !== null) {
        const dayOfWeek = parsedTime[1]; // "周一"
        const slotsStr = parsedTime[2];  // "345" or "101112"
        
        const individualSlots = parseSlotStringRevised(slotsStr);

        if (individualSlots.length === 0) continue;

        // Check for continuity of slots for rowspan purposes
        let currentDuration = 0;
        let lastSlot = -1;
        let firstSlotInSequence = -1;

        const placeCourseSegment = (startSlotNum, duration) => {
          const courseData = {
            name: course.course_name,
            classroom: course.classroom,
            isStartSlot: true,
            duration: duration
          };
          const subsequentCourseData = {
            name: course.course_name,
            classroom: course.classroom,
            isStartSlot: false,
            duration: 0
          };

          for (let i = 0; i < duration; i++) {
            const slotNum = startSlotNum + i;
            let periodKey, slotIndexInPeriod;
            if (slotNum >= 1 && slotNum <= 5) { 
              periodKey = '上午'; slotIndexInPeriod = slotNum - 1;
            } else if (slotNum >= 6 && slotNum <= 10) {
              periodKey = '下午'; slotIndexInPeriod = slotNum - 6;
            } else if (slotNum >= 11 && slotNum <= 13) {
              periodKey = '晚上'; slotIndexInPeriod = slotNum - 11;
            } else {
              continue; // Should not happen with parsed slots
            }
            if (timetableGrid.value[dayOfWeek]?.[periodKey]) {
                 timetableGrid.value[dayOfWeek][periodKey][slotIndexInPeriod] = i === 0 ? courseData : subsequentCourseData;
            }
          }
        };
        
        individualSlots.forEach((slotNum, index) => {
            if (firstSlotInSequence === -1) { // Start of a new potential sequence
                firstSlotInSequence = slotNum;
                currentDuration = 1;
            } else if (slotNum === lastSlot + 1) { // Continues the sequence
                currentDuration++;
            } else { // Sequence broken, place the previous segment
                placeCourseSegment(firstSlotInSequence, currentDuration);
                // Start a new sequence
                firstSlotInSequence = slotNum;
                currentDuration = 1;
            }
            lastSlot = slotNum;

            // If it's the last slot in individualSlots, place the current segment
            if (index === individualSlots.length - 1) {
                placeCourseSegment(firstSlotInSequence, currentDuration);
            }
        });
      }
    });
  });
};

const prepareTimetableForDisplay = () => {
  const displayData = [];
  const slotPeriods = ['上午', '下午', '晚上'];
  // Number of slots in each period (morning, afternoon, evening)
  const slotsInPeriodDefinition = [5, 5, 3]; 

  let labelIndex = 0;
  slotPeriods.forEach((periodKey, pIdx) => {
    for (let i = 0; i < slotsInPeriodDefinition[pIdx]; i++) {
      const row = { timeLabel: timeSlotLabels[labelIndex++] };
      daysOfWeekForTable.forEach(day => {
        // Access the specific slot in the timetableGrid
        row[day] = timetableGrid.value[day]?.[periodKey]?.[i] || null;
      });
      displayData.push(row);
    }
  });
  timetableForDisplay.value = displayData;
};

const tableSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) { // Time label column
    return [1, 1];
  }

  const dayKey = daysOfWeekForTable[columnIndex - 1];
  const cellData = row[dayKey]; // This is the course object or null

  if (cellData) {
    if (cellData.isStartSlot) {
      return { rowspan: cellData.duration, colspan: 1 };
    }
    // If it's not a start slot, it's part of a merged cell, so hide it.
    return { rowspan: 0, colspan: 0 }; 
  }
  // Empty slot, no merge
  return [1, 1];
};

const openTimetableDialog = () => {
  if (!hasFetched.value || selectedCourses.value.length === 0) {
    ElMessage.info('没有可用于生成课表的已选课程。请先查询并确保有选课结果。');
    return;
  }
  parseAndPlaceCourses();
  prepareTimetableForDisplay();
  timetableDialogVisible.value = true;
};

const printTimetable = async () => {
  if (printingTimetable.value) return;
  printingTimetable.value = true;
  try {
    const timetableElement = document.getElementById('timetable-to-print');
    if (!timetableElement) {
      ElMessage.error('找不到课表元素进行打印。');
      printingTimetable.value = false;
      return;
    }
    // Temporarily adjust table style for printing to ensure borders are captured by html2canvas
    const tableInDialog = timetableElement.querySelector('.el-table__body-wrapper table, .el-table__header-wrapper table');
    let originalTableBorderSpacing = '';
    if(tableInDialog) {
        originalTableBorderSpacing = tableInDialog.style.borderSpacing;
        // tableInDialog.style.borderCollapse = 'collapse'; // More robust for borders
    }

    const canvas = await html2canvas(timetableElement, {
      scale: 2.5, 
      useCORS: true,
      logging: false, 
      backgroundColor: '#ffffff',
      onclone: (documentClone) => {
        // Ensure styles are fully applied in the cloned document for html2canvas
        const clonedTable = documentClone.getElementById('timetable-to-print');
        if (clonedTable) {
            const tables = clonedTable.querySelectorAll('table');
            tables.forEach(table => {
                table.style.borderCollapse = 'collapse'; // Ensure borders are drawn correctly
                const cells = table.querySelectorAll('td, th');
                cells.forEach(cell => {
                    cell.style.border = '1px solid #ebeef5'; // Match ElTable border or make generic
                });
            });
        }
      }
    });

    if(tableInDialog) {
        // tableInDialog.style.borderCollapse = ''; // Revert
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const margin = 20; 
    const availableWidth = pdfWidth - 2 * margin;
    const availableHeight = pdfHeight - 2 * margin;

    let imgWidth = imgProps.width;
    let imgHeight = imgProps.height;
    const ratio = imgWidth / imgHeight;

    if (imgWidth > availableWidth) {
      imgWidth = availableWidth;
      imgHeight = imgWidth / ratio;
    }
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * ratio;
    }
    
    const xOffset = margin + (availableWidth - imgWidth) / 2;
    const yOffset = margin + (availableHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    pdf.save(`课表-学生ID-${currentFetchedId.value || '未知'}.pdf`);
    ElMessage.success('课表PDF已开始下载');
  } catch (error) {
    console.error('打印课表失败:', error);
    ElMessage.error('打印课表失败，详情请查看控制台。');
  } finally {
    printingTimetable.value = false;
  }
};

const fetchSelectedCourses = async () => {
  if (!studentId.value) {
    ElMessage.warning('请输入学生ID');
    selectedCourses.value = []; 
    hasFetched.value = false;
    currentFetchedId.value = '';
    timetableDialogVisible.value = false; // Close timetable if open
    return;
  }
  loading.value = true;
  hasFetched.value = true;
  currentFetchedId.value = studentId.value; 
  try {
    const response = await getStudentSelectedCourses(Number(studentId.value)); 
    if (response.code === '200' || response.code === 200) { 
      if (response.data && response.data.course_list) {
        selectedCourses.value = response.data.course_list.map(course => ({ ...course, dropping: false })); 
      } else {
        selectedCourses.value = []; 
      }
    } else {
      ElMessage.error(response.message || '获取选课结果失败');
      selectedCourses.value = []; 
    }
  } catch (e) {
    ElMessage.error(e.message || '获取选课结果时发生网络错误');
    selectedCourses.value = []; 
    console.error("获取已选课程时出错:", e); 
  } finally {
    loading.value = false;
    if (selectedCourses.value.length === 0) {
        timetableDialogVisible.value = false; // Close timetable if no courses
    }
  }
};

const handleDropCourse = async (course) => {
  if (!currentFetchedId.value) { 
      ElMessage.error('请先查询学生选课结果后再进行退课操作。');
      return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要为学生ID ${currentFetchedId.value} 退选课程「${course.course_name}」吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    course.dropping = true; 

    const payload = {
      student_id: Number(currentFetchedId.value), 
      course_id: Number(course.course_id) 
    };
    const response = await dropStudentCourse(payload); 

    if (response.code === '200' || response.code === 200 || response.code === 'success') { 
      ElMessage.success(`课程「${course.course_name}」退课成功`);
      fetchSelectedCourses(); // Refresh selected courses, which will also allow timetable to be updated if open
    } else {
      ElMessage.error(response.message || '退课失败'); 
    }
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') {
      ElMessage.error(e.message || '退课操作失败');
      console.error("退课时出错:", e); 
    }
  } finally {
    if (course) { 
       course.dropping = false; 
    }
  }
};

// 页面加载时不再自动获取，等待用户输入ID
// onMounted(() => {
//   fetchSelectedCourses();
// });
</script>

<style scoped>
/* 在现有样式基础上添加 */
.id-input-form {
  margin-bottom: 20px;
  display: flex;
  justify-content: center; /* 让表单内容居中 */
  align-items: center;
}
.show-result {
  max-width: 1200px;
  margin: 0 auto; /* */
  padding: 20px;
}
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.result-card {
  width: 95%;
  margin: 0px auto 20px auto; /* */
}
.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Styles for timetable dialog if needed, though ElTable handles most */
/* Ensure dialog content can scroll if timetable is very large on small screens */
::v-deep .el-dialog__body {
  padding: 10px 20px; /* Adjust padding as needed */
}
</style>