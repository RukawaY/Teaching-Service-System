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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { searchCourse } from '../../api/student.ts';
import { selectionStatus, useSelectionPermit } from '../../api/selectionPermit.ts';

const API_BASE_URL = 'http://localhost:8080';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const router = useRouter();

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

// 学生ID (从登录信息获取)
const studentId = 10001; // TODO: 实际项目请从登录信息获取

// 处理选课权限获取失败
const handlePermitFailed = (errorMsg) => {
  console.log(`[选课] 选课权限获取失败，重定向回首页: ${errorMsg}`);
  
  // 过滤掉"操作成功"的错误消息，只有真正的错误才跳转
  if (errorMsg && errorMsg !== '操作成功') {
    ElMessage.warning(errorMsg);
    // 延迟一下再跳转，让用户能看到消息
    setTimeout(() => {
      router.push('/home');
    }, 1500);
  } else {
    console.log('[选课] 收到"操作成功"消息但权限获取失败，忽略跳转');
  }
};

// 自动处理选课权限
const permitHandler = useSelectionPermit(studentId, handlePermitFailed);

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

// 提交选课
const submitCourses = async () => {
  console.log('[选课] 开始提交选课...');
  
  if (!permitHandler.hasPermit()) {
    console.warn('[选课] 没有选课权限，无法提交选课');
    ElMessage.warning('系统繁忙，请稍后再试');
    return;
  }

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
    
    console.log(`[选课] 选中的课程ID: ${selectedCourseIds.join(', ')}`);

    // 遍历每个选中的课程，依次调用后端接口
    for (const courseId of selectedCourseIds) {
      console.log(`[选课] 正在选课: 课程ID ${courseId}`);
      try {
        const response = await api.post(`/course_selection/student/choose_course`, {
          student_id: studentId,
          course_id: Number(courseId),
        });
        
        if (response.data.code === "200" || response.data.code === 200) {
          console.log(`[选课] 课程ID ${courseId} 选课成功`);
        } else {
          console.error(`[选课] 课程ID ${courseId} 选课失败: ${response.data.message}`);
          ElMessage.error(`课程ID ${courseId} 选课失败: ${response.data.message}`);
          submitting.value = false;
          return;
        }
      } catch (error) {
        console.error(`[选课] 课程ID ${courseId} 选课请求失败:`, error);
        ElMessage.error(`选课请求失败，请检查网络连接`);
        submitting.value = false;
        return;
      }
    }

    console.log('[选课] 所有课程选课成功');
    ElMessage.success('选课提交成功');
    selectedCourses.value = {}; // 清空已选课程
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[选课] 选课提交失败:', error);
      ElMessage.error('选课提交失败');
    } else {
      console.log('[选课] 用户取消了选课操作');
    }
  } finally {
    submitting.value = false;
  }
};

// 过滤课程
const filterCourses = () => {
  console.log('[选课] 过滤课程:', searchQuery.value);
  // 触发 filteredCourses 的重新计算
};

// 重置搜索条件
const resetSearch = () => {
  console.log('[选课] 重置搜索条件');
  searchQuery.value = {
    course_name: '',
    teacher_name: '',
    course_id: '',
    onlyAvailable: false,
  };
};

// 页面加载和卸载日志
onMounted(() => {
  console.log('[选课页面] 页面已加载');
  
  // 检查是否有选课权限，如果没有就跳转回首页
  if (!permitHandler.hasPermit() && permitHandler.getErrorMessage()) {
    handlePermitFailed(permitHandler.getErrorMessage());
  }
});

onUnmounted(() => {
  console.log('[选课页面] 页面已卸载');
});
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