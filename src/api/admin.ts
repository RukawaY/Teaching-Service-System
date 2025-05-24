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

// 定义接口类型
interface TimeSettingsResponse {
  code: string;
  message: string;
  data: {
    max_number: string;
    first_time_list: string[];
    second_time_list: string[];
    drop_time_list: string[];
  };
}

interface UpdateTimeSettingsRequest {
  max_number: number;
  first_time_list: string[];
  second_time_list: string[];
  drop_time_list: string[];
}

interface UpdateTimeSettingsResponse {
  code: string;
  message: string;
}

// 管理员手动选课相关接口类型
interface AdminChooseCourseRequest {
  student_id: number;
  course_id: number;
}

interface AdminChooseCourseResponse {
  code: string;
  message: string;
}

interface StudentCoursesResponse {
  code: string;
  message: string;
  data: {
    student_name: string;
    course_list: Array<{
      course_id: number;
      course_name: string;
      course_description?: string;
      teacher_name: string;
      credit: number;
      class_time: string;
      classroom: string;
      available_capacity?: number;
      total_capacity?: number;
    }>
  }
}

// 补选申请相关接口类型
interface SuppApplication {
  supplement_id: number;
  student_name: string;
  course_name: string;
  result: boolean | null;
}

interface GetSuppApplicationsRequest {
  course_id?: number;
}

interface GetSuppApplicationsResponse {
  code: string;
  message: string;
  supplement_list: SuppApplication[];
}

interface ProcessSuppRequest {
  supplement_id: number;
  result: boolean;
}

interface ProcessSuppResponse {
  code: string;
  message: string;
}

// 培养方案相关接口类型
interface CourseItem {
  course_name: string;
  credit: number;
}

interface CurriculumSection {
  section_name: string;
  section_credit: number;
  course_list: CourseItem[];
}

interface CurriculumRequest {
  major_name: string;
  sections: CurriculumSection[];
}

interface CurriculumResponse {
  code: string;
  message: string;
  data: {
    major_name: string;
    sections: CurriculumSection[];
  }
}

interface CourseTableItem {
  course_id: number;
  course_name: string;
  course_description: string;
  credit: number;
  category: string;
}

interface CourseTableResponse {
  code: string;
  message: string;
  data: {
    course_list: CourseTableItem[];
  };
}



// 课程搜索接口类型
interface SearchCourseRequest {
  course_name?: string;
  teacher_name?: string;
  course_id?: number;
  student_id?: number;
  need_available?: boolean;
}

interface CourseInfo {
  course_id: number;
  course_name: string;
  course_description?: string;
  teacher_name: string;
  credit: number;
  class_time: string;
  classroom: string;
  available_capacity?: number;
  total_capacity?: number;
}

interface SearchCourseResponse {
  code: string;
  message: string;
  data: {
    course_list: CourseInfo[];
  }
}

// 处理错误的通用函数
const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Network error');
  } else {
    console.error('Unexpected Error:', error);
    throw new Error('An unexpected error occurred');
  }
};


// 获取选课系统时间设置
export const getTimeSettings = async (): Promise<TimeSettingsResponse> => {
    try {
        const axiosresponse = await api.get('/course_selection/manager/get_time');
        return axiosresponse.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// 更新选课系统时间设置
export const updateTimeSettings = async (params: UpdateTimeSettingsRequest): Promise<UpdateTimeSettingsResponse> => {
    try {
        const axiosresponse = await api.post('/course_selection/manager/update_time', params);
        return axiosresponse.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// 获取学生已选课程
export const getStudentCourses = async (studentId: number): Promise<StudentCoursesResponse> => {
  try {
    const axiosresponse = await api.get('/course_selection/student/show_selected_courses', {
      params: { student_id: studentId }
    });
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};



// 管理员为学生手动选课
export const adminChooseCourseForStudent = async (params: AdminChooseCourseRequest): Promise<AdminChooseCourseResponse> => {
  try {
    const axiosresponse = await api.post('/course_selection/manager/choose_course', params);
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 补选申请相关接口
export const getSuppApplications = async (params: GetSuppApplicationsRequest): Promise<GetSuppApplicationsResponse> => {
  try {
    const axiosresponse = await api.get('/course_selection/manager/get_supplement', {
      params: params
    });
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 处理补选申请
export const processSupplementary = async (params: ProcessSuppRequest): Promise<ProcessSuppResponse> => {
  try {
    const axiosresponse = await api.post('/course_selection/manager/submit_supplement', params);
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 获取专业培养方案
export const getCurriculum = async (major_name: string): Promise<CurriculumResponse> => {
  try {
    const axiosresponse = await api.get('/course_selection/get_curriculum', {
      params: { major_name }
    });
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 设置专业培养方案
export const setCurriculum = async (params: CurriculumRequest): Promise<{ code: string; message: string }> => {
  try {
    const axiosresponse = await api.post('/course_selection/manager/set_curriculum', params);
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 课程搜索API实现
export const searchCourse = async (params: SearchCourseRequest): Promise<SearchCourseResponse> => {
  try {
    const axiosresponse = await api.get('/course_selection/search_course', { params });
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getCourseTable = async (params: { course_id: number ,course_name: string ,category: string }): Promise<CourseTableResponse> => {
  try {
    const axiosresponse = await api.get(`/course_selection/search_course_table`, {
      params
    });
    return axiosresponse.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 管理员端API
export const adminAPI = {
  getTimeSettings,
  updateTimeSettings,
  getStudentCourses,
  adminChooseCourseForStudent,
  getSuppApplications,
  processSupplementary,
  getCurriculum,
  setCurriculum,
  getCourseTable,
  searchCourse,
};