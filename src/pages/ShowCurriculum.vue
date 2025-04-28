<template>
  <div class="show-curriculum container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>查看个人培养方案</h2>
        </div>
      </template>
      
      <el-form :model="formData" label-width="120px" class="input-form">
        <el-form-item label="学生ID">
          <el-input v-model.number="formData.studentId" placeholder="请输入您的ID" type="number" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPersonalCurriculum" :loading="loading">
            获取个人培养方案
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="curriculumData" class="curriculum-card">
      <template #header>
        <div class="card-header">
          <h2>{{ curriculumData.major_name }} 专业个人培养方案</h2>
          <p>您所选择的课程如下</p>
        </div>
      </template>

      <div v-for="(section, sectionIndex) in curriculumData.sections" :key="sectionIndex" class="section-container">
        <div class="section-header">
          <h4>{{ sectionIndex + 1 }}. {{ section.section_name }}</h4>
          <el-tag type="info" style="font-size: 15px;">模块要求学分: {{ section.section_credit }}</el-tag>
          <el-tag type="success" style="font-size: 15px;">已选学分: {{ getSectionTotalCredits(section) }}</el-tag>
        </div>

        <el-table v-if="section.course_list && section.course_list.length > 0" :data="section.course_list" style="font-size: 15px;">
          <el-table-column prop="course_name" label="课程名称" />
          <el-table-column prop="credit" label="学分" width="120" />
        </el-table>
        
        <el-empty v-else description="该模块暂无选择课程" />
      </div>
    </el-card>

    <el-empty v-if="showEmpty" description="请先获取个人培养方案" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getPersonalCurriculum } from '../api/student.ts';

const formData = reactive({
  studentId: ''
});

const loading = ref(false);
// 添加一些测试数据
const curriculumData = ref({
  major_name: '计算机科学与技术',
  sections: [
    {
      section_name: '必修课',
      section_credit: 10,
      course_list: [
        {course_name: "高等数学", credit: 3},
        {course_name: "线性代数", credit: 2},
        {course_name: "概率论与数理统计", credit: 2},
        {course_name: "离散数学", credit: 2},
        {course_name: "数据结构", credit: 2},
        {course_name: "操作系统", credit: 2},
        {course_name: "计算机网络", credit: 2},
        {course_name: "数据库系统", credit: 2},
      ]
    },
    {
      section_name: '选修课',
      section_credit: 10,
      course_list: [
        {course_name: "人工智能", credit: 2},
        {course_name: "软件工程", credit: 2},
        {course_name: "计算机图形学", credit: 2},
        {course_name: "计算机系统结构", credit: 2},
        {course_name: "计算机系统安全", credit: 2},
        {course_name: "计算机系统安全", credit: 2},   
      ]
    }
  ]
});
const showEmpty = computed(() => !loading.value && !curriculumData.value);

// 计算每个部分的总学分
const getSectionTotalCredits = (section) => {
  if (!section.course_list || section.course_list.length === 0) return 0;
  
  return section.course_list.reduce((total, course) => {
    return total + Number(course.credit);
  }, 0);
};

// 获取个人培养方案
const fetchPersonalCurriculum = async () => {
  if (!formData.studentId) {
    ElMessage.warning('请输入学生ID');
    return;
  }
  
  try {
    loading.value = true;
    const response = await getPersonalCurriculum(formData.studentId);
    
    if (response.code === '200') {
      curriculumData.value = response.data;
      ElMessage.success('获取个人培养方案成功');
    } else {
      ElMessage.error(response.message || '获取失败');
    }
  } catch (error) {
    ElMessage.error('获取个人培养方案失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.show-curriculum {
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

.input-form {
  max-width: 500px;
  margin: 0 auto;
}

.section-container {
  margin-bottom: 30px;
  width: 90%;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  margin-top: 18px;
  gap: 15px;
}

.section-header h4 {
  margin: 0;
  flex-grow: 1;
}

.curriculum-card {
  width: 85%;
  margin: 0 auto;
}
</style>