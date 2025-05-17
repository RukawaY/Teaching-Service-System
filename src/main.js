// 导入Vue核心功能，createApp用于创建Vue应用实例
import { createApp } from 'vue'
// 导入Pinia状态管理库，用于集中管理应用状态
import { createPinia } from 'pinia'
// 导入全局CSS样式
import './assets/main.css'
// 导入axios HTTP客户端，用于发送网络请求
import axios from 'axios'
// 导入Element Plus UI组件库
import ElementPlus from 'element-plus'
// 导入根组件App
import App from './App.vue'
// 导入路由配置
import router from './router'
// 导入Element Plus的CSS样式
import 'element-plus/dist/index.css'
// 导入Element Plus的所有图标组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建Vue应用实例
const app = createApp(App)
// 创建Pinia实例用于状态管理
const pinia = createPinia()

// 全局注册所有Element Plus图标组件
// 通过循环遍历ElementPlusIconsVue对象中的所有图标组件并注册到Vue应用中
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 将Pinia状态管理插件安装到Vue应用中
app.use(pinia)
// 安装路由插件，启用页面导航功能
app.use(router)
// 安装Element Plus组件库
app.use(ElementPlus)
// 将Vue应用挂载到DOM中id为'app'的元素上，正式启动应用
app.mount('#app')
