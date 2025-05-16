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
        <!-- 
          按钮组件：用于切换行的编辑状态
          type="primary" 设置为主要样式(蓝色)
          @click 事件处理器：切换当前行的isEditing状态
          按钮文本根据编辑状态动态显示"保存"或"编辑"
        -->
        <el-button type="primary" size="medium" @click="scope.row.isEditing = !scope.row.isEditing">
          {{ scope.row.isEditing ? '保存' : '编辑' }}
        </el-button>
      </template>
    </el-table-column>
    
  </el-table>
</template>

<script setup>
// 从Vue导入ref函数，用于创建响应式数据
import { ref } from 'vue'

/**
 * 格式化时间函数
 * @param {Date} time - 需要格式化的日期对象
 * @return {String} 格式化后的时间字符串
 * 使用toLocaleString方法将日期转换为中国标准格式，不使用12小时制
 */
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
 */
const tableData = ref([
  { name: '控制在线选课人数', value: 100, isEditing: false },
  { name: '初选开始时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },
  { name: '初选结束时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },
  { name: '补选开始时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },
  { name: '补选结束时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },

])

/**
 * El-Table 组件基本语法和用法说明:
 * 
 * 1. 基本结构:
 *    - el-table: 表格容器组件
 *    - el-table-column: 定义表格的每一列
 * 
 * 2. 重要属性:
 *    - :data - 绑定表格数据源，必须是数组
 *    - stripe - 是否显示斑马纹表格
 *    - border - 是否显示边框
 *    - height/max-height - 设置表格高度，可固定表头
 * 
 * 3. el-table-column 属性:
 *    - prop - 对应列内容的字段名
 *    - label - 列标题
 *    - width - 列宽度
 *    - fixed - 固定列(true/'left'/'right')
 *    - sortable - 是否可排序
 * 
 * 4. 自定义列内容:
 *    - 通过 template #default="scope" 自定义单元格内容
 *    - scope.row 获取当前行数据
 *    - scope.$index 获取当前行索引
 * 
 * 5. 表格事件:
 *    - @selection-change - 多选时选择项变化触发
 *    - @row-click - 行点击事件
 *    - @sort-change - 排序变化事件
 * 
 * 6. 表格功能:
 *    - 排序: 添加 sortable 属性
 *    - 筛选: 添加 filters 和 filter-method
 *    - 多选: 添加 type="selection" 的列
 */
</script>
