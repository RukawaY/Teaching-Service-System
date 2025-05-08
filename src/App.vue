<script setup>
import { RouterView } from 'vue-router'
import { ref, provide, onMounted } from 'vue';
import TopBar from './components/TopBar.vue'
import BottomBar from './components/BottomBar.vue'

const user = ref('admin'); // 用户角色，可能的值为'student', 'teacher', 'admin'
const user_name = ref('宋嘉民');
const user_avatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');
const is_homepage = ref(true); // 首页状态，true表示在首页，false表示不在首页
// ref 是Vue 3中用于创建响应式数据的API,它返回一个包含.value属性的对象，
// 该属性用于访问和修改响应式数据的值, get和set方法用于访问和修改值

// 从localStorage读取保存的状态
onMounted(() => {
  const savedHomepage = localStorage.getItem('is_homepage');
  if (savedHomepage !== null) {
    is_homepage.value = savedHomepage === 'true';
  }
});

// 监听is_homepage变化并保存到localStorage
function updateIsHomepage(value) {
  is_homepage.value = value;
  localStorage.setItem('is_homepage', value);
}

provide('user', user);
provide('user_name', user_name);
provide('user_avatar', user_avatar);
provide('is_homepage', { 
  get: () => is_homepage.value,
  set: updateIsHomepage
});

</script>

<template>
  <div>
    <TopBar />
    <!-- 渲染当前路由的组件 -->
    <RouterView style="margin-top: 80px; padding-bottom: 70px;"/>
    <BottomBar />
  </div>
</template>