# Teaching-Service-System
Project for 2025 Software Engineering Basis

# Structure

```bash
./
├── public/          # 静态资源
├── src/
│   ├── api/         # API接口
│   ├── assets/      # 图片/样式
│   ├── components/  # 组件
│   ├── pages/       # 页面
│   │   ├── admin/   # 管理员页面
│   │   ├── teacher/ # 教师页面
│   │   └── student/ # 学生页面
│   ├── router/      # 路由配置
│   ├── App.vue      # 根组件
│   └── main.js      # 入口文件
├── vite.config.js   # Vite 配置
└── package.json
```

# How to run?

First switch to the root directory.

## Install Dependencies

```bash
npm install
```

## Run

```bash
npm run dev
```

# Element Plus Website

https://element-plus.org/zh-CN/component/overview.html

**注：如果要区分管理员、教师、学生，在./src/App.vue中修改user的值为admin、teacher、student**