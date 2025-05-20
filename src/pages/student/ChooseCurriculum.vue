<template>
  <div class="choose-curriculum container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>定制个人培养方案</h2>
        </div>
      </template>
      
      <el-form :model="formData" label-width="120px" class="input-form">
        <el-form-item label="学生ID">
          <el-input v-model.number="formData.studentId" placeholder="请输入学生ID" type="number" />
        </el-form-item>
        <el-form-item label="专业名称">
          <el-input v-model="formData.majorName" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchMajorCurriculum" :loading="loading">
            获取专业培养方案
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="curriculumData" class="curriculum-card">
      <template #header>
        <div class="card-header">
          <h2>{{ curriculumData.major_name }} 专业培养方案</h2>
          <p>请在以下各模块中选择您要修读的课程</p>
        </div>
      </template>

      <div v-for="(section, sectionIndex) in curriculumData.sections" :key="sectionIndex" class="section-container">
        <div class="section-header">
          <h4>{{ sectionIndex + 1 }}. {{ section.section_name }}</h4>
          <el-tag type="info" style="font-size: 15px;">模块要求学分: {{ section.section_credit }}</el-tag>
          <el-tag type="success" style="font-size: 15px;">已选学分: {{ sectionCredits[sectionIndex] }}</el-tag>
        </div>

        <el-table :data="section.course_list" style="font-size: 15px;">
          <el-table-column prop="course_name" label="课程名称" />
          <el-table-column prop="credit" label="学分" width="120" />
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-checkbox 
                v-model="selectedCourses[`${sectionIndex}-${scope.$index}`]" 
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="submit-area">
        <el-button type="primary" @click="submitCurriculum" :loading="submitting" :disabled="!canSubmit">
          提交个人培养方案
        </el-button>
      </div>
    </el-card>

    <el-empty v-if="showEmpty" description="请先获取专业培养方案" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMajorCurriculum, setPersonalCurriculum } from '../../api/student';

const formData = reactive({
  studentId: '',
  majorName: ''
});

const loading = ref(false);
const submitting = ref(false);
// 添加一些测试用例
const curriculumData = ref();
const selectedCourses = ref({});
const showEmpty = computed(() => !loading.value && !curriculumData.value);

// 为每个部分创建计算属性获取已选学分
const getSectionCredits = (section, sectionIndex) => {
  let credits = 0;
  section.course_list.forEach((course, courseIndex) => {
    const key = `${sectionIndex}-${courseIndex}`;
    if (selectedCourses.value[key]) {
      credits += Number(course.credit);
    }
  });
  return credits;
};

// 创建一个响应式的计算属性映射，存储每个section的已选学分
const sectionCredits = computed(() => {
  if (!curriculumData.value) return {};
  
  const credits = {};
  curriculumData.value.sections.forEach((section, sectionIndex) => {
    credits[sectionIndex] = getSectionCredits(section, sectionIndex);
  });
  return credits;
});

// 是否可以提交
const canSubmit = computed(() => {
  if (!curriculumData.value) return false;
  
  // 检查每个section的已选学分是否满足要求
  return curriculumData.value.sections.every((section, sectionIndex) => {
    return getSectionCredits(section, sectionIndex) >= section.section_credit;
  });
});

// 获取专业培养方案
const fetchMajorCurriculum = async () => {
  if (!formData.majorName) {
    ElMessage.warning('请输入专业名称');
    return;
  }
  
  try {
    loading.value = true;
    const response = await getMajorCurriculum(formData.majorName);
    
    if (response.code === '200') {
      curriculumData.value = response.data;
      selectedCourses.value = {}; // 重置选择
      ElMessage.success('获取专业培养方案成功');
    } else {
      ElMessage.error(response.message || '获取失败');
    }
  } catch (error) {
    ElMessage.error('获取专业培养方案失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 提交个人培养方案
const submitCurriculum = async () => {
  if (!formData.studentId) {
    ElMessage.warning('请输入学生ID');
    return;
  }
  
  if (!curriculumData.value) {
    ElMessage.warning('请先获取专业培养方案');
    return;
  }

  try {
    // 确认提交
    await ElMessageBox.confirm('确定要提交个人培养方案吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    });
    
    submitting.value = true;
    
    // 准备提交数据
    const sectionsToSubmit = curriculumData.value.sections.map((section, sectionIndex) => {
      const selectedCourseList = section.course_list.filter((_, courseIndex) => 
        selectedCourses.value[`${sectionIndex}-${courseIndex}`]
      );
      
      return {
        section_name: section.section_name,
        section_credit: section.section_credit,
        course_list: selectedCourseList
      };
    });
    
    const submitData = {
      student_id: formData.studentId,
      major_name: curriculumData.value.major_name,
      sections: sectionsToSubmit
    };

    console.log(submitData);
    
    const response = await setPersonalCurriculum(submitData);
    
    if (response.code === '200') {
      ElMessage.success('提交个人培养方案成功');
    } else {
      ElMessage.error(response.message || '提交失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交个人培养方案失败');
      console.error(error);
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.choose-curriculum {
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

.submit-area {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.curriculum-card {
  width: 65%;
  margin: 0 auto;
}
</style>