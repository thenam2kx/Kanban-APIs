import axios from 'axios';

// Tạo instance của Axios với cấu hình mặc định
const api = axios.create({
  baseURL: process.env.API_URL || 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = process.env.API_TOKEN || 'your-token-here';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ghi log yêu cầu
    console.log(
      `Sending ${config.method.toUpperCase()} request to ${config.url}`,
    );
    return config;
  },
  (error) => {
    // Xử lý lỗi khi gửi yêu cầu
    console.error('Request error:', error.message);
    return Promise.reject(error);
  },
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => {
    // Xử lý phản hồi thành công
    console.log(`Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  async (error) => {
    // Xử lý lỗi phản hồi
    if (error.response) {
      // Lỗi từ server (4xx, 5xx)
      console.error(
        `Error ${error.response.status}: ${error.response.data.message || 'Server error'}`,
      );

      // Ví dụ: Retry nếu nhận mã lỗi 429 (Too Many Requests)
      if (
        error.response.status === 429 &&
        error.config &&
        !error.config.__isRetry
      ) {
        error.config.__isRetry = true;
        console.log('Retrying request due to 429 error...');
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Chờ 1 giây
        return api.request(error.config); // Thử lại yêu cầu
      }
    } else if (error.request) {
      // Không nhận được phản hồi
      console.error('No response received:', error.request);
    } else {
      // Lỗi khác
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  },
);

// Hàm gọi API ví dụ
async function getData(endpoint) {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { api, getData };
