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

interface courseQuery {
    course_name?: String;
    teacher_name?: String;
    course_id?: Number;
    student_id?: Number; // 可选，如果为空是在searchCourse中调用，表示返回所有课程，否则在chooseCourse中调用，表示只能查看自己专业的课程
    need_available?: Boolean;
}

interface detailedCourseInfo {
    course_id: Number;
    course_name: String;
    course_description: String;
    teacher_name: String;
    class_time: String;
    classroom: String;
    available_capacity: Number;
    total_capacity: Number;
    credit: Number;
}

interface courseQueryResponse {
    code: String;
    message: String;
    data: {
        course_list: Array<detailedCourseInfo>
    }
}

interface postResponse {
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
        const response = await api.get(`/api/get_curriculum`, {
            params: {
                major_name: major_name
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}


export const setPersonalCurriculum = async (params: personalCurriculumInfo): Promise<postResponse> => {
    try {
        const response = await api.post(`/api/student/set_personal_curriculum`, params);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getPersonalCurriculum = async (student_id: Number): Promise<studentCurriculumQueryResponse> => {
    try {
        const response = await api.get(`/api/student/get_personal_curriculum`, {
            params: {
                student_id: student_id
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const searchCourse = async (params: courseQuery): Promise<courseQueryResponse> => {
    try {
        const response = await api.get(`/api/search_course`, {
            params: params
        });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}



export const chooseCourseSupp = async (params: supplementaryCourseQuery): Promise<postResponse> => {
    try {
        const response = await api.post(`/api/student/apply_supplement`, params);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getSuppResult = async (student_id: Number): Promise<getSuppResultResponse> => {
    try {
        const response = await api.get(`/api/student/get_supp_result`, {
            params: {
                student_id: student_id
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const studentAPI = {
    getMajorCurriculum,
    setPersonalCurriculum,
    getPersonalCurriculum,
    searchCourse,
    chooseCourseSupp,
    getSuppResult
}