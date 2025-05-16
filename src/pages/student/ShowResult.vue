<template>
  <div class="show-result container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <h2>选课结果</h2>
          <p>以下是您已选的课程列表</p>
        </div>
      </template>

      <el-table :data="selectedCourses" style="font-size: 15px;">
        <el-table-column prop="course_id" label="课程ID" width="90" />
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
            >退课</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="selectedCourses.length === 0" description="暂无选课结果" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const studentId = 10001; // 实际项目请从登录信息获取

// 示例数据
const exampleCourses = [
  {
    course_id: 1,
    course_name: '高等数学',
    teacher_name: '张三',
    credit: 3,
    class_time: '周一 1-2节',
    classroom: 'A101',
  },
  {
    course_id: 2,
    course_name: '线性代数',
    teacher_name: '李四',
    credit: 2,
    class_time: '周二 3-4节',
    classroom: 'B202',
  },
  {
    course_id: 3,
    course_name: '大学物理',
    teacher_name: '王五',
    credit: 4,
    class_time: '周三 5-6节',
    classroom: 'C303',
  }
];

const selectedCourses = ref([]);

// 获取选课结果
const fetchSelectedCourses = async () => {
  try {
    const res = await fetch(`/show_selected_courses?student_id=${studentId}`);
    const data = await res.json();
    if ((data.code === '200' || data.code === 200) && data.data && data.data.course_list) {
      selectedCourses.value = data.data.course_list;
      if (selectedCourses.value.length === 0) {
        selectedCourses.value = exampleCourses;
      }
    } else {
      ElMessage.error(data.message || '获取选课结果失败，已显示示例数据');
      selectedCourses.value = exampleCourses;
    }
  } catch (e) {
    ElMessage.error('网络错误，已显示示例数据');
    selectedCourses.value = exampleCourses;
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
    const res = await fetch('/drop_course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        course_id: course.course_id
      })
    });
    const data = await res.json();
    if (data.code === '200' || data.code === 200 || data.code === 'success') {
      ElMessage.success('退课成功');
      fetchSelectedCourses();
    } else {
      ElMessage.error(data.message || '退课失败');
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('退课操作失败');
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