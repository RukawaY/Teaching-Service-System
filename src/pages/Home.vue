<template>
  <!-- 页面卡片显示区 -->
  <div style="display: flex;flex-wrap: wrap; justify-content: start;">
    <!-- 学生的界面 -->
    <el-button class="cardBox" @click="goToChooseCurriculum()" v-if="user == 'student'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">定制培养方案</div>
        <el-divider />
        <el-icon size="150px" color="info"><Edit /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToShowCurriculum()" v-if="user == 'student'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">查看培养方案</div>
        <el-divider />
        <el-icon size="150px" color="black"><InfoFilled /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToSearchCourse()" v-if="user == 'student'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">搜索课程信息</div>
        <el-divider />
        <el-icon size="150px" color="#409EFF"><Search /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToChooseCourse()" v-if="user == 'student'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">选择课程</div>
        <el-divider />
        <el-icon size="150px" color="#67C23A"><Calendar /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToShowResult()" v-if="user == 'student'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">查看选课结果</div>
        <el-divider />
        <el-icon size="150px" color="#E6A23C"><Tickets /></el-icon>
      </div>
    </el-button>

    <!-- 老师的界面 -->
    <el-button class="cardBox" @click="goToShowResultTeacher()" v-if="user == 'teacher'">
      <div>
        <div style="font-size: 26px;font-weight: bold;">查看选课结果<br>（教师端）</div>
        <el-divider />
        <el-icon size="150px" color="#E6A23C"><Tickets /></el-icon>
      </div>
    </el-button>

    <!-- 管理员的界面 -->
    <el-button class="cardBox" @click="goToManage()" v-if="user == 'admin'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">课程选择管理</div>
        <el-divider />
        <el-icon size="150px" color="#F56C6C"><Tools /></el-icon>
      </div>
    </el-button>
    
    <el-button class="cardBox" @click="goToManualChoose()" v-if="user == 'admin'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">手动选择课程</div>
        <el-divider />
        <el-icon size="150px" color="#info"><SetUp /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToSetCurriculum()" v-if="user == 'admin'">
      <div>
        <div style="font-size: 28px;font-weight: bold;">制订培养方案</div>
        <el-divider />
        <el-icon size="150px" color="#409EFF"><List /></el-icon>
      </div>
    </el-button>

  </div>
</template>

<script setup>
// 从Element Plus图标库导入InfoFilled图标组件
import { InfoFilled } from '@element-plus/icons-vue';
// 从Vue中导入inject函数，用于注入由父组件(App.vue)提供的数据
import { inject } from 'vue';
// 导入Vue Router的useRouter组合式API，用于编程式导航
import { useRouter } from 'vue-router';

// 通过inject获取当前用户角色，可能的值为'student', 'teacher', 'admin'
// 用于条件渲染不同角色可见的功能卡片
const user = inject('user');

// 初始化路由器实例，用于页面导航
const router = useRouter();

// 获取首页状态管理对象，包含get()和set()方法
// 用于跟踪用户是否在首页，以控制顶部导航栏的显示逻辑
const is_homepage = inject('is_homepage');

/**
 * 导航到"定制培养方案"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToChooseCurriculum() {
  // 更新首页状态为false，表示用户离开首页
  // 这将触发App.vue中的localStorage持久化
  is_homepage.set(false);
  // 使用router导航到定制培养方案页面
  router.push('/chooseCurriculum');
}

/**
 * 导航到"查看培养方案"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToShowCurriculum() {
  // 更新首页状态为false，表示用户离开首页
  is_homepage.set(false);
  // 使用router导航到查看培养方案页面
  router.push('/showCurriculum');
}

/**
 * 导航到"搜索课程信息"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToSearchCourse() {
  // 更新首页状态为false，表示用户离开首页
  is_homepage.set(false);
  // 使用router导航到搜索课程信息页面
  router.push('/searchCourse');
}

/**
 * 导航到"选择课程"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToChooseCourse() {
  is_homepage.set(false);
  router.push('/chooseCourse');
}

/**
 * 导航到"查看选课结果"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToShowResult() {
  is_homepage.set(false);
  router.push('/showResult');
}

/**
 * 导航到"查看选课结果（教师端）"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToShowResultTeacher() {
  is_homepage.set(false);
  router.push('/showResultTeacher');
}

/**
 * 导航到"课程选择管理"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToManage() {
  is_homepage.set(false);
  router.push('/manage');
}

/**
 * 导航到"手动选择课程"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToManualChoose() {
  is_homepage.set(false);
  router.push('/manualChoose');
}

/**
 * 导航到"制订培养方案"页面
 * 1. 设置非首页状态
 * 2. 执行路由跳转
 */
function goToSetCurriculum() {
  is_homepage.set(false);
  router.push('/setCurriculum');
}
</script>

<style scoped>
.cardBox {
    height: 300px;
    width: 200px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    text-align: center;
    margin-top: 40px;
    margin-left: 40px;
    margin-right: 20px;
    margin-bottom: 20px;
    padding: 7.5px;
    padding-right: 10px;
    padding-top: 15px;
}
</style>