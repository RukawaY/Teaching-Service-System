<template>
  <div class="show-result-teacher container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <h2>教师选课情况</h2>
        </div>
      </template>

      <el-form inline class="id-input-form" @submit.prevent="fetchResult">
        <el-form-item label="教师ID:">
          <el-input
            v-model.number="teacherId"
            placeholder="请输入教师ID查看结果"
            type="number"
            style="width: 250px; margin-right: 10px;"
            @keyup.enter="fetchResult"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchResult" :loading="loading">
            查看选课情况
          </el-button>
        </el-form-item>
      </el-form>
      <p v-if="!loading && tableData.length > 0" style="text-align: center; margin-bottom: 15px;">
        以下是ID为 <strong>{{ currentFetchedTeacherId }}</strong> 的教师所授课程学生选课情况
      </p>

      <el-table :data="tableData" style="font-size: 15px;" v-loading="loading">
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

      <el-empty v-if="!loading && tableData.length === 0 && hasFetched" description="该教师暂无课程选课数据或ID不存在" />
      <el-empty v-if="!loading && !hasFetched" description="请输入教师ID并点击查看" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { teacherAPI } from '../../api/teacher.ts'; // [cite: 61]

const teacherId = ref(''); // 修改点：初始化为空 [cite: 62]
const currentFetchedTeacherId = ref(''); // 用于显示当前查询的是哪个ID的结果
const tableData = ref([]);
const loading = ref(false);
const hasFetched = ref(false); // 标记是否已执行过至少一次查询

const fetchResult = async () => {
  if (!teacherId.value) {
    ElMessage.warning('请输入教师ID');
    tableData.value = []; // 清空之前的结果
    hasFetched.value = false;
    return;
  }
  loading.value = true;
  hasFetched.value = true;
  currentFetchedTeacherId.value = teacherId.value; // 记录当前查询的ID
  try {
    // 确保 teacherId 是数字
    const response = await teacherAPI.getTeacherCourseResults(Number(teacherId.value)); // [cite: 64]
    if (response.code === '200' || response.code === 200 || response.code === 'success') { // [cite: 65]
      if (response.data && response.data.course_list) {
        tableData.value = response.data.course_list.map(item => { // [cite: 65]
          let studentListArray = [];
          if (item.student_list) {
            if (Array.isArray(item.student_list)) {
              studentListArray = item.student_list; // [cite: 66]
            } else {
              studentListArray = [item.student_list]; // [cite: 66]
            }
          }
          return { // [cite: 67]
            ...item,
            student_list: studentListArray
          };
        });
      } else {
        tableData.value = []; // [cite: 68]
      }
    } else {
      ElMessage.error(response.message || '获取选课数据失败');
      tableData.value = []; // [cite: 69]
    }
  } catch (error) {
    ElMessage.error(error.message || '网络错误，无法获取选课数据');
    tableData.value = [];
    console.error('获取教师选课数据时出错:', error); // [cite: 70]
  } finally {
    loading.value = false; // [cite: 71]
  }
};

// 页面加载时不再自动获取
// onMounted(() => {
//  fetchResult();
// });
</script>

<style scoped>
/* 在现有样式基础上添加 */
.id-input-form {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.show-result-teacher {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.container {
  display: flex;
  flex-direction: column;
  gap: 20px; /* [cite: 72] */
}
.result-card {
  width: 95%;
  margin: 0px auto 20px auto; /* [cite: 73] */
}
.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>