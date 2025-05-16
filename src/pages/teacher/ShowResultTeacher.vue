<template>
  <div class="show-result-teacher container">
    <el-card class="result-card">
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

      <el-empty v-if="tableData.length === 0" description="暂无选课数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const teacherId = 1; // 实际项目请从登录信息获取

// 示例数据
const exampleData = [
  {
    course_name: '高等数学',
    course_time: '周一 1-2节',
    course_classroom: 'A101',
    student_list: [
      { ID: '20210101', name: '张三' },
      { ID: '20210102', name: '李四' }
    ]
  },
  {
    course_name: '线性代数',
    course_time: '周二 3-4节',
    course_classroom: 'B202',
    student_list: [
      { ID: '20210201', name: '王五' }
    ]
  },
  {
    course_name: '大学物理',
    course_time: '周三 5-6节',
    course_classroom: 'C303',
    student_list: [
      { ID: '20210301', name: '赵六' },
      { ID: '20210302', name: '孙七' }
    ]
  }
];

const tableData = ref([]);

// 获取教师选课情况
const fetchResult = async () => {
  try {
    const res = await fetch(`/getresult?teacher_id=${teacherId}`);
    const data = await res.json();
    if ((data.code === '200' || data.code === 200 || data.code === 'success') && data.data && data.data.course_list) {
      // 兼容 student_list 可能为对象或数组
      tableData.value = data.data.course_list.map(item => ({
        ...item,
        student_list: Array.isArray(item.student_list)
          ? item.student_list
          : item.student_list
            ? [item.student_list]
            : []
      }));
      if (tableData.value.length === 0) {
        tableData.value = exampleData;
      }
    } else {
      ElMessage.error(data.message || '获取选课数据失败，已显示示例数据');
      tableData.value = exampleData;
    }
  } catch (e) {
    ElMessage.error('网络错误，已显示示例数据');
    tableData.value = exampleData;
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