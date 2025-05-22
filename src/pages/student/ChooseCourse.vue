<template>
  <div class="choose-course container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>选择课程</h2>
          <p>请选择您要修读的课程</p>
        </div>
      </template>

      <el-form inline class="id-input-form" @submit.prevent>
        <el-form-item label="学生ID:">
          <el-input
            v-model.number="studentId"
            placeholder="请输入学生ID"
            type="number"
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="studentIdEntered"
          />
           <el-button @click="studentIdEntered">确认ID (用于提交)</el-button>
        </el-form-item>
      </el-form>
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
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { searchCourse, submitStudentCourseSelection } from '../../api/student.ts';

const courseList = ref([]);
const selectedCourses = ref({});
const submitting = ref(false);
const loading = ref(false);

const searchQuery = ref({
  course_name: '',
  teacher_name: '',
  course_id: '',
  need_available: false,
});

// 将 studentId 初始化为空字符串，以便输入框显示 placeholder
const studentId = ref(''); // 修改点：不再写死，改为空字符串或 null

// 提醒用户输入ID的函数
const studentIdEntered = () => {
  if (!studentId.value) {
    ElMessage.info('请输入学生ID以便进行选课提交。');
  } else {
    ElMessage.success(`学生ID已确认为: ${studentId.value}。现在可以进行选课提交。`);
  }
};

const fetchCourses = async () => {
  loading.value = true;
  try {
    const paramsToApi = {};
    if (searchQuery.value.course_name) paramsToApi.course_name = searchQuery.value.course_name;
    if (searchQuery.value.teacher_name) paramsToApi.teacher_name = searchQuery.value.teacher_name;
    if (searchQuery.value.course_id) paramsToApi.course_id = Number(searchQuery.value.course_id);
    if (searchQuery.value.need_available) paramsToApi.need_available = searchQuery.value.need_available;
    
    // 选课页面的课程搜索API通常不需要student_id，除非API支持根据学生培养方案过滤可选课程
    // 如果你的 searchCourse API 需要 student_id, 在这里添加:
    // if (studentId.value) paramsToApi.student_id = Number(studentId.value);

    const response = await searchCourse(paramsToApi);
    if (response && response.code === '200' && response.data && response.data.course_list) {
      courseList.value = response.data.course_list;
    } else {
      ElMessage.error(response.message || '获取课程列表失败');
      courseList.value = [];
    }
  } catch (error) {
    ElMessage.error(error.message || '请求课程列表时发生网络错误');
    console.error('Error fetching courses:', error);
    courseList.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCourses();
});

const handleSearch = () => {
  fetchCourses();
};

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

const submitCourses = async () => {
  if (!studentId.value) { // 修改点：检查 studentId 是否已输入
    ElMessage.error('请先输入并确认学生ID再提交选课！');
    return;
  }
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
        const response = await submitStudentCourseSelection({
          student_id: Number(studentId.value), // 修改点：使用 ref 的 value
          course_id: Number(courseId),
        });
        if (response && response.code !== '200' && response.code !== 'success') {
          allSubmittedSuccessfully = false;
          errorMessages.push(`课程ID ${courseId}: ${response.message || '选课失败'}`);
        }
      } catch (err) {
        allSubmittedSuccessfully = false;
        errorMessages.push(`课程ID ${courseId}: ${err.message || '提交时发生网络错误'}`);
        console.error(`Error submitting course ${courseId}:`, err);
      }
    }

    if (allSubmittedSuccessfully) {
      ElMessage.success('所有选课提交成功！');
      selectedCourses.value = {};
      fetchCourses(); 
    } else {
      ElMessageBox.alert(`部分课程选课失败或发生错误：<br/>${errorMessages.join('<br/>')}`, '提交结果', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '我知道了'
      });
    }

  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.message || '选课提交操作失败');
      console.error('Error in submitCourses process:', error);
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* 在现有样式基础上添加 */
.id-input-form {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
.choose-course {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.container {
  display: flex;
  flex-direction: column;
  gap: 20px; /* */
}
.form-card {
  width: 95%;
  margin: 0 auto 20px auto; /* */
}
.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.search-bar {
  display: flex;
  flex-wrap: wrap; /* */
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}
.search-input {
  width: 180px; /* */
}
.submit-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>