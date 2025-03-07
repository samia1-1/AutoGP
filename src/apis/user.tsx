import { request } from '@/utils';

// 登录 - 修改以确保正确的Content-Type和数据格式
interface LoginData {
  username: string;
  password: string;
}

function loginAPI(loginData: LoginData) {
  return request({
    url: '/user/login',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: loginData // 直接传对象，axios会自动转JSON
  });
}

// 邮箱登录
function emailLoginAPI(data) {
  return request({
    url: '/user/loginEmail',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  });
}

// 邮箱注册
function registerAPI(registerData) {
  return request({
    url: '/enrollEmail',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: registerData
  });
}

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

export { registerAPI, getCodeAPI, loginAPI, emailLoginAPI, getUserInfoAPI, revisePasswordAPI, changeUserInfo }

