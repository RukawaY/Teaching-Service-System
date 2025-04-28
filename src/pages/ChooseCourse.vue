<template>
  <div class="choose-course container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>选择课程</h2>
          <p>请选择您要修读的课程</p>
        </div>
      </template>

      <el-table :data="courseList" style="font-size: 15px;">
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
          :disabled="!canSubmit"
        >
          提交选课
        </el-button>
      </div>
    </el-card>

    <el-empty v-if="showEmpty" description="暂无可选课程" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { searchCourse } from '../api/student.ts';

const courseList = ref([
  {
    course_id: 1,
    course_name: '高等数学',
    teacher_name: '张三',
    credit: 3,
    class_time: '周一 1-2节',
    classroom: 'A101',
    available_capacity: 30,
    total_capacity: 50,
  },
  {
    course_id: 2,
    course_name: '线性代数',
    teacher_name: '李四',
    credit: 2,
    class_time: '周二 3-4节',
    classroom: 'B202',
    available_capacity: 0,
    total_capacity: 40,
  },
  // 添加更多测试数据
]);

const selectedCourses = ref({});
const submitting = ref(false);

// 是否显示空状态
const showEmpty = computed(() => courseList.value.length === 0);

// 是否可以提交
const canSubmit = computed(() => {
  return Object.values(selectedCourses.value).some((isSelected) => isSelected);
});

// 提交选课
const submitCourses = async () => {
  try {
    await ElMessageBox.confirm('确定要提交选课结果吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    submitting.value = true;

    const selectedCourseIds = Object.keys(selectedCourses.value).filter(
      (courseId) => selectedCourses.value[courseId]
    );

    // 模拟提交选课结果
    console.log('提交的课程ID:', selectedCourseIds);

    ElMessage.success('选课提交成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('选课提交失败');
      console.error(error);
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
  width: 95%;
  margin: 0px auto 20px auto;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.submit-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>