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

      <el-empty v-if="!loading && selectedCourses.length === 0 && hasFetched" description="该学生暂无选课结果或ID不存在" />
      <el-empty v-if="!loading && !hasFetched" description="请输入学生ID并点击查看" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getStudentSelectedCourses, dropStudentCourse } from '../../api/student.ts'; //

const studentId = ref(''); // 修改点：初始化为空
const currentFetchedId = ref(''); // 用于显示当前查询的是哪个ID的结果
const selectedCourses = ref([]);
const loading = ref(false);
const hasFetched = ref(false); // 标记是否已执行过至少一次查询

const fetchSelectedCourses = async () => {
  if (!studentId.value) {
    ElMessage.warning('请输入学生ID');
    selectedCourses.value = []; // 清空之前的结果
    hasFetched.value = false;
    return;
  }
  loading.value = true;
  hasFetched.value = true;
  currentFetchedId.value = studentId.value; // 记录当前查询的ID
  try {
    const response = await getStudentSelectedCourses(Number(studentId.value)); //
    if (response.code === '200' || response.code === 200) { //
      if (response.data && response.data.course_list) {
        selectedCourses.value = response.data.course_list.map(course => ({ ...course, dropping: false })); //
      } else {
        selectedCourses.value = []; //
      }
    } else {
      ElMessage.error(response.message || '获取选课结果失败');
      selectedCourses.value = []; //
    }
  } catch (e) {
    ElMessage.error(e.message || '获取选课结果时发生网络错误');
    selectedCourses.value = []; //
    console.error("获取已选课程时出错:", e); //
  } finally {
    loading.value = false;
  }
};

const handleDropCourse = async (course) => {
  if (!currentFetchedId.value) { // 确保是在有已查询学生ID的上下文进行退课
      ElMessage.error('请先查询学生选课结果后再进行退课操作。');
      return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要为学生ID ${currentFetchedId.value} 退选课程「${course.course_name}」吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    course.dropping = true; //

    const payload = {
      student_id: Number(currentFetchedId.value), // 使用当前已查询的学生ID
      course_id: Number(course.course_id) 
    };
    const response = await dropStudentCourse(payload); //

    if (response.code === '200' || response.code === 200 || response.code === 'success') { //
      ElMessage.success(`课程「${course.course_name}」退课成功`);
      fetchSelectedCourses(); //
    } else {
      ElMessage.error(response.message || '退课失败'); //
    }
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') {
      ElMessage.error(e.message || '退课操作失败');
      console.error("退课时出错:", e); //
    }
  } finally {
    if (course) { 
       course.dropping = false; //
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
</style>