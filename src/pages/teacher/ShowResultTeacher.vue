<template>
  <div class="show-result-teacher container">
    <el-card class="result-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>教师选课情况</h2>
          <p>以下是您所授课程的学生选课情况</p>
        </div>
      </template>

      <el-table :data="tableData" style="font-size: 15px;">
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column prop="course_time" label="上课时间" />
        <el-table-column prop="course_classroom" label="上课教室" />
        <el-table-column label="学生名单">
          <template #default="scope">
            <div v-if="scope.row.student_list && scope.row.student_list.length">
              <div v-for="stu in scope.row.student_list" :key="stu.ID">
                {{ stu.ID }} - {{ stu.name }}
              </div>
            </div>
            <div v-else>暂无学生</div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无选课数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
// 导入你的 teacher API 函数
import { teacherAPI } from '../../api/teacher.ts'; // 请确认路径是否正确

const teacherId = 4; // 实际项目请从登录信息获取
const tableData = ref([]);
const loading = ref(false);

// 获取教师选课情况
const fetchResult = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getTeacherCourseResults(teacherId);
    // 响应拦截器已处理 response.data，所以 response 直接是数据
    if (response.code === '200' || response.code === 200 || response.code === 'success') { // 请根据后端实际成功码调整
      if (response.data && response.data.course_list) {
        // 处理 student_list 可能为单个对象或数组的情况
        tableData.value = response.data.course_list.map(item => {
          let studentListArray = [];
          if (item.student_list) {
            if (Array.isArray(item.student_list)) {
              studentListArray = item.student_list;
            } else {
              // 如果 API 返回的是单个对象，将其包装在数组中
              studentListArray = [item.student_list];
            }
          }
          return {
            ...item,
            student_list: studentListArray
          };
        });
      } else {
        tableData.value = [];
      }
    } else {
      ElMessage.error(response.message || '获取选课数据失败');
      tableData.value = [];
    }
  } catch (error) {
    ElMessage.error(error.message || '网络错误，无法获取选课数据');
    tableData.value = [];
    console.error('获取教师选课数据时出错:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchResult();
});
</script>

<style scoped>
.show-result-teacher {
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