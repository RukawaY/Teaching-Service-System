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
            teacher_name: string;
            credit: number;
            class_time: string;
            classroom: string;
        }>
    }
}

// 补选申请相关接口类型
interface SuppApplication {
    supplement_id: number;
    student_id: number;
    student_name: string;
    course_id: number;
    course_name: string;
    result: boolean | null;
}

interface GetSuppApplicationsRequest {
    course_id?: number;
}

interface GetSuppApplicationsResponse {
    code: string;
    message: string;
    data: {
        supplement_list: SuppApplication[];
    }
}

interface ProcessSuppRequest {
    supplement_id: number;
    result: boolean;
}

interface ProcessSuppResponse {
    code: string;
    message: string;
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

/*
// 获取选课系统时间设置
export const getTimeSettings = async (): Promise<TimeSettingsResponse> => {
    try {
        const response = await api.get('/api/manager/get_time');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// 更新选课系统时间设置
export const updateTimeSettings = async (params: UpdateTimeSettingsRequest): Promise<UpdateTimeSettingsResponse> => {
    try {
        const response = await api.post('/api/manager/update_time', params);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

*/

// !!原始函数替换为 mock 版本
export function updateTimeSettings(data) {
  // 返回一个 Promise，模拟成功的 API 响应
  return Promise.resolve({
    code: '200',
    message: 'Success',
    data: data
  });
}

// !!!以下是 mock 版本的 getTimeSettings 函数
export function getTimeSettings() {
  // 返回模拟的时间设置数据
  return Promise.resolve({
    code: '200',
    message: 'Success',
    data: {
      max_number: 150,
      first_time_list: [
        new Date('2025-05-01 08:00:00').toISOString(),
        new Date('2025-05-07 23:59:59').toISOString()
      ],
      second_time_list: [
        new Date('2025-05-10 08:00:00').toISOString(),
        new Date('2025-05-15 23:59:59').toISOString()
      ],
      drop_time_list: []
    }
  });
}

// !!!以下是 mock 版本的 getStudentCourses 函数
export function getStudentCourses(studentId) {
  console.log('Using mock getStudentCourses for student ID:', studentId);
  
  // 返回固定的成功响应，使用图片中的课程数据
  return Promise.resolve({
    code: '200',
    message: 'Success',
    data: {
      student_name: `学生${studentId}`,
      course_list: [
        {
          course_id: 2,
          course_name: '线性代数',
          teacher_name: '李四',
          credit: 2,
          class_time: '周二 3-4节',
          classroom: 'B202',
        }
      ]
    }
  });
}

// !!!!!!!以下是 mock 版本的 adminChooseCourseForStudent 函数
export function adminChooseCourseForStudent(params) {
  console.log('Using mock adminChooseCourseForStudent with params:', params);
  
  // 始终返回成功响应
  return Promise.resolve({
    code: '200',
    message: '选课成功'
  });
}

// !!!mock版本的获取补选申请列表函数
export function getSuppApplications(params) {
  console.log('Using mock getSuppApplications with params:', params);
  
  // 构造模拟数据
  const mockApplications = [
    {
      supplement_id: 1,
      student_id: 1001,
      student_name: '张三',
      course_id: 101,
      course_name: '高等数学',
      result: null
    },
    {
      supplement_id: 2,
      student_id: 1002,
      student_name: '李四',
      course_id: 102,
      course_name: '线性代数',
      result: true
    },
    {
      supplement_id: 3,
      student_id: 1003,
      student_name: '王五',
      course_id: 103,
      course_name: '计算机网络',
      result: false
    },
    {
      supplement_id: 4,
      student_id: 1001,
      student_name: '张三',
      course_id: 104,
      course_name: '数据结构',
      result: null
    }
  ];
  
  // 过滤数据（根据nage course_id）
  let filteredApplications = mockApplications;
  
  if (params && params.course_id) {
    filteredApplications = filteredApplications.filter(app => app.course_id === params.course_id);
  }
  
  return Promise.resolve({
    code: '200',
    message: 'Success',
    data: {
      supplement_list: filteredApplications
    }
  });
}

// !!!mock版本的处理补选申请函数
export function processSupplementary(params) {
  console.log('Using mock processSupplementary with params:', params);
  
  // 始终返回成功响应
  return Promise.resolve({
    code: '200',
    message: '处理成功'
  });
}

// 管理员端API
export const adminAPI = {
    getTimeSettings,
    updateTimeSettings,
    getStudentCourses,
    adminChooseCourseForStudent,
    getSuppApplications,
    processSupplementary
};