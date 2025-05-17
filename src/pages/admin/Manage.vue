<template>
  <!-- 
    el-table组件是Element Plus库提供的表格组件
    :data 属性绑定表格的数据源，这里绑定到tableData响应式引用
    stripe 属性设置表格为斑马纹样式(奇偶行不同背景色)
    style 设置表格样式，宽度100%并且左边距20px
  -->
  <el-table :data="tableData" stripe style="width: 100%; margin-left: 20px;">
    <!-- 
      el-table-column 定义表格的列
      prop 属性指定该列显示数据对象的哪个属性
      label 属性设置列标题
    -->
    <el-table-column prop="name" label="操作名称">
      <!-- 
        通过 #default="scope" 插槽自定义单元格内容
        scope.row 包含当前行的数据对象
      -->
      <template #default="scope">
        <span style="font-size: 16px;">{{ scope.row.name }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="value" label="操作值">
      <template #default="scope">
        <!-- 
          条件渲染：当行处于编辑状态且不是"控制在线选课人数"行时显示日期选择器
          v-model 双向绑定当前行的value属性
          type="datetime" 设置为日期时间选择器
        -->
        <el-date-picker
          v-model="scope.row.value"
          type="datetime"
          placeholder="选择日期与时间"
          v-if="scope.row.isEditing && scope.row.name != '控制在线选课人数'"
        />
        <!-- 
          条件渲染：当行处于编辑状态且是"控制在线选课人数"行时显示输入框
          size="medium" 设置输入框大小为中等
        -->
        <el-input v-model="scope.row.value" v-if="scope.row.isEditing && scope.row.name === '控制在线选课人数'" size="medium" />
        <!-- 
          条件渲染：当行不处于编辑状态时显示格式化后的值
          调用timeFormat函数格式化日期时间
        -->
        <span v-if="!scope.row.isEditing" style="font-size: 16px;">{{ timeFormat(scope.row.value) }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="modify" label="修改操作">
      <template #default="scope">
        <el-button type="primary" size="medium" @click="handleRowAction(scope.row)">
          {{ scope.row.isEditing ? '保存' : '编辑' }}
        </el-button>
      </template>
    </el-table-column>
    
  </el-table>
</template>

<script setup>
// 从Vue导入ref函数，用于创建响应式数据
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTimeSettings, updateTimeSettings } from '../../api/admin'

// 添加加载状态
const loading = ref(false)


function timeFormat(time) {
  return time.toLocaleString('zh-CN', { hour12: false })
}

/**
 * 表格数据定义
 * ref创建响应式数据，包含表格中显示的所有行
 * 每行包含：
 * - name: 操作名称
 * - value: 操作值(可以是数字或日期)
 * - isEditing: 标记当前行是否处于编辑状态，初始为false
 * - key: API数据映射键
 */
const tableData = ref([
  { name: '控制在线选课人数', value: 100, isEditing: false, key: 'max_number' },
  { name: '初选开始时间', value: new Date('2025-04-24 10:00:00'), isEditing: false, key: 'first_start' },
  { name: '初选结束时间', value: new Date('2025-04-24 10:00:00'), isEditing: false, key: 'first_end' },
  { name: '补选开始时间', value: new Date('2025-04-24 10:00:00'), isEditing: false, key: 'second_start' },
  { name: '补选结束时间', value: new Date('2025-04-24 10:00:00'), isEditing: false, key: 'second_end' },
])

/**
 * 行动作处理函数
 * 当点击编辑/保存按钮时处理行数据的变更
 * @param {Object} row 当前操作的行数据
 */
const handleRowAction = async (row) => {
  // 如果当前是编辑状态，点击保存
  if (row.isEditing) {
    try {
      // 准备API请求数据
      const requestData = {
        max_number: 100,
        first_time_list: [],
        second_time_list: [],
        drop_time_list: []
      };

      // 根据当前行类型设置对应的请求数据
      if (row.key === 'max_number') {
        requestData.max_number = Number(row.value);
      } else {
        // 获取所有时间相关的行
        const firstStartRow = tableData.value.find(r => r.key === 'first_start');
        const firstEndRow = tableData.value.find(r => r.key === 'first_end');
        const secondStartRow = tableData.value.find(r => r.key === 'second_start');
        const secondEndRow = tableData.value.find(r => r.key === 'second_end');
        
        // 设置初选时间
        requestData.first_time_list = [
          firstStartRow?.value instanceof Date ? firstStartRow.value.toISOString() : new Date().toISOString(),
          firstEndRow?.value instanceof Date ? firstEndRow.value.toISOString() : new Date().toISOString()
        ];
        
        // 设置补选时间
        requestData.second_time_list = [
          secondStartRow?.value instanceof Date ? secondStartRow.value.toISOString() : new Date().toISOString(),
          secondEndRow?.value instanceof Date ? secondEndRow.value.toISOString() : new Date().toISOString()
        ];
      }
      
      // 调用API保存设置
      const response = await updateTimeSettings(requestData);
      
      if (response.code === '200') {
        ElMessage.success(`"${row.name}"已成功更新`);
      } else {
        ElMessage.error(response.message || '更新失败');
        // 保持编辑状态
        return;
      }
    } catch (error) {
      console.error('保存设置出错:', error);
      ElMessage.error('保存设置失败');
      
      // 保持编辑状态
      return;
    }
  }
  
  // 切换编辑状态
  row.isEditing = !row.isEditing;
}

/**
 * 获取系统时间设置
 * 页面加载时从服务器获取当前设置
 */
const fetchTimeSettings = async () => {
  try {
    loading.value = true;
    const response = await getTimeSettings();
    
    if (response.code === '200') {
      // 更新在线选课人数
      const maxNumberRow = tableData.value.find(row => row.key === 'max_number');
      if (maxNumberRow) {
        maxNumberRow.value = Number(response.data.max_number);
      }
      
      // 更新初选开始/结束时间
      if (response.data.first_time_list && response.data.first_time_list.length >= 2) {
        const firstStartRow = tableData.value.find(row => row.key === 'first_start');
        const firstEndRow = tableData.value.find(row => row.key === 'first_end');
        
        if (firstStartRow) {
          firstStartRow.value = new Date(response.data.first_time_list[0]);
        }
        
        if (firstEndRow) {
          firstEndRow.value = new Date(response.data.first_time_list[1]);
        }
      }
      
      // 更新补选开始/结束时间
      if (response.data.second_time_list && response.data.second_time_list.length >= 2) {
        const secondStartRow = tableData.value.find(row => row.key === 'second_start');
        const secondEndRow = tableData.value.find(row => row.key === 'second_end');
        
        if (secondStartRow) {
          secondStartRow.value = new Date(response.data.second_time_list[0]);
        }
        
        if (secondEndRow) {
          secondEndRow.value = new Date(response.data.second_time_list[1]);
        }
      }
      
      ElMessage.success('成功加载系统设置');
    } else {
      ElMessage.warning(response.message || '获取系统设置失败');
    }
  } catch (error) {
    console.error('获取系统设置出错:', error);
    ElMessage.error('获取系统设置失败');
  } finally {
    loading.value = false;
  }
}

// 组件挂载时自动获取设置
onMounted(() => {
  fetchTimeSettings();
})

</script>
