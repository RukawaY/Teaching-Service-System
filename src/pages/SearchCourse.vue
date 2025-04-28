<template>
  <div class="search-course container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>课程信息查询</h2>
          <p>请输入至少一项查询条件</p>
        </div>
      </template>
      
      <el-form :model="formData" label-width="120px" class="input-form">
        <el-form-item label="课程名称">
          <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="教师姓名">
          <el-input v-model="formData.teacherName" placeholder="请输入教师姓名" />
        </el-form-item>
        <el-form-item label="课程ID">
          <el-input v-model.number="formData.courseId" placeholder="请输入课程ID" type="number" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchCourses" :loading="loading">
            查询课程
          </el-button>
          <el-button @click="resetForm">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="courseList.length > 0" class="result-card">
      <template #header>
        <div class="card-header">
          <h2>查询结果</h2>
          <p>共查询到 {{ courseList.length }} 门课程</p>
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
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              type="primary"
              size="small" 
              @click="showCourseDetails(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-if="showEmpty" description="请输入查询条件并点击查询按钮" />
    <el-empty v-if="noResults" description="未找到符合条件的课程" />

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="课程详情"
      width="50%"
    >
      <div v-if="selectedCourse" class="course-details">
        <h3>{{ selectedCourse.course_name }}</h3>
        <el-descriptions :column="1">
          <el-descriptions-item label="课程 ID">{{ selectedCourse.course_id }}</el-descriptions-item>
          <el-descriptions-item label="授课教师">{{ selectedCourse.teacher_name }}</el-descriptions-item>
          <el-descriptions-item label="课程学分">{{ selectedCourse.credit }}</el-descriptions-item>
          <el-descriptions-item label="上课时间">{{ selectedCourse.class_time }}</el-descriptions-item>
          <el-descriptions-item label="上课教室">{{ selectedCourse.classroom }}</el-descriptions-item>
          <el-descriptions-item label="课程容量">{{ selectedCourse.available_capacity }}/{{ selectedCourse.total_capacity }}</el-descriptions-item>
          <el-descriptions-item label="课程描述">{{ selectedCourse.course_description }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { searchCourse } from '../api/student.ts';

const formData = reactive({
  courseName: '',
  teacherName: '',
  courseId: ''
});

const loading = ref(false);
// 添加一些测试数据
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
    course_description: '高等数学是大学数学的基础课程，主要内容包括极限、导数、积分等。'
  },
  {
    course_id: 2,
    course_name: '线性代数',
    teacher_name: '李四',
    credit: 2,
    class_time: '周二 3-4节',
    classroom: 'B202',
    available_capacity: 25,
    total_capacity: 40,
    course_description: '线性代数是大学数学的重要课程，主要内容包括向量、矩阵、线性方程组等。'
  },
  {
    course_id: 3,
    course_name: '概率论与数理统计',
    teacher_name: '王五',
    credit: 3,
    class_time: '周三 5-6节',
    classroom: 'C303',
    available_capacity: 35,
    total_capacity: 50,
    course_description: '概率论与数理统计是大学数学的重要课程，主要内容包括概率论、数理统计等。'
  }
]);
const searchPerformed = ref(false);
const dialogVisible = ref(false);
const selectedCourse = ref(null);

// 计算属性：是否显示空状态
const showEmpty = computed(() => !loading.value && !searchPerformed.value);

// 计算属性：是否显示无结果状态
const noResults = computed(() => searchPerformed.value && courseList.value.length === 0);

// 查询课程
const searchCourses = async () => {
  // 检查是否至少输入了一个查询条件
  if (!formData.courseName && !formData.teacherName && !formData.courseId) {
    ElMessage.warning('请至少输入一个查询条件');
    return;
  }
  
  try {
    loading.value = true;
    searchPerformed.value = true;
    
    // 构造查询参数
    const params = {
      course_name: formData.courseName || undefined,
      teacher_name: formData.teacherName || undefined,
      course_id: formData.courseId || undefined
    };
    
    const response = await searchCourse(params);
    
    if (response.code === '200') {
      courseList.value = response.data.course_list;
      if (courseList.value.length === 0) {
        ElMessage.info('未找到符合条件的课程');
      } else {
        ElMessage.success(`共找到 ${courseList.value.length} 门课程`);
      }
    } else {
      ElMessage.error(response.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('查询课程失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formData.courseName = '';
  formData.teacherName = '';
  formData.courseId = '';
  searchPerformed.value = false;
  courseList.value = [];
};

// 显示课程详情
const showCourseDetails = (course) => {
  selectedCourse.value = course;
  dialogVisible.value = true;
};
</script>

<style scoped>
.search-course {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card, .result-card {
  width: 95%;
  margin: 0px auto 20px auto;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header p {
  margin-top: 8px;
  color: #666;
}

.input-form {
  max-width: 500px;
  margin: 0 auto;
}

.course-details h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #409EFF;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>