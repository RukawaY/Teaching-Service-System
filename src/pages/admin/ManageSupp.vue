<template>
  <div class="manage-supp container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>课程补选申请管理</h2>
          <p>处理学生提交的课程补选申请</p>
        </div>
      </template>
      
      <el-form :model="formData" label-width="120px" class="input-form">
        <el-form-item label="课程ID">
          <el-input v-model.number="formData.courseId" placeholder="请输入课程ID(选填)" type="number" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchSupplementaryApplications" :loading="loading">
            查询补选申请
          </el-button>
          <el-button @click="resetForm">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="applications.length > 0" class="applications-card">
      <template #header>
        <div class="card-header">
          <h2>补选申请列表</h2>
          <p>共 {{ applications.length }} 条申请</p>
        </div>
      </template>

      <el-table :data="applications" style="width: 100%">
        <el-table-column prop="supplement_id" label="申请ID" width="90" />
        <el-table-column prop="student_id" label="学生ID" width="90" />
        <el-table-column prop="student_name" label="学生姓名" />
        <el-table-column prop="course_id" label="课程ID" width="90" />
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column label="审核结果" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.result === true" type="success">通过</el-tag>
            <el-tag v-else-if="scope.row.result === false" type="danger">拒绝</el-tag>
            <el-tag v-else type="info">待审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="success"
                size="small"
                @click="handleApprove(scope.row)"
                :disabled="scope.row.result !== null"
              >
                通过
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleReject(scope.row)"
                :disabled="scope.row.result !== null"
              >
                拒绝
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalApplications"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-empty v-if="showEmpty" description="暂无补选申请" />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSuppApplications, processSupplementary } from '../../api/admin';

// 定义响应式状态
const formData = reactive({
  courseId: ''
});

const loading = ref(false);
const applications = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalApplications = ref(0);

// 计算属性：是否显示空状态
const showEmpty = computed(() => !loading.value && applications.value.length === 0);

// API调用获取补选申请列表
const fetchSupplementaryApplications = async () => {
  try {
    loading.value = true;
    
    // 构造查询参数
    const params = {};
    if (formData.courseId) params.course_id = formData.courseId;
    
    const response = await getSuppApplications(params);
    
    if (response.code === '200') {
      applications.value = response.data.supplement_list;
      totalApplications.value = applications.value.length;
      
      if (applications.value.length > 0) {
        ElMessage.success(`共找到 ${applications.value.length} 条补选申请`);
      } else {
        ElMessage.info('未找到符合条件的补选申请');
      }
    } else {
      ElMessage.error(response.message || '获取补选申请失败');
    }
  } catch (error) {
    console.error('获取补选申请失败:', error);
    ElMessage.error('获取补选申请失败');
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formData.courseId = '';
  applications.value = [];
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  // 在实际应用中，这里应该重新请求分页数据
};

// 审核通过
const handleApprove = async (application) => {
  try {
    await ElMessageBox.confirm(
      `确定通过ID为 ${application.supplement_id} 的补选申请吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    );
    
    const response = await processSupplementary({
      supplement_id: application.supplement_id,
      result: true
    });
    
    if (response.code === '200') {
      // 更新本地数据
      const index = applications.value.findIndex(item => item.supplement_id === application.supplement_id);
      if (index !== -1) {
        applications.value[index].result = true;
      }
      
      ElMessage.success('已通过该补选申请');
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    console.error('处理补选申请失败:', error);
    ElMessage.error('处理补选申请失败');
  }
};

// 审核拒绝
const handleReject = async (application) => {
  try {
    await ElMessageBox.confirm(
      `确定拒绝ID为 ${application.supplement_id} 的补选申请吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await processSupplementary({
      supplement_id: application.supplement_id,
      result: false
    });
    
    if (response.code === '200') {
      // 更新本地数据
      const index = applications.value.findIndex(item => item.supplement_id === application.supplement_id);
      if (index !== -1) {
        applications.value[index].result = false;
      }
      
      ElMessage.success('已拒绝该补选申请');
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    console.error('处理补选申请失败:', error);
    ElMessage.error('处理补选申请失败');
  }
};

// 页面加载时默认查询一次
onMounted(fetchSupplementaryApplications);
</script>

<style scoped>
.manage-supp {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card, .applications-card {
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

.action-buttons {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>