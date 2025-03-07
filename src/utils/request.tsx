// 封装axios
import axios from "axios";
import { getToken } from "./token";
import CryptoHybrid from "./cryptoHybrid";

// 获取需要使用的加密函数
const { keys, aes } = CryptoHybrid;
const { generateSymmetricKey } = keys;
const { encrypt: aesEncrypt, decrypt: aesDecrypt } = aes;

// 直接使用本地硬编码的服务器公钥
const SERVER_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMFliHCiiYlPIZ9Om8X8MnjcK9Lx4ESvRcI7gJDP18yLWEkx2ahzpOyE/gdztTXXzHoJ5dbB3NNw1q+HCyn0NUWloA1GNJJ6wT5WOsIEil8aWKAus+Rk+1jOkhHEVC7e0CTsE07iYkPkYzvS4qdR3BqFdmqg5A2I/UDdiRG8e535tMUkCdNCPffAzuxdT0A68mqc3wappLhVqhwhC2ToQzFAfCq8O+RQmZyvL6Bo4pyXAII1LXPTMUM/0jaXn8+TcjjdcGY9eaCDWuiuRcUuk6vzEvdRKuzKvarLhmpgrZWe4aTb7XCExpv7zDuq68f2X43ppvt94PFmrjt6XKjDTQIDAQAB';

// 存储当前使用的AES密钥
let currentSymmetricKey = '';

// 添加请求ID到会话密钥的映射表，确保响应可以正确找到对应的密钥
const requestKeyMap = new Map();

// 配置根域名、超时时间
const request = axios.create({
  // baseURL: 'http://218.199.69.63:39600',
  baseURL:"/api",
  timeout: 0
});

// 请求拦截器
request.interceptors.request.use(async (config) => {
  const token = getToken()

  console.log('拦截器收到请求:', config.url);
  
  // 判断是否为登录或注册接口或其他公开API
  const isAuthRequest = config.url.includes('/login') || 
    config.url.includes('/enroll') || 
    config.url.includes('/email');

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
  
  // 为所有有请求体的接口使用加密
  if (config.data) {
    try {
      // 如果没有会话密钥，生成一个新的
      if (!currentSymmetricKey) {
        currentSymmetricKey = generateSymmetricKey();
        console.log('已生成新的会话密钥:', currentSymmetricKey);
      }

      // 加密请求数据
      const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      const encryptedData = aesEncrypt(dataString, currentSymmetricKey);
      
      // 修改：直接对AES密钥进行RSA加密，不再进行Base64编码
      // const base64SessionKey = CryptoHybrid.common.utf8ToBase64(currentSymmetricKey);
      // const rsaEncryptedKey = CryptoHybrid.keys.encryptWithRSA(base64SessionKey, SERVER_PUBLIC_KEY);
      
      // 直接使用RSA加密AES密钥 (UTF-8格式)
      const rsaEncryptedKey = CryptoHybrid.keys.encryptWithRSA(currentSymmetricKey, SERVER_PUBLIC_KEY);
      
      // 构建加密请求体 - 只包含加密数据，不包含任何原始密钥信息
      const encryptedPayload = {
        encryptedAESKey: rsaEncryptedKey, // 只发送RSA加密后的密钥
        encryptedData: encryptedData      // 只发送AES加密后的数据
      };
      
      // 生成请求ID并将密钥与请求ID关联
      const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      config.headers['x-request-id'] = requestId;
      requestKeyMap.set(requestId, currentSymmetricKey);
      
      console.log(`请求ID ${requestId} 关联到密钥 ${currentSymmetricKey}`);
      
      // 设置超时清理，避免内存泄漏
      setTimeout(() => {
        if (requestKeyMap.has(requestId)) {
          console.log(`清理未使用的请求密钥映射: ${requestId}`);
          requestKeyMap.delete(requestId);
        }
      }, 60000); // 60秒后清理

      // 替换原始请求数据
      config.data = encryptedPayload;
      config.headers['x-encrypted-request'] = 'true';
      console.log('请求数据已加密');
      
      // 在日志中明确标识发送的是加密后的密钥
      console.log('🔒 加密请求');
      console.log('URL:', `${request.defaults.baseURL}${config.url}`); // 使用完整URL便于调试
      console.log('请求ID:', requestId);
      console.log('加密状态: ✓ 已加密');
      console.log('原始会话密钥(仅在客户端使用):', currentSymmetricKey);
      console.log('RSA直接加密密钥(无Base64)长度:', rsaEncryptedKey.length);
      console.log('加密数据长度:', encryptedData.length);
      console.log('请求体:', config.data);
      
    } catch (error) {
      console.error("加密过程出错:", error);
      throw error;
    }
  }

  return config;
}, (error) => {
  console.log(error);
  return Promise.reject(error)
});

// 响应拦截器
request.interceptors.response.use((response) => {
  console.log('拦截器收到响应:', response.config);
  try {
    // 获取关联的会话密钥（所有响应均为加密数据）
    let sessionKey = currentSymmetricKey;
    const requestId = response.config?.headers?.['x-request-id'];
    
    // 从映射表中查找当前请求对应的密钥
    if (requestId && requestKeyMap.has(requestId)) {
      sessionKey = requestKeyMap.get(requestId);
      console.log(`使用请求ID ${requestId} 对应的密钥解密响应`);
      
      // 密钥使用后从映射表中删除
      requestKeyMap.delete(requestId);
    } else {
      console.log('未找到请求匹配密钥，使用当前全局密钥解密');
    }
    
    // 检查响应数据是否存在且会话密钥可用
    if (response.data && sessionKey) {
      // 直接对响应体进行解密（响应体即为加密数据）
      const decryptResult = aesDecrypt(response.data, sessionKey);
      
      if (decryptResult.success) {
        response.data = decryptResult.data;
        console.log('响应数据解密成功');
      } else {
        console.log("首次解密失败:", decryptResult.error);
        
        // 尝试使用全局密钥作为备用（如果使用的不是全局密钥）
        if (sessionKey !== currentSymmetricKey) {
          console.log('尝试使用全局会话密钥进行备用解密');
          const retryResult = aesDecrypt(response.data, currentSymmetricKey);
          if (retryResult.success) {
            response.data = retryResult.data;
            console.log('使用全局密钥解密成功');
          } else {
            console.error("备用解密也失败，返回原始加密数据");
          }
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error("响应处理错误：", error);
    return response; // 即使解密失败也返回原始响应
  }
}, (error) => {
  console.log("响应错误", error);
  
  if (error.response && error.response.status === 404) return;
  return Promise.reject(error);
});

// 修改定期刷新对称密钥的逻辑，确保正在进行的请求不受影响
setInterval(() => {
  // 如果映射表为空（没有进行中的请求），才刷新会话密钥
  if (requestKeyMap.size === 0) {
    console.log('刷新会话密钥');
    currentSymmetricKey = '';
  } else {
    console.log(`跳过密钥刷新，有${requestKeyMap.size}个请求进行中`);
  }
}, 30 * 60 * 1000); // 每30分钟尝试刷新一次

/**
 * 获取加密状态信息
 * 用于监控和调试加密系统
 */
const getEncryptionStatus = () => {
  return {
    // 会话密钥状态
    sessionKey: {
      exists: !!currentSymmetricKey,
      length: currentSymmetricKey?.length || 0
    },
    
    // 公钥状态
    publicKey: {
      exists: true,
      loading: false,
      length: SERVER_PUBLIC_KEY?.length || 0
    },
    
    // 最近事件
    lastEvent: new Date().toISOString(),
    
    // 加密模式
    mode: 'aes-with-rsa'
  };
};

// 添加testEncryption函数，为了保持兼容性
const testEncryption = (data = { test: "测试数据" }) => {
  try {
    // 简单的测试加密流程
    if (!currentSymmetricKey) {
      currentSymmetricKey = generateSymmetricKey();
    }
    
    // 加密测试数据
    const dataString = JSON.stringify(data);
    const encryptedData = aesEncrypt(dataString, currentSymmetricKey);
    
    // 解密测试
    const decryptResult = aesDecrypt(encryptedData, currentSymmetricKey);
    
    // 检验是否匹配
    const decryptedStr = typeof decryptResult.data === 'string' ? 
      decryptResult.data : JSON.stringify(decryptResult.data);
    
    const dataMatch = decryptedStr === dataString;
    
    return {
      success: dataMatch,
      sessionKey: currentSymmetricKey,
      encryptedData,
      decryptedData: decryptResult.data
    };
  } catch (error: any) { // 添加类型断言
    console.error('加密测试失败:', error);
    return { success: false, error: error.message || '未知错误' };
  }
};

export { request, getEncryptionStatus, testEncryption, SERVER_PUBLIC_KEY };

