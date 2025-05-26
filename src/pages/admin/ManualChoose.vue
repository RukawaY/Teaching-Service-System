<template>
  <div class="manual-choose container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>管理员手动选课</h2>
          <p>为学生手动添加课程</p>
        </div>
      </template>

      <el-form :model="formData" label-width="120px" class="input-form">
        <el-form-item label="学生ID">
          <el-input v-model.number="formData.studentId" placeholder="请输入学生ID" type="number" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchStudentCourses" :loading="loading">
            查询学生选课
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="studentInfo" class="student-info-section">
      <el-card class="student-card">
        <template #header>
          <div class="card-header">
            <h2>学生已选课程</h2>
          </div>
        </template>

        <el-table :data="selectedCourses" style="width: 100%">
          <el-table-column prop="section_id" label="开课ID" width="90" />
          <el-table-column prop="course_id" label="课程ID" width="90" />
          <el-table-column prop="course_name" label="课程名称" />
          <el-table-column prop="teacher_name" label="授课教师" />
          <el-table-column prop="credit" label="学分" width="80" />
          <el-table-column prop="class_time" label="上课时间" />
          <el-table-column prop="classroom" label="上课教室" />
        </el-table>
      </el-card>

      <el-card class="available-courses-card">
        <template #header>
          <div class="card-header">
            <h2>可选课程</h2>
          </div>
        </template>

        <el-table :data="availableCourses" style="width: 100%">
          <el-table-column prop="section_id" label="开课ID" width="90" />
          <el-table-column prop="course_id" label="课程ID" width="90" />
          <el-table-column prop="course_name" label="课程名称" />
          <el-table-column prop="teacher_name" label="授课教师" />
          <el-table-column prop="credit" label="学分" width="80" />
          <el-table-column prop="class_time" label="上课时间" />
          <el-table-column prop="classroom" label="上课教室" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="primary" size="small" @click="chooseCourse(scope.row)"
                :disabled="isTimeConflict(scope.row)">
                选课
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-empty v-if="showEmpty" description="请输入学生ID并点击查询" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getStudentCourses, adminChooseCourseForStudent, searchCourse } from '../../api/admin';

const formData = reactive({
  studentId: '',
});

const loading = ref(false);
const studentInfo = ref(null);
const selectedCourses = ref([]);
const availableCourses = ref([]);
const showEmpty = computed(() => !loading.value && !studentInfo.value);
const courseLoading = ref(false);

// 检查时间冲突
const isTimeConflict = (course) => {
  return selectedCourses.value && selectedCourses.value.length > 0 && selectedCourses.value.some(selected =>
    selected.class_time === course.class_time
  );
};

// 搜索学生课程
const searchStudentCourses = async () => {
  if (!formData.studentId) {
    ElMessage.warning('请输入学生ID');
    return;
  }
  else
  {
    studentInfo.value = {
      studentId: formData.studentId,
      name: ''
    };
  }

  try {
    loading.value = true;

    // 调用API获取学生信息和已选课程
    const response = await getStudentCourses(formData.studentId);

    //console.log(response);

    if (response.code === '200') {
      // 更新学生姓名
      studentInfo.value.name = response.data.student_name;

      // 设置已选课程，确保不是null
      selectedCourses.value = response.data.course_list || [];
      
      ElMessage.success('获取学生选课信息成功');
    } else {
      ElMessage.error(response.message || '获取学生选课信息失败');
      // 设置为空数组，而不是包含空对象的数组
      selectedCourses.value = [];
    }
    
    // 无论如何都尝试获取可选课程
    try {
      await fetchAvailableCourses();
      ElMessage.success('获取可选课程成功');
    } catch (error) {
      //console.error('获取可选课程失败:', error);
      ElMessage.error('获取可选课程失败');
    }
  } catch (error) {
    ElMessage.error('获取学生信息失败');
    //console.error(error);
    studentInfo.value = null;
  } finally {
    loading.value = false;
  }
};

// 获取可选课程
const fetchAvailableCourses = async () => {
  if (!studentInfo.value) return;

  try {
    courseLoading.value = true;

    // 使用 searchCourse API 获取可选课程列表
    const response = await searchCourse({
      need_available: true
    });

    //console.log(response);

    if (response.code === '200') {
      // 确保 selectedCourses.value 不是 null，并安全地过滤掉学生已选的课程
      if (!selectedCourses.value || selectedCourses.value.length === 0) { 
        availableCourses.value = response.data.course_list;
      } 
      else{
        const selectedIds = selectedCourses.value.map(c => c.section_id);
        availableCourses.value = response.data.course_list.filter(
          course => !selectedIds.includes(course.section_id)
        );
      }
    } else {
      ElMessage.warning(response.message || '获取可选课程失败');
    }
  } catch (error) {
    ElMessage.error('获取可选课程失败');
  } finally {
    courseLoading.value = false;
  }
};

// 选择课程
const chooseCourse = async (course) => {
  /*
  if (!studentInfo.value) {
    ElMessage.warning('请先查询学生信息');
    return;
  }
  */

  // 检查时间冲突
  if (isTimeConflict(course)) {
    ElMessage.error('该课程与已选课程时间冲突');
    return;
  }

  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定为学生(ID: ${formData.studentId})选择课程: ${course.course_name}?`,
      '确认选课',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    //console.log(course.section_id);
    
    // 调用API进行选课操作
    const response = await adminChooseCourseForStudent({
      student_id: formData.studentId,
      course_id: course.section_id
    });

    //console.log(response);

    if (response.code === '200') {
      // 将课程添加到已选列表
      selectedCourses.value.push(course);

      // 从可选列表中移除
      const index = availableCourses.value.findIndex(c => c.section_id === course.section_id);
      if (index !== -1) {
        availableCourses.value.splice(index, 1);
      }

      ElMessage.success(`已为学生选择课程: ${course.course_name}`);
    } else {
      ElMessage.error(response.message || '选课失败');
    }
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作，不做处理
      return;
    }
    ElMessage.error('选课失败');
    console.error(error);
  }
};
</script>

<style scoped>
.manual-choose {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  width: 95%;
  margin: 0px auto 20px auto;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header p {
  margin-top: 8px;
  color: #666;
}

.input-form {
  max-width: 500px;
  margin: 0 auto;
}

.student-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 95%;
  margin: 0 auto;
}

.student-card,
.available-courses-card {
  width: 100%;
}
</style>