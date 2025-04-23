<script setup>
import { RouterView } from 'vue-router'
import { ref, provide } from 'vue';
import TopBar from './components/TopBar.vue'

const is_admin = ref(false);
const user_name = ref('用户名');
const user_avatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');

provide('is_admin', is_admin);
provide('user_name', user_name);
provide('user_avatar', user_avatar);
</script>

<template>
  <TopBar />
  <!-- 渲染当前路由的组件 -->
  <RouterView style="margin-top: 60px;"/>
</template>

<style scoped>
</style>