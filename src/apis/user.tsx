import { request } from '@/utils';

// 创建API请求函数的工厂
const createAPI = (url: string, method: 'get' | 'post' = 'post') => {
  return (data?: any) => {
    const config = {
      url,
      method,
      headers: { 
        'Content-Type': 'application/json',
        // 添加标志，表示请求已加密
        'x-encrypted-request': 'true' 
      }
    };
    
    // GET请求处理参数
    if (method === 'get' && data) {
      return request({ ...config, params: data });
    }
    
    // POST请求处理数据
    // 注意: 数据会自动由request拦截器加密
    return request({ ...config, data });
  };
};

// 用户相关API
const userAPI = {
  // 登录相关
  login: createAPI('/user/login'),
  emailLogin: createAPI('/user/loginEmail'),
  register: createAPI('/enrollEmail'),
  getCode: createAPI('/email/code', 'get'),
  
  // 用户信息相关
  getUserInfo: createAPI('/user/get', 'get'),
  revisePassword: createAPI('/revise/password'),
  changeUserInfo: createAPI('/revise/user')
};

// 为了保持向后兼容，导出原有函数
export const loginAPI = userAPI.login;
export const emailLoginAPI = userAPI.emailLogin;
export const registerAPI = userAPI.register;
export const getCodeAPI = userAPI.getCode;
export const getUserInfoAPI = userAPI.getUserInfo;
export const revisePasswordAPI = userAPI.revisePassword;
export const changeUserInfo = userAPI.changeUserInfo;

// 导出统一的API对象
export default userAPI;

