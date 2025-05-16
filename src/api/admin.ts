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

// 原始函数替换为 mock 版本
export function updateTimeSettings(data) {
  // 返回一个 Promise，模拟成功的 API 响应
  return Promise.resolve({
    code: '200',
    message: 'Success',
    data: data
  });
}

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





// 管理员端API
export const adminAPI = {
    getTimeSettings,
    updateTimeSettings
};