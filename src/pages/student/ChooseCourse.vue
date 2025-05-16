<template>
  <div class="choose-course container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>选择课程</h2>
          <p>请选择您要修读的课程</p>
        </div>
      </template>

      <!-- 搜索栏 -->
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
        <el-checkbox v-model="searchQuery.onlyAvailable">
          仅显示可选课程
        </el-checkbox>
        <el-button type="primary" @click="filterCourses">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <el-table :data="filteredCourses" style="font-size: 15px;">
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
import { searchCourse } from '../../api/student.ts';

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
  {
    course_id: 3,
    course_name: '大学物理',
    teacher_name: '王五',
    credit: 4,
    class_time: '周三 5-6节',
    classroom: 'C303',
    available_capacity: 45,
    total_capacity: 60,
  },
  {
    course_id: 4,
    course_name: '英语',
    teacher_name: '赵六',
    credit: 3,
    class_time: '周四 7-8节',
    classroom: 'D404',
    available_capacity: 15,
    total_capacity: 35,
  },
  {
    course_id: 5,
    course_name: '程序设计',
    teacher_name: '孙七',
    credit: 4,
    class_time: '周五 9-10节',
    classroom: 'E505',
    available_capacity: 25,
    total_capacity: 45,
  },
  {
    course_id: 6,
    course_name: '概率论与数理统计',
    teacher_name: '周八',
    credit: 3,
    class_time: '周二 1-2节',
    classroom: 'A102',
    available_capacity: 35,
    total_capacity: 55,
  },
  {
    course_id: 7,
    course_name: '离散数学',
    teacher_name: '吴九',
    credit: 2,
    class_time: '周四 3-4节',
    classroom: 'B203',
    available_capacity: 10,
    total_capacity: 40,
  },
]);

const selectedCourses = ref({});
const submitting = ref(false);

// 搜索条件
const searchQuery = ref({
  course_name: '',
  teacher_name: '',
  course_id: '',
  onlyAvailable: false,
});

// 过滤后的课程列表
const filteredCourses = computed(() => {
  return courseList.value.filter((course) => {
    const matchesCourseName = searchQuery.value.course_name
      ? course.course_name.includes(searchQuery.value.course_name)
      : true;
    const matchesTeacherName = searchQuery.value.teacher_name
      ? course.teacher_name.includes(searchQuery.value.teacher_name)
      : true;
    const matchesCourseId = searchQuery.value.course_id
      ? course.course_id.toString().includes(searchQuery.value.course_id)
      : true;
    const matchesAvailability = searchQuery.value.onlyAvailable
      ? course.available_capacity > 0
      : true;

    return (
      matchesCourseName &&
      matchesTeacherName &&
      matchesCourseId &&
      matchesAvailability
    );
  });
});

// 是否显示空状态
const showEmpty = computed(() => filteredCourses.value.length === 0);

// 是否可以提交
const canSubmit = computed(() => {
  return Object.values(selectedCourses.value).some((isSelected) => isSelected);
});

const studentId = 10001; // TODO: 实际项目请从登录信息获取

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

    // 遍历每个选中的课程，依次调用后端接口
    for (const courseId of selectedCourseIds) {
      const res = await fetch('/choose_course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: Number(courseId),
        }),
      });
      const data = await res.json();
      if (data.code !== 'success') {
        ElMessage.error(`课程ID ${courseId} 选课失败: ${data.message}`);
        submitting.value = false;
        return;
      }
    }

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

// 过滤课程
const filterCourses = () => {
  // 触发 filteredCourses 的重新计算
};

// 重置搜索条件
const resetSearch = () => {
  searchQuery.value = {
    course_name: '',
    teacher_name: '',
    course_id: '',
    onlyAvailable: false,
  };
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

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 200px;
}

.submit-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>