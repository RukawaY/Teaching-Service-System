<template>
  <div class="choose-course-supp container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>课程补选申请</h2>
        </div>
      </template>
      
      <el-form :model="formData" label-width="120px" class="input-form">
        <el-form-item label="学生ID">
          <el-input v-model.number="formData.student_id" placeholder="请输入学生ID" type="number" />
        </el-form-item>
        <el-form-item label="开课ID">
          <el-input v-model.number="formData.section_id" placeholder="请输入开课ID" type="number" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitApplication" :loading="submitting">
            提交补选申请
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="applications-card">
      <template #header>
        <div class="card-header">
          <h2>补选申请记录</h2>
          <el-button type="primary" @click="refreshApplications" :loading="refreshing">
            刷新补选状态
          </el-button>
        </div>
      </template>

      <el-table v-if="applications.length > 0" :data="applications" style="width: 100%">
        <el-table-column prop="section_id" label="开课ID" width="120" />
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column prop="teacher_name" label="教师姓名" />
        <el-table-column prop="class_time" label="上课时间" />
        <el-table-column prop="classroom" label="上课地点" />
        <el-table-column prop="credit" label="学分数" />
        <el-table-column prop="result" label="补选状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.result)">{{ scope.row.result }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="applications.length === 0" description="暂无补选申请记录" />

    </el-card>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { chooseCourseSupp, getSuppResult, searchCourse } from '../../api/student';

const formData = reactive({
  student_id: '',
  section_id: ''
});

const submitting = ref(false);
const refreshing = ref(false);
// 添加一些示例数据
const applications = ref([]);

// 提交补选申请
const submitApplication = async () => {
  if (!formData.student_id || !formData.section_id) {
    ElMessage.warning('请输入学生ID和开课ID');
    return;
  }

  let course_info;
  submitting.value = true;

  try {
    const params = {
      student_id: formData.student_id,
      section_id: formData.section_id
    };
    
    const response = await chooseCourseSupp(params);
    
    if (response.code === '200') {
      ElMessage.success('补选申请提交成功');

      // 自动刷新补选申请状态
      await refreshApplications();
      
    } else {
      ElMessage.error(response.message || '提交失败');
    }
  } catch (error) {
    ElMessage.error('提交补选申请失败');
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

// 刷新补选申请状态
const refreshApplications = async () => {
  if (!formData.student_id) {
    ElMessage.warning('请输入学生ID');
    return;
  }

  try {
    refreshing.value = true;
    const response = await getSuppResult(formData.student_id);

    console.log(response);
    
    if (response.code === '200') {
      // 先清空applications.value
      applications.value = [];

      for (let i = 0; i < response.data.result_list.length; i++) {
        // 先添加到applications.value中
        applications.value.push({
          student_id: formData.student_id,
          section_id: response.data.result_list[i].section_id,
          course_name: response.data.result_list[i].course_name,
          teacher_name: response.data.result_list[i].teacher_name,
          class_time: response.data.result_list[i].class_time,
          classroom: response.data.result_list[i].classroom,
          credit: response.data.result_list[i].credit,
          result: reflectResult(response.data.result_list[i].result)
        });
      }

      if (applications.value.length === 0) {
        ElMessage.info('暂无申请记录可刷新');
        return;
      }

      ElMessage.success('刷新补选状态成功');
    } else {
      ElMessage.error(response.message || '刷新补选状态失败');
    }
  } catch (error) {
    ElMessage.error('刷新补选状态失败');
    console.error(error);
  } finally {
    refreshing.value = false;
  }
};

const reflectResult = (result) => {
  switch (result) {
    case '0':
      return '待审核';
    case '1':
      return '补选成功';
    case '2':
      return '补选失败';
    default:
      return '未知';
  }
}

// 获取状态对应的标签类型
const getStatusType = (status) => {
  switch (status) {
    case '补选成功':
      return 'success';
    case '补选失败':
      return 'danger';
    case '待审核':
    default:
      return 'info';
  }
};
</script>

<style scoped>
.choose-course-supp {
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

.applications-card {
  width: 95%;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}

.input-form {
  max-width: 500px;
  margin: 0 auto;
}

.empty-container {
  margin: 40px 0;
}
</style>