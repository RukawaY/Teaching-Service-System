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
        <el-form-item label="课程ID">
          <el-input v-model.number="formData.course_id" placeholder="请输入课程ID" type="number" />
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
        <el-table-column prop="course_id" label="课程ID" width="120" />
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
  course_id: ''
});

const submitting = ref(false);
const refreshing = ref(false);
// 添加一些示例数据
const applications = ref([
{
    student_id: 1,
    course_id: 1,
    course_name: '高等数学',
    teacher_name: '张三',
    class_time: '1-2节',
    classroom: 'A101',
    credit: 2,
    result: '待审核'
},
{
    student_id: 1,
    course_id: 2,
    course_name: '线性代数',
    teacher_name: '李四',
    class_time: '3-4节',
    classroom: 'B202',
    credit: 2,
    result: '补选成功'
},
{
    student_id: 1,
    course_id: 3,
    course_name: '概率论',
    teacher_name: '王五',
    class_time: '5-6节',
    classroom: 'C303',
    credit: 2,
    result: '补选失败'
}
]);

// 提交补选申请
const submitApplication = async () => {
  if (!formData.student_id || !formData.course_id) {
    ElMessage.warning('请输入学生ID和课程ID');
    return;
  }

  let course_info;
  submitting.value = true;

  // 先检查课程是否存在
  try {
    course_info = await searchCourse({
      course_id: formData.course_id
    });

    if (course_info.code != '200') {
      ElMessage.error(course_info.message || '获取课程信息失败');
      submitting.value = false;
      return;
    }
  } catch (error) {
    ElMessage.error('获取课程信息失败');
    console.error(error);
    submitting.value = false;
    return;
  }

  try {
    const params = {
      student_id: formData.student_id,
      course_id: formData.course_id
    };
    
    const response = await chooseCourseSupp(params);
    
    if (response.code === '200') {
      ElMessage.success('补选申请提交成功');

        // 添加到申请列表
      applications.value.unshift({
        student_id: formData.student_id,
        course_id: formData.course_id,
        course_name: course_info.data.course_name,
        teacher_name: course_info.data.course_list[0].teacher_name,
        class_time: course_info.data.course_list[0].class_time,
        classroom: course_info.data.course_list[0].classroom,
        credit: course_info.data.course_list[0].credit,
        result: '待审核'
      });
      
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
  if (applications.value.length === 0) {
    ElMessage.info('暂无申请记录可刷新');
    return;
  }

  try {
    refreshing.value = true;
    const response = await getSuppResult(formData.student_id);
    
    if (response.code === '200') {
      // 遍历applications.value，根据response.data.result_list中的course_id，更新applications.value中的result
      for (let i = 0; i < applications.value.length; i++) {
        const app = applications.value[i];
        const result = response.data.result_list.find(item => item.course_id === app.course_id);
        if (result) {
          applications.value[i].result = result.result;
        }
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