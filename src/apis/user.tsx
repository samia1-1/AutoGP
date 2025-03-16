import { request } from '@/utils';

// 登录
interface LoginData {
  username: string;
  password: string;
}
function loginAPI(loginData: LoginData) {
  return request.post('/user/login', loginData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 邮箱登录
function emailLoginAPI(data) {
  return request.post('/user/loginEmail', data)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 邮箱注册
function registerAPI(registerData) {
  return request.post('/enrollEmail', registerData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
};
// 发送验证码
function getCodeAPI(email) {
  console.log(email);
  
  return request.get('/email/code',{ params: { email } })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 获取个人信息
function getUserInfoAPI() {
  return request.get('/user/get')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 修改密码
function revisePasswordAPI(newPassword: string) {
  return request.post('/revise/password', newPassword)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 修改个人信息
function changeUserInfo(UserInfo) {
  return request.post('/revise/user', UserInfo)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export { registerAPI,getCodeAPI, loginAPI,emailLoginAPI, getUserInfoAPI, revisePasswordAPI, changeUserInfo }

