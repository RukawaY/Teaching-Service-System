import { createRouter, createWebHistory } from 'vue-router'
import ChooseCurriculum from '../pages/student/ChooseCurriculum.vue'
import ShowCurriculum from '../pages/student/ShowCurriculum.vue'
import SearchCourse from '../pages/student/SearchCourse.vue'
import ChooseCourse from '../pages/student/ChooseCourse.vue'
import ChooseCourseSupp from '../pages/student/ChooseCourseSupp.vue'
import ShowResult from '../pages/student/ShowResult.vue'
import ShowResultTeacher from '../pages/teacher/ShowResultTeacher.vue'
import Manage from '../pages/admin/Manage.vue'
import ManualChoose from '../pages/admin/ManualChoose.vue'
import SetCurriculum from '../pages/admin/SetCurriculum.vue'
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
        { path: '/chooseCourseSupplementary', component: ChooseCourseSupp },
        { path: '/showResult', component: ShowResult },
        { path: '/showResultTeacher', component: ShowResultTeacher },
        { path: '/manage', component: Manage },
        { path: '/manualChoose', component: ManualChoose },
        { path: '/setCurriculum', component: SetCurriculum },
    ]
})

export default router