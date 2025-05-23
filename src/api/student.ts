import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interfaces (假设这些根据你提供的文件是正确和完整的)
interface courseList {
    course_name: String;
    credit: Number;
}

interface sectionList {
    section_credit: Number;
    section_name: String;
    course_list: Array<courseList>
}

interface majorCurriculumQueryResponse {
    code: String;
    message: String;
    data: {
        major_name: String;
        sections: Array<sectionList>
    }
}

interface personalCurriculumInfo {
    student_id: Number;
    major_name: String;
    sections: Array<sectionList>
}

interface studentCurriculumQueryResponse {
    code: String;
    message: String;
    data: {
        major_name: String;
        sections: Array<sectionList>
    }
}

export interface courseQuery {
    course_name?: String;
    teacher_name?: String;
    course_id?: Number;
    student_id?: Number;
    need_available?: Boolean;
}

export interface detailedCourseInfo {
    course_id: Number; // 对于已选/可选课程，这将是 section_id
    course_name: String;
    course_description?: String; // 根据某些上下文是可选的
    teacher_name: String;
    class_time: String;
    classroom: String;
    available_capacity?: Number; // 在已选课程API示例中不存在，可选
    total_capacity?: Number;   // 在已选课程API示例中不存在，可选
    credit: Number;
}

export interface courseQueryResponse { // searchCourse 和 getStudentSelectedCourses 使用
    code: String;
    message: String;
    data: {
        course_list: Array<detailedCourseInfo>
    }
}

export interface postResponse { // 用于提交、退课等操作
    code: String;
    message: String;
}

interface supplementaryCourseQuery {
    student_id: Number;
    course_id: Number;
}

interface suppResult {
    course_id: Number;
    result: String;
}

interface getSuppResultResponse {
    code: String;
    message: String;
    data: {
        result_list: Array<suppResult>;
    }
}

// 用于提交选课和退课的Payload (结构相同)
export interface StudentCourseActionPayload {
    student_id: Number;
    course_id: Number; // 这是 section_id
}


const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Network error');
    } else {
        console.error('Unexpected Error:', error);
        throw new Error('An unexpected error occurred');
    }
}

export const getMajorCurriculum = async (major_name: String): Promise<majorCurriculumQueryResponse> => {
    try {
        const response = await api.get(`/course_selection/get_curriculum`, { params: { major_name } });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}


export const setPersonalCurriculum = async (params: personalCurriculumInfo): Promise<postResponse> => {
    try {
        const response = await api.post(`/course_selection/student/set_personal_curriculum`, params);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getPersonalCurriculum = async (student_id: Number): Promise<studentCurriculumQueryResponse> => {
    try {
        const response = await api.get(`/course_selection/student/get_personal_curriculum`, { params: { student_id } });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const searchCourse = async (params: courseQuery): Promise<courseQueryResponse> => {
    try {
        const response = await api.get(`/course_selection/search_course`, { params });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

// 学生选课函数 (你之前可能命名不同)
export const submitStudentCourseSelection = async (payload: StudentCourseActionPayload): Promise<postResponse> => {
    try {
        const response = await api.post(`/course_selection/student/choose_course`, payload);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const chooseCourseSupp = async (params: supplementaryCourseQuery): Promise<postResponse> => {
    try {
        const response = await api.post(`/course_selection/student/apply_supplement`, params);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getSuppResult = async (student_id: Number): Promise<getSuppResultResponse> => {
    try {
        const response = await api.get(`/course_selection/student/get_supp_result`, { params: { student_id } });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

// --- 为 ShowResult.vue 新增的函数 ---

/**
 * 学生查看已选课程
 * GET /student/show_selected_courses (带前缀: /course_selection/student/show_selected_courses)
 */
export const getStudentSelectedCourses = async (student_id: Number): Promise<courseQueryResponse> => {
    try {
        const response = await api.get(`/course_selection/student/show_selected_courses`, {
            params: { student_id }
        });
        return response.data; // 假设响应结构与 courseQueryResponse 匹配
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 学生退课
 * POST /student/drop_course (带前缀: /course_selection/student/drop_course)
 */
export const dropStudentCourse = async (payload: StudentCourseActionPayload): Promise<postResponse> => {
    try {
        const response = await api.post(`/course_selection/student/drop_course`, payload);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const studentAPI = {
    getMajorCurriculum,
    setPersonalCurriculum,
    getPersonalCurriculum,
    searchCourse,
    submitStudentCourseSelection, // 假设这是 POST /student/choose_course 的函数
    chooseCourseSupp,
    getSuppResult,
    getStudentSelectedCourses, // <-- 新增
    dropStudentCourse          // <-- 新增
};