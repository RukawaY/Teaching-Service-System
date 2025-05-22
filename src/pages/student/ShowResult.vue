<template>
  <div class="show-result container">
    <el-card class="result-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>选课结果</h2>
          <p>以下是您已选的课程列表</p>
        </div>
      </template>

      <el-table :data="selectedCourses" style="font-size: 15px;">
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

      <el-empty v-if="!loading && selectedCourses.length === 0" description="暂无选课结果" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 从 student.ts 导入你的实际API函数
import { getStudentSelectedCourses, dropStudentCourse } from '../../api/student.ts'; // 如果需要，调整路径
// 假设 detailedCourseInfo 和 StudentCourseActionPayload 也可能对类型定义有用
// import type { detailedCourseInfo, StudentCourseActionPayload } from '../../api/student.ts';


const studentId = 2; // TODO: 实际项目请从登录信息获取

const selectedCourses = ref([]); // 将持有: Array<detailedCourseInfo & { dropping?: boolean }>
const loading = ref(false);

// 获取选课结果
const fetchSelectedCourses = async () => {
  loading.value = true;
  try {
    // API期望 student_id 是一个数字
    const response = await getStudentSelectedCourses(Number(studentId));
    if (response.code === '200' || response.code === 200) { // 检查你后端实际的成功代码
      if (response.data && response.data.course_list) {
        selectedCourses.value = response.data.course_list.map(course => ({ ...course, dropping: false }));
      } else {
        selectedCourses.value = [];
      }
    } else {
      ElMessage.error(response.message || '获取选课结果失败');
      selectedCourses.value = []; // 出错时清空列表
    }
  } catch (e) {
    ElMessage.error(e.message || '获取选课结果时发生网络错误');
    selectedCourses.value = []; // 出错时清空列表
    console.error("获取已选课程时出错:", e);
  } finally {
    loading.value = false;
  }
};

// 退课功能
const handleDropCourse = async (course) => {
  try {
    await ElMessageBox.confirm(
      `确定要退选课程「${course.course_name}」吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    course.dropping = true; // 为特定按钮设置加载状态

    const payload = {
      student_id: Number(studentId),
      course_id: Number(course.course_id) // 确保 course_id 是数字
    };
    
    const response = await dropStudentCourse(payload);

    if (response.code === '200' || response.code === 200 || response.code === 'success') { // 检查你后端的成功代码
      ElMessage.success(`课程「${course.course_name}」退课成功`);
      fetchSelectedCourses(); // 刷新已选课程列表
    } else {
      ElMessage.error(response.message || '退课失败');
    }
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') { // 如果 ElMessageBox 是通过 'Esc' 或 'x' 关闭的，可能是 'close'
      ElMessage.error(e.message || '退课操作失败');
      console.error("退课时出错:", e);
    }
  } finally {
    if (course) { // 检查 course 是否仍然存在 (如果组件在异步操作期间被卸载，可能不存在)
       course.dropping = false; // 重置按钮的加载状态
    }
  }
};

onMounted(() => {
  fetchSelectedCourses();
});
</script>

<style scoped>
.show-result {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-card {
  width: 95%;
  margin: 0px auto 20px auto;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>