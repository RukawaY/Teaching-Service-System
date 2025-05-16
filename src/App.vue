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
/**
 * 从本地存储(localStorage)中获取'is_homepage'的值来确定当前是否为首页
 * localStorage是浏览器提供的Web Storage API的一部分，允许在浏览器中存储键值对数据
 * 与sessionStorage不同，localStorage中的数据没有过期时间，会一直保存在浏览器中
 * 直到被明确删除（如通过removeItem()、clear()方法或用户清除浏览器数据）
 */
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

/**
 * 向后代组件提供关键数据和功能：
 * - `user`：当前用户对象，表示用户角色
 * - `user_name`：当前用户的姓名
 * - `user_avatar`：当前用户的头像
 * - `is_homepage`：一个带有get和set方法的对象
 *   - `get`：返回is_homepage的当前值
 *   - `set`：通过updateIsHomepage函数更新is_homepage的值
 * 
 * 这些提供的值可以在任何子组件中注入。
 */
provide('user', user);
provide('user_name', user_name);
provide('user_avatar', user_avatar);
provide('is_homepage', { 
  get: () => is_homepage.value,
  set: updateIsHomepage
});  //

/*
`provide` 是 Vue 3 组合式 API 的一部分，用于在父组件中向任意深度的后代组件提供数据，而不必通过每层组件手动传递 props。它和 `inject` 配合使用，形成了一种依赖注入机制。

## 基本语法

```javascript
provide(key, value)
```

- `key`: 注入的标识符，可以是字符串或者 Symbol
- `value`: 要提供的数据，可以是任何类型的值（包括响应式数据）

## 在您的代码中

```javascript
provide('user', user);
provide('user_name', user_name);
provide('user_avatar', user_avatar);
provide('is_homepage', { 
  get: () => is_homepage.value,
  set: updateIsHomepage
});
```

这里您提供了四个值:

1. `'user'`: 用户角色信息，是一个响应式引用 (ref)
2. `'user_name'`: 用户名称，同样是响应式引用
3. `'user_avatar'`: 用户头像URL，响应式引用
4. `'is_homepage'`: 一个包含 getter 和 setter 的对象，这种方式可以让后代组件:
   - 通过 `get()` 读取首页状态
   - 通过 `set()` 修改首页状态，并触发 `updateIsHomepage` 函数保存到 localStorage

## 在后代组件中使用

在任何后代组件中，都可以使用 `inject` 来获取这些值:

```javascript
import { inject } from 'vue';

// 获取提供的值
const user = inject('user');
const userName = inject('user_name');
const userAvatar = inject('user_avatar');
const isHomepage = inject('is_homepage');

// 使用 isHomepage 对象
console.log(isHomepage.get()); // 获取首页状态
isHomepage.set(false); // 设置首页状态为 false
```

`provide/inject` 模式让您可以在组件树中灵活地管理共享状态，避免了传统的 "prop 逐级透传" 问题。
*/

</script>

<template>
  <div>
    <TopBar />
    <!-- 渲染当前路由的组件 -->
    <RouterView style="margin-top: 80px; padding-bottom: 70px;"/>
    <BottomBar />
  </div>
</template>