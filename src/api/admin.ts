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

// !!!mock版本的获取专业培养方案函数
export function getCurriculum(major_name: string) {
  console.log('Using mock getCurriculum for major:', major_name);

  // 构造不同专业的模拟数据
  let sections = [];

  switch (major_name.toLowerCase()) {
    case '计算机科学与技术':
      sections = [
        {
          section_name: '必修课',
          section_credit: 45,
          course_list: [
            { course_name: '高等数学', credit: 5 },
            { course_name: '线性代数', credit: 3 },
            { course_name: '离散数学', credit: 3 },
            { course_name: '数据结构', credit: 4 },
            { course_name: '计算机组成原理', credit: 4 },
            { course_name: '操作系统', credit: 4 },
            { course_name: '编译原理', credit: 3 },
            { course_name: '计算机网络', credit: 3 }
          ]
        },
        {
          section_name: '选修课',
          section_credit: 15,
          course_list: [
            { course_name: '人工智能', credit: 3 },
            { course_name: '机器学习', credit: 3 },
            { course_name: '并行计算', credit: 2 },
            { course_name: '软件工程', credit: 3 }
          ]
        },
        {
          section_name: '实践课程',
          section_credit: 10,
          course_list: [
            { course_name: '程序设计综合实践', credit: 3 },
            { course_name: '毕业设计', credit: 8 }
          ]
        }
      ];
      break;

    case '软件工程':
      sections = [
        {
          section_name: '必修课',
          section_credit: 40,
          course_list: [
            { course_name: '高等数学', credit: 5 },
            { course_name: '线性代数', credit: 3 },
            { course_name: '软件工程', credit: 4 },
            { course_name: '数据结构', credit: 4 },
            { course_name: 'Java程序设计', credit: 3 },
            { course_name: '数据库系统', credit: 4 }
          ]
        },
        {
          section_name: '选修课',
          section_credit: 20,
          course_list: [
            { course_name: 'Web开发', credit: 3 },
            { course_name: '移动应用开发', credit: 3 },
            { course_name: '软件测试', credit: 2 },
            { course_name: '软件项目管理', credit: 3 },
            { course_name: '需求工程', credit: 2 }
          ]
        }
      ];
      break;

    case '人工智能':
      sections = [
        {
          section_name: '必修课',
          section_credit: 35,
          course_list: [
            { course_name: '高等数学', credit: 5 },
            { course_name: '线性代数', credit: 3 },
            { course_name: '概率论与统计', credit: 3 },
            { course_name: '人工智能基础', credit: 4 },
            { course_name: '机器学习', credit: 4 },
            { course_name: '深度学习', credit: 4 }
          ]
        },
        {
          section_name: '选修课',
          section_credit: 15,
          course_list: [
            { course_name: '自然语言处理', credit: 3 },
            { course_name: '计算机视觉', credit: 3 },
            { course_name: '强化学习', credit: 3 },
            { course_name: '机器人学', credit: 3 }
          ]
        },
        {
          section_name: '实践课程',
          section_credit: 12,
          course_list: [
            { course_name: '人工智能实验', credit: 4 },
            { course_name: '毕业设计', credit: 8 }
          ]
        }
      ];
      break;

    default:
      // 默认返回一些基础课程
      sections = [
        {
          section_name: '必修课',
          section_credit: 20,
          course_list: [
            { course_name: '高等数学', credit: 5 },
            { course_name: '线性代数', credit: 3 },
            { course_name: '大学物理', credit: 4 }
          ]
        },
        {
          section_name: '选修课',
          section_credit: 10,
          course_list: [
            { course_name: '大学英语', credit: 2 },
            { course_name: '创新创业基础', credit: 1 }
          ]
        }
      ];
  }

  return Promise.resolve({
    code: '200',
    message: 'Success',
    data: {
      major_name: major_name,
      sections: sections
    }
  });
}

// !!!mock版本的设置专业培养方案函数
export function setCurriculum(params: CurriculumRequest) {
  console.log('Using mock setCurriculum with data:', JSON.stringify(params, null, 2));

  // 验证必要的参数
  if (!params.major_name) {
    return Promise.resolve({
      code: '400',
      message: '缺少专业名称参数'
    });
  }

  if (!params.sections || params.sections.length === 0) {
    return Promise.resolve({
      code: '400',
      message: '培养方案必须包含至少一个模块'
    });
  }

  // 验证每个模块是否都有名称和课程
  const invalidSections = params.sections.filter(section => !section.section_name);
  if (invalidSections.length > 0) {
    return Promise.resolve({
      code: '400',
      message: '存在未命名的模块'
    });
  }

  // 验证课程学分是否达标
  const invalidCreditSections = params.sections.filter(section => {
    const totalCredit = section.course_list.reduce((sum, course) => sum + Number(course.credit), 0);
    return totalCredit < section.section_credit;
  });

  if (invalidCreditSections.length > 0) {
    const sectionNames = invalidCreditSections.map(s => s.section_name).join(', ');
    return Promise.resolve({
      code: '400',
      message: `以下模块学分未达到要求: ${sectionNames}`
    });
  }

  // 模拟保存成功
  return Promise.resolve({
    code: '200',
    message: `专业 "${params.major_name}" 培养方案设置成功`
  });
}



/*
// 获取专业培养方案
export const getCurriculum = async (major_name: string): Promise<CurriculumResponse> => {
  try {
    const response = await api.get('/manager/get_curriculum', {
      params: { major_name }
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 设置专业培养方案
export const setCurriculum = async (params: CurriculumRequest): Promise<{ code: string; message: string }> => {
  try {
    const response = await api.post('/manager/set_curriculum', params);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

*/

//!!!!!!!!!!!!!! 为了测试admin/ManualChoose.vue 的Mock版本api响应函数
// 添加 mock 版本的 searchCourse 函数
export function searchCourseMock(params) {
  console.log('Using mock searchCourse with params:', params);

  return Promise.resolve({
    code: '200',
    message: 'Success',
    data: {
      course_list: [
        {
          course_id: 1,
          course_name: '高等数学',
          teacher_name: '张三',
          credit: 3,
          class_time: '周一 1-2节',
          classroom: 'A101',
        },
        {
          course_id: 3,
          course_name: '大学物理',
          teacher_name: '王五',
          credit: 4,
          class_time: '周三 5-6节',
          classroom: 'C303',
          available_capacity: 35,
          total_capacity: 50,
          course_description: '大学物理是理工科学生必修的基础课程之一'
        },
        {
          course_id: 4,
          course_name: '数据结构',
          teacher_name: '赵六',
          credit: 3,
          class_time: '周四 1-2节',
          classroom: 'D404',
          available_capacity: 25,
          total_capacity: 40,
          course_description: '数据结构是计算机专业核心课程'
        },
        {
          course_id: 5,
          course_name: '计算机网络',
          teacher_name: '钱七',
          credit: 3,
          class_time: '周一 1-2节',
          classroom: 'E505',
          available_capacity: 30,
          total_capacity: 45,
          course_description: '计算机网络是计算机科学与技术专业的专业基础课'
        }
      ]
    }
  });
}

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
};