<template>
  <div class="top-bar">
    <!-- 左侧Logo/标题 -->
    <div class="left-section">
      <el-icon size="30px" v-if="!is_homepage.get()" @click="goToHome()" class="back-icon"><Back /></el-icon>
      <span class="system-name">{{ pageTitle }}</span>
      <span class="system-subname" v-if="is_homepage.get()">课程选择子系统</span>
    </div>

    <!-- 右侧用户信息 -->
    <div class="right-section">
      <el-dropdown trigger="click" @command="handleCommand">

        <div class="user-info">
          <el-avatar :size="36" :src="userAvatar" />
          <span class="user-name">{{ userName }}</span>
          <el-icon><arrow-down /></el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>

      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { inject, computed } from 'vue'

const router = useRouter()
const is_homepage = inject('is_homepage')
const userName = inject('user_name')
const userAvatar = inject('user_avatar')

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
      console.log('取消退出')
    }
  } else if (command === 'profile') {
    // TODO: 个人中心
  }
}

function goToHome() {
  is_homepage.set(true);
  router.push('/home')
}

const pageTitle = computed(() => {
  if (is_homepage.get()) {
    return '教学服务系统'
  } else {
    // 返回对应页面的标题
    switch (router.currentRoute.value.path) {
      case '/chooseCurriculum':
        return '定制培养方案'
      case '/showCurriculum':
        return '查看培养方案'
      case '/searchCourse':
        return '搜索课程信息'
      case '/chooseCourse':
        return '课程初选'
      case '/showResult':
        return '查看选课结果'
      case '/showResultTeacher':
        return '查看选课结果（教师端）'
      case '/manage':
        return '课程选择管理'
      case '/manualChoose':
        return '手动选择课程'
      case '/setCurriculum':
        return '制订培养方案'
      case '/chooseCourseSupplementary':
        return '课程补选'
      case '/manageSupplementary':
        return '课程补选管理'
    }
  }
})
</script>

<style scoped>
.top-bar {
  height: 60px;
  background-color: #409EFF;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.left-section {
  display: flex;
  align-items: center;
}

.system-name {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-left: 10px;
}

.system-subname {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-left: 20px;
}

.right-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.2s;
}

.user-info:hover {
  background-color: #1370eb;
}

.user-name {
  margin: 0 8px;
  font-size: 15px;
  color: white;
}

.el-icon {
  font-size: 12px;
  color: white;
}

.back-icon {
  cursor: pointer;
  margin-right: 15px;
}

.back-icon:hover {
  opacity: 0.5;
  transition: all 0.2s;
}
</style>