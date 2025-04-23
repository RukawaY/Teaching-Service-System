import { createRouter, createWebHistory } from 'vue-router'
import Curriculum from '../pages/Curriculum.vue'
import SearchCourse from '../pages/SearchCourse.vue'
import ChooseCourse from '../pages/ChooseCourse.vue'
import ShowResult from '../pages/ShowResult.vue'
import Manage from '../pages/Manage.vue'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: Home },
        { path: '/login', component: Login },
        { path: '/curriculum', component: Curriculum },
        { path: '/searchCourse', component: SearchCourse },
        { path: '/chooseCourse', component: ChooseCourse },
        { path: '/showResult', component: ShowResult },
        { path: '/manage', component: Manage },
    ]
})

export default router