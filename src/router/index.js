import { createRouter, createWebHistory } from 'vue-router'
import ChooseCurriculum from '../pages/ChooseCurriculum.vue'
import ShowCurriculum from '../pages/ShowCurriculum.vue'
import SearchCourse from '../pages/SearchCourse.vue'
import ChooseCourse from '../pages/ChooseCourse.vue'
import ShowResult from '../pages/ShowResult.vue'
import ShowResultTeacher from '../pages/ShowResultTeacher.vue'
import Manage from '../pages/Manage.vue'
import ManualChoose from '../pages/ManualChoose.vue'
import SetCurriculum from '../pages/SetCurriculum.vue'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: Home },
        { path: '/login', component: Login },
        { path: '/chooseCurriculum', component: ChooseCurriculum },
        { path: '/showCurriculum', component: ShowCurriculum },
        { path: '/searchCourse', component: SearchCourse },
        { path: '/chooseCourse', component: ChooseCourse },
        { path: '/showResult', component: ShowResult },
        { path: '/showResultTeacher', component: ShowResultTeacher },
        { path: '/manage', component: Manage },
        { path: '/manualChoose', component: ManualChoose },
        { path: '/setCurriculum', component: SetCurriculum },
    ]
})

export default router