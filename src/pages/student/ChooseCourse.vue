<template>
  <div class="choose-course container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>选择课程</h2>
          <p>请选择您要修读的课程</p>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchQuery.course_name"
          placeholder="课程名称"
          clearable
          class="search-input"
        />
        <el-input
          v-model="searchQuery.teacher_name"
          placeholder="教师姓名"
          clearable
          class="search-input"
        />
        <el-input
          v-model="searchQuery.course_id"
          placeholder="课程ID"
          clearable
          class="search-input"
        />
        <el-checkbox v-model="searchQuery.need_available">
          仅显示有余量课程
        </el-checkbox>
        <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
        <el-button @click="resetSearch" :disabled="loading">重置</el-button>
      </div>

      <el-table :data="courseList" style="font-size: 15px;" v-loading="loading">
        <el-table-column prop="course_id" label="课程ID" width="90" />
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column prop="teacher_name" label="授课教师" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="class_time" label="上课时间" />
        <el-table-column prop="classroom" label="上课教室" />
        <el-table-column label="课程容量">
          <template #default="scope">
            {{ scope.row.available_capacity }} / {{ scope.row.total_capacity }}
          </template>
        </el-table-column>
        <el-table-column label="选择" width="120">
          <template #default="scope">
            <el-checkbox
              v-model="selectedCourses[scope.row.course_id]"
              :disabled="scope.row.available_capacity <= 0"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="submit-area">
        <el-button
          type="primary"
          @click="submitCourses"
          :loading="submitting"
          :disabled="!canSubmit || loading"
        >
          提交选课
        </el-button>
      </div>
    </el-card>

    <el-empty v-if="showEmpty" description="暂无可选课程或未搜索到结果" />
  </div>
</template>

<script setup>
// ChooseCourse.vue 的 <script setup> 部分

import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 关键：确保从你的 API 文件中导入真实的 API 调用函数
// 这些函数负责与你的后端进行通信，后端再与数据库交互
import { searchCourse, submitStudentCourseSelection } from '../../api/student.ts';
// 假设 submitStudentCourseSelection 是你在 student.ts 中为 POST /student/choose_course 实现的函数

const courseList = ref([]);
const selectedCourses = ref({}); // { course_id: boolean }
const submitting = ref(false);
const loading = ref(false); // 用于表格和搜索按钮的加载状态

// 搜索条件
const searchQuery = ref({
  course_name: '',
  teacher_name: '',
  course_id: '',
  need_available: false, // API 中的 need_available 对应此项
});

const studentId = 2; // TODO: 实际项目请从登录信息获取

// 获取课程列表的函数 (调用 student.ts 中的 searchCourse)
const fetchCourses = async () => {
  loading.value = true;
  try {
    const paramsToApi = {};
    if (searchQuery.value.course_name) paramsToApi.course_name = searchQuery.value.course_name;
    if (searchQuery.value.teacher_name) paramsToApi.teacher_name = searchQuery.value.teacher_name;
    if (searchQuery.value.course_id) paramsToApi.course_id = Number(searchQuery.value.course_id);
    if (searchQuery.value.need_available) paramsToApi.need_available = searchQuery.value.need_available;
    // 如果API支持，也可以加入 student_id: paramsToApi.student_id = studentId;

    // 调用从 student.ts 导入的真实 API 函数
    const response = await searchCourse(paramsToApi);

    // 假设后端返回的数据结构如你之前API文档所示
    if (response && response.code === '200' && response.data && response.data.course_list) { // 请根据后端实际的成功 code调整
      courseList.value = response.data.course_list;
    } else {
      ElMessage.error(response.message || '获取课程列表失败');
      courseList.value = [];
    }
  } catch (error) {
    ElMessage.error('请求课程列表时发生网络错误');
    console.error('Error fetching courses:', error);
    courseList.value = [];
  } finally {
    loading.value = false;
  }
};

// 组件挂载后立即获取所有课程
onMounted(() => {
  fetchCourses();
});

// 点击搜索按钮的处理函数
const handleSearch = () => {
  fetchCourses();
};

// 重置搜索条件
const resetSearch = () => {
  searchQuery.value = {
    course_name: '',
    teacher_name: '',
    course_id: '',
    need_available: false,
  };
  fetchCourses();
};

const showEmpty = computed(() => !loading.value && courseList.value.length === 0);

const canSubmit = computed(() => {
  return Object.values(selectedCourses.value).some((isSelected) => isSelected);
});

// 提交选课 (调用 student.ts 中的 submitStudentCourseSelection)
const submitCourses = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请至少选择一门课程');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要提交选课结果吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    submitting.value = true;
    let allSubmittedSuccessfully = true;
    let errorMessages = [];

    const selectedCourseIds = Object.keys(selectedCourses.value).filter(
      (courseId) => selectedCourses.value[courseId]
    );

    for (const courseId of selectedCourseIds) {
      try {
        // 调用从 student.ts 导入的真实 API 函数
        const response = await submitStudentCourseSelection({
          student_id: studentId,
          course_id: Number(courseId),
        });

        // 根据你的API实际返回的成功代码调整
        if (response && response.code !== '200' && response.code !== 'success') { // 假设 '200' 或 'success' 为成功
          allSubmittedSuccessfully = false;
          errorMessages.push(`课程ID ${courseId}: ${response.message || '选课失败'}`);
        }
      } catch (err) {
        allSubmittedSuccessfully = false;
        errorMessages.push(`课程ID ${courseId}: 提交时发生网络错误`);
        console.error(`Error submitting course ${courseId}:`, err);
      }
    }

    if (allSubmittedSuccessfully) {
      ElMessage.success('所有选课提交成功！');
      selectedCourses.value = {};
      fetchCourses(); // 重新加载课程列表以更新状态
    } else {
      ElMessageBox.alert(`部分课程选课失败或发生错误：<br/>${errorMessages.join('<br/>')}`, '提交结果', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '我知道了'
      });
    }

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('选课提交操作失败');
      console.error('Error in submitCourses process:', error);
    }
  } finally {
    submitting.value = false;
  }
};

</script>

<style scoped>
.choose-course {
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
  width: 95%; /* 稍微调整宽度 */
  margin: 0 auto 20px auto; /* 保持居中和底部边距 */
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-bar {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px;
  margin-bottom: 20px;
  align-items: center; /* 垂直居中对齐 */
}

.search-input {
  width: 180px; /* 可以根据需要调整 */
}

.submit-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>