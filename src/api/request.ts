import axios from 'axios';
import { message } from 'antd';

const TOKEN_KEY = 'sourcesignal_token';
const REFRESH_TOKEN_KEY = 'sourcesignal_refresh_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 请求拦截器：附加 token
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => {
    const data = response.data;
    // 如果后端返回 { code, message, data } 结构
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200 || data.code === 0) {
        return data.data;
      }
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        clearTokens();
        message.error('登录已过期，请重新登录');
        window.location.href = '/login';
      } else if (status === 403) {
        message.error('没有权限执行此操作');
      } else {
        const msg = data?.message || data?.error || `请求失败 (${status})`;
        message.error(msg);
      }
    } else if (error.request) {
      message.error('网络异常，请检查连接');
    } else {
      message.error(error.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default request;
