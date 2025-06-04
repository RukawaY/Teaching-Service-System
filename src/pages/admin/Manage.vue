<template>
  <div class="container">
  <el-card class="settings-card">
    <template #header>
      <div class="card-header">
        <h2>系统参数设置</h2>
      </div>
    </template>

    <el-table :data="tableData" stripe style="width: 100%;">

      <el-table-column prop="name" label="操作名称" width="200">
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
          <el-date-picker v-model="scope.row.value" type="datetime" placeholder="选择日期与时间"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ" 
            style="width: 100%;"
            v-if="scope.row.isEditing && scope.row.type === 'datetime'" />
          <!-- 
            条件渲染：当行处于编辑状态且是"控制在线选课人数"行时显示输入框
            size="medium" 设置输入框大小为中等
          -->
          <el-input v-model.number="scope.row.value" type="number" v-if="scope.row.isEditing && scope.row.type === 'number'" size="medium" style="width: 100%;" />
          <!-- 
            条件渲染：当行不处于编辑状态时显示格式化后的值
            调用timeFormat函数格式化日期时间
          -->
          <span v-if="!scope.row.isEditing" style="font-size: 16px;">
            {{ scope.row.type === 'datetime' && scope.row.value && scope.row.value !== '未设置' ? timeFormat(scope.row.value) : scope.row.value }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="modify" label="修改操作" width="120" align="center">
        <template #default="scope">
          <el-button type="primary" size="medium" @click="handleRowAction(scope.row)">
            {{ scope.row.isEditing ? '提交' : '编辑' }}
          </el-button>
        </template>
      </el-table-column>

    </el-table>
  </el-card>
</div>
</template>

<script setup>
// 从Vue导入ref函数，用于创建响应式数据
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTimeSettings, updateTimeSettings } from '../../api/admin'

// 添加加载状态
const loading = ref(false)


function timeFormat(timeString) {
  if (!timeString || timeString === '未设置') return '未设置';
  // 尝试将传入的 timeString 转换为 Date 对象
  const date = new Date(timeString);
  // 检查转换后的 Date 对象是否有效
  if (isNaN(date.getTime())) {
    return '无效日期'; // 如果日期无效，则返回提示
  }
  // 如果日期有效，则格式化输出
  return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

/**
 * 表格数据定义
 * ref创建响应式数据，包含表格中显示的所有行
 * 每行包含：
 * - name: 操作名称
 * - value: 操作值(可以是数字或日期字符串)
 * - isEditing: 标记当前行是否处于编辑状态，初始为false
 * - key: API数据映射键
 * - type: 'number' 或 'datetime' 用于区分值的类型和渲染对应的输入控件
 */
const tableData = ref([
  { name: '控制在线选课人数', value: 0, isEditing: false, key: 'max_number', type: 'number' },
  { name: '初选开始时间', value: '未设置', isEditing: false, key: 'first_start', type: 'datetime' },
  { name: '初选结束时间', value: '未设置', isEditing: false, key: 'first_end', type: 'datetime' },
  { name: '补选开始时间', value: '未设置', isEditing: false, key: 'second_start', type: 'datetime' },
  { name: '补选结束时间', value: '未设置', isEditing: false, key: 'second_end', type: 'datetime' },
  { name: '退选开始时间', value: '未设置', isEditing: false, key: 'drop_start', type: 'datetime' },
  { name: '退选结束时间', value: '未设置', isEditing: false, key: 'drop_end', type: 'datetime' },
])

/**
 * 行动作处理函数
 * 当点击编辑/保存按钮时处理行数据的变更
 * @param {Object} row 当前操作的行数据
 */
const handleRowAction = async (row) => {
  if (row.isEditing) { // 点击保存时
    // 从 tableData 中获取所有当前的设置值
    const maxNumberRow = tableData.value.find(r => r.key === 'max_number');
    const firstStartRow = tableData.value.find(r => r.key === 'first_start');
    const firstEndRow = tableData.value.find(r => r.key === 'first_end');
    const secondStartRow = tableData.value.find(r => r.key === 'second_start');
    const secondEndRow = tableData.value.find(r => r.key === 'second_end');
    const dropStartRow = tableData.value.find(r => r.key === 'drop_start');
    const dropEndRow = tableData.value.find(r => r.key === 'drop_end');

    // Helper to convert to Date object, returns null if invalid or "未设置"
    const toValidDate = (valueStr) => {
        if (!valueStr || valueStr === '未设置') return null;
        const d = new Date(valueStr);
        return isNaN(d.getTime()) ? null : d;
    };
    
    const firstStart = toValidDate(firstStartRow?.value);
    const firstEnd = toValidDate(firstEndRow?.value);
    const secondStart = toValidDate(secondStartRow?.value);
    const secondEnd = toValidDate(secondEndRow?.value);
    const dropStart = toValidDate(dropStartRow?.value);
    const dropEnd = toValidDate(dropEndRow?.value);

    // 时间验证
    if (firstStart && firstEnd && firstStart > firstEnd) {
      ElMessage.error('初选开始时间不能晚于初选结束时间');
      return;
    }
    if (secondStart && secondEnd && secondStart > secondEnd) {
      ElMessage.error('补选开始时间不能晚于补选结束时间');
      return;
    }
    if (dropStart && dropEnd && dropStart > dropEnd) {
      ElMessage.error('退选开始时间不能晚于退选结束时间');
      return;
    }

    // 准备API请求数据
    const requestData = {
      max_number: Number(maxNumberRow?.value) || 0,
      first_time_list: firstStart && firstEnd ? [firstStart.toISOString(), firstEnd.toISOString()] : [],
      second_time_list: secondStart && secondEnd ? [secondStart.toISOString(), secondEnd.toISOString()] : [],
      drop_time_list: dropStart && dropEnd ? [dropStart.toISOString(), dropEnd.toISOString()] : []
    };
    
    // 如果某时间段只有一个时间被设置，则提示用户
    if ((firstStart && !firstEnd) || (!firstStart && firstEnd)) {
        ElMessage.warning('初选时间段的开始和结束时间必须同时设置，或同时不设置。');
        if (row.key === 'first_start' || row.key === 'first_end') return; // 保持当前编辑行的状态
    }
    if ((secondStart && !secondEnd) || (!secondStart && secondEnd)) {
        ElMessage.warning('补选时间段的开始和结束时间必须同时设置，或同时不设置。');
        if (row.key === 'second_start' || row.key === 'second_end') return;
    }
    if ((dropStart && !dropEnd) || (!dropStart && dropEnd)) {
        ElMessage.warning('退选时间段的开始和结束时间必须同时设置，或同时不设置。');
         if (row.key === 'drop_start' || row.key === 'drop_end') return;
    }


    try {
      loading.value = true;
      const response = await updateTimeSettings(requestData);
      if (response.code === '200' || response.code === 200) {
        ElMessage.success(`系统设置已成功更新`);
        // 更新成功后，同步一次本地数据状态
        await fetchTimeSettings(); // 重新获取并设置所有行的编辑状态为false
      } else {
        ElMessage.error(response.message || '更新失败');
        return; // 失败则保持编辑状态,不执行后续的isEditing切换
      }
    } catch (error) {
      ElMessage.error('保存设置失败: ' + (error.message || ''));
      return; // 异常则保持编辑状态,不执行后续的isEditing切换
    } finally {
      loading.value = false;
    }
  } else { // Corresponds to initial state where row.isEditing was false (i.e., "Edit" button was clicked)
    // Switch to editing mode for the current row
    row.isEditing = true;
  }
};

// 辅助函数，用于确定之前的保存操作是否成功，避免重复切换 isEditing
// 实际上，由于 fetchTimeSettings 的存在，这个可能不需要了
// const updateTimeSettingsSuccessful = async () => { /* ... */ };


/**
 * 获取系统时间设置
 * 页面加载时从服务器获取当前设置
 */
const fetchTimeSettings = async () => {
  try {
    loading.value = true;
    const response = await getTimeSettings();

    if (response.code === '200' || response.code === 200) {
      const data = response.data;
      tableData.value.forEach(row => {
        row.isEditing = false; // 重置编辑状态
        if (row.key === 'max_number') {
          row.value = Number(data.max_number) || 0;
        } else if (row.key === 'first_start' && data.first_time_list?.length) {
          row.value = data.first_time_list[0];
        } else if (row.key === 'first_end' && data.first_time_list?.length > 1) {
          row.value = data.first_time_list[1];
        } else if (row.key === 'second_start' && data.second_time_list?.length) {
          row.value = data.second_time_list[0];
        } else if (row.key === 'second_end' && data.second_time_list?.length > 1) {
          row.value = data.second_time_list[1];
        } else if (row.key === 'drop_start' && data.drop_time_list?.length) {
          row.value = data.drop_time_list[0];
        } else if (row.key === 'drop_end' && data.drop_time_list?.length > 1) {
          row.value = data.drop_time_list[1];
        } else if (row.type === 'datetime') { // 如果API没有返回对应时间，设为'未设置'
            row.value = '未设置';
        }
      });
    } else {
      ElMessage.warning(response.message || '获取系统设置失败');
    }
  } catch (error) {
    ElMessage.error('获取系统设置失败: ' + (error.message || ''));
  } finally {
    loading.value = false;
  }
}

// 组件挂载时自动获取设置
onMounted(() => {
  fetchTimeSettings();
})

</script>

<style scoped>
.settings-card {
  margin: 20px;
}
.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}
/*确保element-plus的日期选择器在表格中能正常显示宽度*/
.el-table .el-date-editor.el-input, .el-table .el-date-editor.el-input__inner {
  width: 100%;
}

.container {
  margin: 0 auto;
  width: 80%;
}
</style>
