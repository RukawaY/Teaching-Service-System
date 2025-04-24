<script setup>
import { RouterView } from 'vue-router'
import { ref, provide } from 'vue';
import TopBar from './components/TopBar.vue'

const user = ref('student');
const user_name = ref('用户名');
const user_avatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');
const is_homepage = ref(true);

provide('user', user);
provide('user_name', user_name);
provide('user_avatar', user_avatar);
provide('is_homepage', is_homepage);

</script>

<template>
  <TopBar />
  <!-- 渲染当前路由的组件 -->
  <RouterView style="margin-top: 80px;"/>
</template>

<style scoped>
</style>