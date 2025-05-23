import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';

// 从student.ts引入API配置
const API_BASE_URL = 'http://localhost:8080';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 选课状态 (内部使用，不暴露给用户界面)
export const selectionStatus = ref({
  hasPermit: false,
  currentCount: 0,
  maxCount: 0,
  errorMessage: ''
});

// 选课权限错误消息
export const permitError = ref('');

// 自动获取选课权限
export async function acquireSelectionPermit(studentId: number): Promise<boolean> {
  console.log(`[选课权限] 尝试获取学生(${studentId})的选课权限...`);
  try {
    const response = await api.post(`/course_selection/permit/acquire`, {
      student_id: studentId
    });
    
    // 检查是否成功获取选课权限
    if (response.data.code === "200" || response.data.code === 200) {
      // 设置权限状态为成功
      selectionStatus.value.hasPermit = true;
      
      // 如果返回了计数数据，则更新计数
      if (response.data.data) {
        selectionStatus.value.currentCount = response.data.data.current_count || 0;
        selectionStatus.value.maxCount = response.data.data.max_count || 0;
      }
      
      selectionStatus.value.errorMessage = '';
      console.log(`[选课权限] 成功获取权限，当前选课人数: ${selectionStatus.value.currentCount}/${selectionStatus.value.maxCount}`);
      return true;
    } else {
      selectionStatus.value.errorMessage = response.data.message || '无法获取选课权限';
      console.warn(`[选课权限] 无法获取选课权限: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    selectionStatus.value.errorMessage = '网络错误，请稍后再试';
    console.error('[选课权限] 获取选课权限失败:', error);
    return false;
  }
}

// 释放选课权限
export async function releaseSelectionPermit(studentId: number): Promise<void> {
  if (!selectionStatus.value.hasPermit) {
    console.log(`[选课权限] 学生(${studentId})没有持有权限，无需释放`);
    return;
  }
  
  console.log(`[选课权限] 释放学生(${studentId})的选课权限...`);
  try {
    const response = await api.post(`/course_selection/permit/release`, {
      student_id: studentId
    });
    
    if (response.data.code === "200" || response.data.code === 200) {
      selectionStatus.value.hasPermit = false;
      console.log(`[选课权限] 权限释放成功`);
      
      // 更新计数信息
      if (response.data.data) {
        selectionStatus.value.currentCount = response.data.data.current_count || 0;
        selectionStatus.value.maxCount = response.data.data.max_count || 0;
        console.log(`[选课权限] 当前选课人数: ${selectionStatus.value.currentCount}/${selectionStatus.value.maxCount}`);
      }
    } else {
      console.warn(`[选课权限] 释放权限失败: ${response.data.message}`);
    }
  } catch (error) {
    console.error('[选课权限] 释放选课权限失败:', error);
  }
}

// 获取当前选课计数
export async function getSelectionCount(): Promise<void> {
  try {
    const response = await api.get(`/course_selection/permit/count`);
    if (response.data.code === 200) {
      selectionStatus.value.currentCount = response.data.data.current_count;
      selectionStatus.value.maxCount = response.data.data.max_count;
      console.log(`[选课权限] 当前选课人数: ${selectionStatus.value.currentCount}/${selectionStatus.value.maxCount}`);
    }
  } catch (error) {
    console.error('[选课权限] 获取选课计数失败:', error);
  }
}

// 提供给组件使用的钩子函数，自动处理选课权限的获取和释放
export function useSelectionPermit(studentId: number, onPermitFailed?: (errorMsg: string) => void) {
  // 组件挂载时自动获取选课权限
  onMounted(async () => {
    console.log(`[选课权限] 页面加载，准备为学生(${studentId})获取选课权限`);
    const success = await acquireSelectionPermit(studentId);
    
    // 如果获取权限失败且提供了失败回调，则执行回调
    if (!success && onPermitFailed && selectionStatus.value.errorMessage) {
      console.log(`[选课权限] 获取权限失败，执行失败回调`);
      onPermitFailed(selectionStatus.value.errorMessage);
    }
  });
  
  // 组件卸载时自动释放选课权限
  onUnmounted(() => {
    console.log(`[选课权限] 页面卸载，准备释放学生(${studentId})的选课权限`);
    if (selectionStatus.value.hasPermit) {
      releaseSelectionPermit(studentId);
    }
  });
  
  // 添加页面关闭事件监听
  window.addEventListener('beforeunload', () => {
    if (selectionStatus.value.hasPermit) {
      console.log(`[选课权限] 页面关闭，使用beacon释放学生(${studentId})的选课权限`);
      // 发送同步请求以确保在页面关闭前释放权限
      navigator.sendBeacon(`${API_BASE_URL}/course_selection/permit/release?student_id=${studentId}`);
    }
  });
  
  // 返回选课权限状态，供内部使用
  return {
    hasPermit: () => selectionStatus.value.hasPermit,
    getErrorMessage: () => selectionStatus.value.errorMessage
  };
} 