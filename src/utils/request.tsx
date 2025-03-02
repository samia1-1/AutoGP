// 封装axios
import axios from "axios";
import { getToken } from "./token";
import { message } from "antd";
import { generateSymmetricKey, encryptSymmetricKeyWithRSA, aesEncrypt, aesDecrypt } from "./cryptoHybrid";

// 替换为状态变量，从服务器获取公钥
let publicKey = '';
let isPublicKeyLoading = false;
let publicKeyPromise: Promise<string> | null = null;

// 存储当前使用的AES密钥
let currentSymmetricKey = '';

// 配置根域名、超时时间
const request = axios.create({
  baseURL: 'http://218.199.69.63:39600',
  // baseURL:"/api",
  timeout: 0
})

// 获取公钥的函数
const fetchPublicKey = async (): Promise<string> => {
  if (publicKey) return publicKey; // 如果已经有公钥，直接返回
  
  if (isPublicKeyLoading) {
    // 如果已经在加载中，返回正在进行的Promise
    return publicKeyPromise!;
  }
  
  isPublicKeyLoading = true;
  publicKeyPromise = request.get('/getPublicKey')
    .then(response => {
      console.log('获取公钥响应:', response.data);
      
      let extractedPublicKey = null;
      
      // 增强提取公钥的逻辑，处理更多嵌套情况
      if (typeof response.data === 'string') {
        // 直接是字符串公钥
        extractedPublicKey = response.data;
        console.log('直接从 response.data 提取公钥字符串');
      } 
      else if (response.data?.data) {
        // 处理嵌套的 data 字段
        if (typeof response.data.data === 'string') {
          extractedPublicKey = response.data.data;
          console.log('从 response.data.data 提取公钥字符串');
        } 
        else if (typeof response.data.data === 'object') {
          // 处理 data 是对象的情况
          if (response.data.data.publicKey) {
            extractedPublicKey = response.data.data.publicKey;
            console.log('从 response.data.data.publicKey 提取公钥');
          } 
          // 尝试在 data 对象中寻找含有 "KEY" 的字段
          else {
            for (const key in response.data.data) {
              if (typeof response.data.data[key] === 'string' && 
                  (key.includes('key') || key.includes('Key') || 
                   response.data.data[key].includes('KEY'))) {
                extractedPublicKey = response.data.data[key];
                console.log(`从 response.data.data.${key} 提取疑似公钥字符串`);
                break;
              }
            }
          }
        }
      }
      else if (response.data?.publicKey) {
        extractedPublicKey = response.data.publicKey;
        console.log('从 response.data.publicKey 提取公钥');
      }
      
      // 尝试遍历顶层对象寻找公钥字段
      if (!extractedPublicKey && typeof response.data === 'object') {
        for (const key in response.data) {
          if (typeof response.data[key] === 'string' && 
              (key.includes('key') || key.includes('Key') ||
              (response.data[key].length > 100 && response.data[key].includes('KEY')))) {
            extractedPublicKey = response.data[key];
            console.log(`从 response.data.${key} 提取疑似公钥字符串`);
            break;
          }
        }
      }
      
      if (!extractedPublicKey) {
        console.error('无法从响应中提取公钥:', response.data);
        throw new Error('服务器未返回有效的公钥格式');
      }
      
      // 保存提取的公钥
      publicKey = extractedPublicKey;
      
      console.log('成功获取公钥:', publicKey.substring(0, 20) + '...');
      return publicKey;
    })
    .catch(error => {
      console.error('获取公钥出错:', error);
      // 重置状态，允许下次重试
      publicKey = '';
      throw error;
    })
    .finally(() => {
      isPublicKeyLoading = false;
    });
  
  return publicKeyPromise;
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
  publicKey: '',
  keyMap: new Map<string, string>(), // 存储请求ID到密钥的映射
  publicKeyPromise: null as Promise<string> | null,
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
  
  // 重置公钥状态
  resetPublicKey() {
    this.publicKey = '';
    this.publicKeyPromise = null;
    this.isPublicKeyLoading = false;
    console.log('[密钥管理] 已重置公钥');
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
      
      // 确保获取到最新的公钥
      if (!encryptionState.publicKey) {
        console.log('获取最新公钥...');
        try {
          await fetchPublicKey();
        } catch (error) {
          console.error('[密钥错误] 获取公钥失败:', error);
          throw new Error('加密初始化失败，请刷新页面');
        }
      }
      
      // 为当前请求生成唯一密钥
      const sessionKey = encryptionState.generateKeyForRequest(requestId);
      console.log(`[请求拦截] 请求${requestId}使用新生成的密钥加密数据`);
      
      // 发送密钥到服务器
      const keySent = await sendSymmetricKeyToServer(
        sessionKey, 
        encryptionState.publicKey
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

// 尝试在应用启动时预先获取公钥，但不阻塞应用启动
setTimeout(() => {
  fetchPublicKey()
    .then(() => console.log('预加载公钥成功'))
    .catch(error => {
      console.warn("预加载公钥失败，将在需要时重试:", error.message);
    });
}, 2000); // 延迟2秒再尝试，避免和其他初始化过程冲突

export { request, fetchPublicKey };

