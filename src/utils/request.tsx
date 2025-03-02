// 封装axios
import axios from "axios";
import { getToken } from "./token";
import { message } from "antd";
import { generateSymmetricKey, encryptSymmetricKeyWithRSA, aesEncrypt, aesDecrypt } from "./cryptoHybrid";

// 使用硬编码的公钥，不从接口获取
let publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnqd7JccaNO0Bty7HtPzTD4+qiWbsna3m8bWTC+t/VJJkGNq2kNG04rCqEtv55vjTarBJVS3vwDGB+v2fJx0CBubsSAyfWS42U69KZmtrBkohtRwhM6tARnsGNuGyg65tFU4xIY7lEHwTAZvn0UNdyFqPxTzoPCDTD9I9XcQoIyAkeIVJHyF+hEji1VjK3hdaZ+poCTBIjxk4XEqTMXgPYmFU+H8ytJUNrQr5Ra784ezKpOmlCDuk3BYeOG59jcuKoXRaEbIRIOY+AshqzewOIjFpBAwMrM77lUHSjyRkq+2KmHHloWl6cQYuVoiuNt6H/hwt3UPvB0vhd3MOCrUdwwIDAQAB';
// 不再需要加载状态，因为公钥已经硬编码
let isPublicKeyLoading = false;
let publicKeyPromise = Promise.resolve(publicKey);

// 存储当前使用的AES密钥
let currentSymmetricKey = '';

// 配置根域名、超时时间
const request = axios.create({
  baseURL: 'http://218.199.69.63:39600',
  // baseURL:"/api",
  timeout: 0
})

// 修改后的获取公钥函数 - 直接返回硬编码的公钥
const fetchPublicKey = async (): Promise<string> => {
  return publicKey; // 直接返回硬编码的公钥
};

/**
 * 将生成的对称密钥发送给服务器
 */
const sendSymmetricKeyToServer = async (symmetricKey: string, publicKey: string): Promise<boolean> => {
  try {
    console.log('开始加密对称密钥...');
    // 使用RSA公钥加密对称密钥
    const encryptedKey = encryptSymmetricKeyWithRSA(symmetricKey, publicKey);
    console.log('对称密钥加密完成，长度:', encryptedKey.length);
    
    // 创建不会被加密拦截器处理的axios实例
    const axiosInstance = axios.create({
      baseURL: request.defaults.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const token = getToken();
    if (token) {
      axiosInstance.defaults.headers.common['token'] = token;
    }

    console.log('准备发送加密后的密钥到服务器...');
    const response = await axiosInstance.post('/decryptKey', {
      encryptedKey: encryptedKey
    });
    
    console.log('服务器响应:', response.data);
    
    // 检查响应中的 code 或 success 字段
    if (response.data) {
      if (response.data.code === 200 || response.data.success === true) {
        console.log('密钥发送成功');
        return true;
      }
    }
    
    console.error('服务器响应格式不正确:', response.data);
    return false;
  } catch (error: any) {
    console.error("发送对称密钥失败，详细错误:", error);
    if (error.response) {
      console.error("服务器响应状态:", error.response.status);
      console.error("服务器响应数据:", error.response.data);
    }
    return false;
  }
};

// 改进加密状态管理 - 实现请求与密钥的绑定
const encryptionState = {
  publicKey: publicKey, // 使用硬编码的公钥
  keyMap: new Map<string, string>(), // 存储请求ID到密钥的映射
  publicKeyPromise: Promise.resolve(publicKey),
  isPublicKeyLoading: false,
  
  // 为请求生成并保存密钥
  generateKeyForRequest(requestId: string): string {
    const newKey = generateSymmetricKey();
    this.keyMap.set(requestId, newKey);
    console.log(`[密钥管理] 为请求 ${requestId} 生成新密钥`);
    return newKey;
  },
  
  // 获取特定请求的密钥
  getKeyForRequest(requestId: string): string | undefined {
    return this.keyMap.get(requestId);
  },
  
  // 清理请求的密钥
  clearKeyForRequest(requestId: string): void {
    if (this.keyMap.has(requestId)) {
      console.log(`[密钥管理] 清理请求 ${requestId} 的密钥`);
      this.keyMap.delete(requestId);
    }
  },
  
  // 重置公钥状态 - 由于使用硬编码公钥，此方法实际上不再重置公钥
  resetPublicKey() {
    console.log('[密钥管理] 尝试重置公钥，但使用的是硬编码公钥');
    // 不再重置公钥，因为使用的是硬编码值
  }
};

// 生成唯一请求ID的函数
function generateRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
}

// 请求拦截器
request.interceptors.request.use(async (config) => {
  const token = getToken()

  console.log('拦截器收到请求:', config.url);
  
  // 判断是否为登录或注册接口或其他公开API
  const isAuthRequest = config.url.includes('/login') || 
    config.url.includes('/enroll') || 
    config.url.includes('/email') ||
    config.url.includes('/getPublicKey') 
    // || 
    // // config.url.includes('/decryptKey') ||
    // // config.url.includes('/public/') ||    // 公开API路径前缀
    // // config.url.includes('/data/') ||      // 数据API路径前缀
    // // config.url.includes('/list') ||       // 包含list的API
    // // config.url.includes('/query') ||      // 查询类API
    // // config.url.includes('/corn/download') || // 下载视频的API
    // // config.url.includes('/plant/list') || // 植物列表API
    // // config.url.includes('/common') ||     // 常用API前缀
    // // config.url.includes('/user/get');     // 用户信息API

  console.log('请求详情 - URL:', config.url, 'isAuthRequest:', isAuthRequest, 'hasToken:', !!token);

  if (!isAuthRequest && !token) {
    // 如果不是公开API且没有token，取消请求
    console.log('无token请求被拒绝:', config.url);
    return Promise.reject(new Error('No token, request is blocked.'));
  }

  // 若存在 token，添加到请求头
  if (token) {
    config.headers.token = `${token}`
  }
  
  // 为加密请求处理
  if (config.data && !config.url.includes('/getPublicKey') && !config.url.includes('/decryptKey')) {
    try {
      // 为当前请求生成唯一ID
      const requestId = generateRequestId();
      config.headers['x-request-id'] = requestId;
      
      // 不再需要获取公钥，直接使用硬编码的公钥
      
      // 为当前请求生成唯一密钥
      const sessionKey = encryptionState.generateKeyForRequest(requestId);
      console.log(`[请求拦截] 请求${requestId}使用新生成的密钥加密数据`);
      
      // 发送密钥到服务器
      const keySent = await sendSymmetricKeyToServer(
        sessionKey, 
        publicKey // 使用硬编码公钥
      );
      
      if (!keySent) {
        // 密钥发送失败，清理并报错
        encryptionState.clearKeyForRequest(requestId);
        throw new Error('密钥协商失败，请稍后重试');
      }
      
      // 使用请求专用密钥加密数据
      const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      config.data = aesEncrypt(dataString, sessionKey);
      config.headers['x-encrypted-request'] = 'true';
      console.log(`[请求拦截] 请求${requestId}的数据已加密`);
      
    } catch (error) {
      console.error("[加密错误]", error);
      throw error;
    }
  }
  return config
}, (error) => {
  console.log(error);
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use((response) => {
  try {
    const requestId = response.config.headers['x-request-id'];
    const isEncryptedResponse = response.headers['x-encrypted-response'] === 'true';
    
    // 如果是加密响应且有对应的密钥，进行解密
    if (requestId && isEncryptedResponse && encryptionState.keyMap.has(requestId)) {
      const sessionKey = encryptionState.getKeyForRequest(requestId);
      
      if (!sessionKey) {
        console.error(`[密钥错误] 找不到请求${requestId}的解密密钥`);
      } else {
        console.log(`[响应拦截] 使用请求${requestId}的密钥解密响应数据`);
        
        // 解密响应数据
        const decryptedData = aesDecrypt(response.data, sessionKey);
        response.data = JSON.parse(decryptedData);
      }
    }
    
    // 请求完成，清理对应的密钥
    if (requestId) {
      encryptionState.clearKeyForRequest(requestId);
    }
    
    return response;
  } catch (error) {
    console.error("[响应处理错误]", error);
    
    // 即使出错也要尝试清理密钥
    const requestId = response.config?.headers?.['x-request-id'];
    if (requestId) {
      encryptionState.clearKeyForRequest(requestId);
    }
    
    return response;
  }
}, (error) => {
  // 请求失败时也要清理密钥
  if (error.config?.headers?.['x-request-id']) {
    encryptionState.clearKeyForRequest(error.config.headers['x-request-id']);
  }
  
  console.log("响应错误", error);
  
  if (error.response?.status === 404) return;
  message.error("网络连接错误，请检查网络后重试！");
  return Promise.reject(error);
});

// 移除预加载公钥的代码，因为我们现在使用硬编码公钥
console.log('使用硬编码公钥:', publicKey.substring(0, 20) + '...');

export { request, fetchPublicKey };

