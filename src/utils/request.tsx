// 封装axios
import axios from "axios";
import { getToken } from "./token";
import { message } from "antd";


// 配置根域名、超时时间
const request = axios.create({
  baseURL: 'http://218.199.69.63:39600',
  // baseURL:"/api",
  timeout: 0
})
// 请求拦截器
request.interceptors.request.use((config) => {
  const token = getToken()

  const isAuthRequest = config.url.includes('/login') || config.url.includes('/enroll')|| config.url.includes('/email');  // 判断是否为登录或注册接口
  if (!isAuthRequest && !token) {
    // 如果不是登录或注册接口且没有 token，取消请求
    return Promise.reject(new Error('No token, request is blocked.'));
  }

  if (token) {
    config.headers.token = `${token}`
  }
  return config
}, (error) => {
  console.log(error);
  
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use((response) => {
  return response
}, (error) => {
  console.log("响应",error);
  
  if(error.response.status===404) return;
  message.error("Network connection error, please check the network and try again!")
  return Promise.reject(error)
})

export { request }

