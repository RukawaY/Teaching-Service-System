<template>
  <el-table :data="tableData" stripe style="width: 100%; margin-left: 20px;">
    <el-table-column prop="name" label="操作名称">
      <template #default="scope">
        <span style="font-size: 16px;">{{ scope.row.name }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="value" label="操作值">
      <template #default="scope">
        <el-date-picker
          v-model="scope.row.value"
          type="datetime"
          placeholder="选择日期与时间"
          v-if="scope.row.isEditing && scope.row.name != '控制在线选课人数'"
        />
        <el-input v-model="scope.row.value" v-if="scope.row.isEditing && scope.row.name === '控制在线选课人数'" size="medium" />
        <span v-if="!scope.row.isEditing" style="font-size: 16px;">{{ timeFormat(scope.row.value) }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="modify" label="修改操作">
      <template #default="scope">
        <el-button type="primary" size="medium" @click="scope.row.isEditing = !scope.row.isEditing">
          {{ scope.row.isEditing ? '保存' : '编辑' }}
        </el-button>
      </template>
    </el-table-column>
    
  </el-table>
</template>

<script setup>
import { ref } from 'vue'

function timeFormat(time) {
  return time.toLocaleString('zh-CN', { hour12: false })
}

const tableData = ref([
  { name: '控制在线选课人数', value: 100, isEditing: false },
  { name: '初选开始时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },
  { name: '初选结束时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },
  { name: '补选开始时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },
  { name: '补选结束时间', value: new Date('2025-04-24 10:00:00'), isEditing: false },
  
])

</script>
