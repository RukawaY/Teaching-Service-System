import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 你的后端API基础URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器 (可以根据需要添加，例如认证token)
api.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem('teacherToken'); // 示例
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response.data; // 通常我们直接返回 response.data 供组件使用
    },
    (error) => {
        // 全局错误处理
        console.error('API Error:', error.response?.data || error.message);
        // 可以抛出错误或返回一个特定结构的错误对象
        return Promise.reject(error.response?.data || { message: error.message });
    }
);

// --- 接口定义 ---

export interface StudentInfo {
    ID: string;
    name: string;
}

export interface TeacherCourseStudentInfo {
    course_name: string;
    course_time: string;
    course_classroom: string;
    student_list: StudentInfo[] | StudentInfo; // API文档示例显示对象，但通常应为数组
}

export interface GetTeacherCourseResultResponse {
    code: string;
    message: string;
    data: {
        course_list: TeacherCourseStudentInfo[];
    };
}

// --- API 函数 ---

/**
 * 教师获得选课学生信息
 * GET /teacher/getresult
 * @param teacher_id 教师ID
 */
export const getTeacherCourseResults = async (teacher_id: number): Promise<GetTeacherCourseResultResponse> => {
    try {
        // 使用已确认的完整路径
        const responseData = await api.get<GetTeacherCourseResultResponse>('/course_selection/teacher/getresult', {
            params: {
                teacher_id,
            },
        });
        return responseData;
    } catch (error) {
        throw error;
    }
};

export const teacherAPI = {
    getTeacherCourseResults,
};