<template>
  <!-- 页面卡片显示区 -->
  <div style="display: flex;flex-wrap: wrap; justify-content: start;">

    <el-button class="cardBox" @click="goToCurriculum()" v-if="!is_admin">
      <div>
        <div style="font-size: 28px;font-weight: bold;">定制培养方案</div>
        <el-divider />
        <el-icon size="150px" color="info"><Edit /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToSearchCourse()" v-if="!is_admin">
      <div>
        <div style="font-size: 28px;font-weight: bold;">搜索课程信息</div>
        <el-divider />
        <el-icon size="150px" color="#409EFF"><Search /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToChooseCourse()" v-if="!is_admin">
      <div>
        <div style="font-size: 28px;font-weight: bold;">选择课程</div>
        <el-divider />
        <el-icon size="150px" color="#67C23A"><Calendar /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToShowResult()" v-if="!is_admin">
      <div>
        <div style="font-size: 28px;font-weight: bold;">查看选课结果</div>
        <el-divider />
        <el-icon size="150px" color="#E6A23C"><Tickets /></el-icon>
      </div>
    </el-button>

    <el-button class="cardBox" @click="goToManage()" v-if="is_admin">
      <div>
        <div style="font-size: 28px;font-weight: bold;">课程选择管理</div>
        <el-divider />
        <el-icon size="150px" color="#F56C6C"><Tools /></el-icon>
      </div>
    </el-button>
    
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';

const is_admin = inject('is_admin');
const router = useRouter();

function goToCurriculum() {
  router.push('/curriculum');
}
function goToSearchCourse() {
  router.push('/searchCourse');
}
function goToChooseCourse() {
  router.push('/chooseCourse');
}
function goToShowResult() {
  router.push('/showResult');
}
function goToManage() {
  router.push('/manage');
}
</script>

<style scoped>
.cardBox {
    height: 300px;
    width: 200px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    text-align: center;
    margin-top: 40px;
    margin-left: 30px;
    margin-right: 13px;
    margin-bottom: 13px;
    padding: 7.5px;
    padding-right: 10px;
    padding-top: 15px;
}
</style>