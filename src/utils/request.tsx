import axios from "axios";
import { getToken } from "./token";
import { message } from "antd";
import CryptoHybrid, { generateSymmetricKey, aesEncrypt, aesDecrypt } from "./cryptoHybrid";

<<<<<<< HEAD
// 服务器公钥 - 直接硬编码在本地
const SERVER_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMFliHCiiYlPIZ9Om8X8MnjcK9Lx4ESvRcI7gJDP18yLWEkx2ahzpOyE/gdztTXXzHoJ5dbB3NNw1q+HCyn0NUWloA1GNJJ6wT5WOsIEil8aWKAus+Rk+1jOkhHEVC7e0CTsE07iYkPkYzvS4qdR3BqFdmqg5A2I/UDdiRG8e535tMUkCdNCPffAzuxdT0A68mqc3wappLhVqhwhC2ToQzFAfCq8O+RQmZyvL6Bo4pyXAII1LXPTMUM/0jaXn8+TcjjdcGY9eaCDWuiuRcUuk6vzEvdRKuzKvarLhmpgrZWe4aTb7XCExpv7zDuq68f2X43ppvt94PFmrjt6XKjDTQIDAQAB';
=======
// 使用硬编码的公钥，不从接口获取
let publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnqd7JccaNO0Bty7HtPzTD4+qiWbsna3m8bWTC+t/VJJkGNq2kNG04rCqEtv55vjTarBJVS3vwDGB+v2fJx0CBubsSAyfWS42U69KZmtrBkohtRwhM6tARnsGNuGyg65tFU4xIY7lEHwTAZvn0UNdyFqPxTzoPCDTD9I9XcQoIyAkeIVJHyF+hEji1VjK3hdaZ+poCTBIjxk4XEqTMXgPYmFU+H8ytJUNrQr5Ra784ezKpOmlCDuk3BYeOG59jcuKoXRaEbIRIOY+AshqzewOIjFpBAwMrM77lUHSjyRkq+2KmHHloWl6cQYuVoiuNt6H/hwt3UPvB0vhd3MOCrUdwwIDAQAB';
// 不再需要加载状态，因为公钥已经硬编码
let isPublicKeyLoading = false;
let publicKeyPromise = Promise.resolve(publicKey);
>>>>>>> 63b96c3268639e397275f7e09998c2e28137baa0

// 存储当前使用的AES密钥
let currentSymmetricKey = '';

// 配置根域名、超时时间
const request = axios.create({
  baseURL: 'http://218.199.69.63:39600',
  // baseURL:"/api",
  timeout: 0
})

<<<<<<< HEAD
// RSA加密调试开关
const DEBUG_RSA = true;

// 保存最近的加密数据，用于错误时测试
let lastEncryptionData = {
  originalData: null,
  encryptedAESKey: '',
  encryptedData: '',
  sessionKey: '',
  publicKey: SERVER_PUBLIC_KEY
=======
// 修改后的获取公钥函数 - 直接返回硬编码的公钥
const fetchPublicKey = async (): Promise<string> => {
  return publicKey; // 直接返回硬编码的公钥
>>>>>>> 63b96c3268639e397275f7e09998c2e28137baa0
};

// 优化自动测试函数 - 移除硬编码私钥依赖
const testRequestEncryption = (
  originalData: any, 
  encryptedKey: string, 
  sessionKey: string
) => {
  console.group('🔍 请求失败 - 自动分析加密流程');
  
  try {
    // 1. 储存测试信息
    console.log('测试数据信息:');
    console.log('- 原始数据:', originalData);
    console.log('- 加密的AES密钥:', encryptedKey);
    console.log('- AES会话密钥:', sessionKey);
    console.log('- 使用的公钥:', SERVER_PUBLIC_KEY.substring(0, 20) + '...');
    
    // 2. 通知用户无法执行私钥解密测试
    console.log('\n⚠️ 注意：本地测试工具不包含私钥');
    console.log('RSA私钥仅在服务器端存在，本地解密测试已禁用');
    
    // 3. 执行仍然可行的测试
    import('./cryptoHybrid').then((CryptoModule) => {
      try {
        // 验证AES加密是否正常工作
        if (lastEncryptionData.encryptedData) {
          console.log('\n1️⃣ 测试AES对称加密/解密功能...');
          const decryptResult = CryptoModule.default.aes.decrypt(
            lastEncryptionData.encryptedData, 
            sessionKey
          );
          
          console.log('AES解密结果:', decryptResult.success ? '✅ 成功' : '❌ 失败');
          if (decryptResult.success) {
            console.log('解密数据:', decryptResult.data);
            
            // 再次加密，验证加密过程是否确定性
            const reEncrypted = CryptoModule.default.aes.encrypt(decryptResult.data, sessionKey);
            const encryptMatch = reEncrypted === lastEncryptionData.encryptedData;
            console.log('重新加密结果与原密文匹配:', encryptMatch ? '✅ 是' : '❌ 否');
          } else {
            console.error('解密错误:', decryptResult.error);
          }
        }
        
        // 通知用户使用服务端日志检查RSA问题
        console.log('\n2️⃣ 诊断建议:');
        console.log('- 检查服务器日志，确认是否成功收到了AES密钥和加密数据');
        console.log('- 确认服务器端的RSA私钥与本地使用的公钥匹配');
      } catch (error) {
        console.error('测试过程出错:', error);
      }
    });
    
    // 4. 提示使用控制台调试
    console.log('\n💡 提示: 可以使用以下命令进行进一步加密流程测试:');
    console.log("window.debugRSA.validateEncryption(data, null, encryptedData, sessionKey)");
    
  } catch (error) {
    console.error('测试过程出错:', error);
  } finally {
    console.groupEnd();
  }
};

<<<<<<< HEAD
=======
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

>>>>>>> 63b96c3268639e397275f7e09998c2e28137baa0
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
  
  // 为所有有请求体的接口使用混合加密
  if (config.data) {
    try {
<<<<<<< HEAD
      // 跳过公钥接口的加密
      if (config.url.includes('/getPublicKey')) {
        return config;
      }

      // 每次请求都使用新的对称密钥
      const symmetricKey = generateSymmetricKey();
      console.log('已生成新的对称密钥:', symmetricKey);
      currentSymmetricKey = symmetricKey;
=======
      // 为当前请求生成唯一ID
      const requestId = generateRequestId();
      config.headers['x-request-id'] = requestId;
      
      // 不再需要获取公钥，直接使用硬编码的公钥
>>>>>>> 63b96c3268639e397275f7e09998c2e28137baa0
      
      // 加密AES密钥
      const base64Key = CryptoHybrid.common.utf8ToBase64(symmetricKey);
      const encryptedAESKey = CryptoHybrid.keys.encryptWithRSA(base64Key, SERVER_PUBLIC_KEY);
      console.log('已加密AES密钥:', encryptedAESKey.substring(0, 20) + '...');
      
<<<<<<< HEAD
      // 加密请求数据
=======
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
>>>>>>> 63b96c3268639e397275f7e09998c2e28137baa0
      const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      const encryptedData = CryptoHybrid.aes.encrypt(dataString, symmetricKey);
      console.log('已加密请求数据');
      
      // 将原始请求数据替换为混合加密结构
      config.data = {
        encryptedAESKey, // RSA加密后的AES密钥
        encryptedData    // AES加密后的数据
      };
      
      // 添加标记头，表示此请求已加密
      config.headers['x-encrypted-request'] = 'true';
      console.log('请求数据已加密并重构');
      
      // === 新增：打印完整的加密后请求，便于调试 ===
      console.group('📦 加密后的完整请求数据');
      console.log('请求URL:', config.url);
      console.log('原始数据:', dataString);
      console.log('会话密钥:', symmetricKey);
      console.log('完整请求体:');
      console.log(JSON.stringify(config.data, null, 2));
      console.log('加密AES密钥长度:', encryptedAESKey.length);
      console.log('加密数据长度:', encryptedData.length);
      console.log('请求头:', config.headers);
      console.groupEnd();
      // === 打印结束 ===
      
      // 保存当前加密的数据，以备测试
      lastEncryptionData = {
        originalData: dataString,
        encryptedAESKey,
        encryptedData,
        sessionKey: symmetricKey,
        publicKey: SERVER_PUBLIC_KEY
      };
      
    } catch (error) {
      console.error("加密过程出错:", error);
      
      // 确保在错误情况下执行测试
      if (lastEncryptionData.encryptedAESKey) {
        testRequestEncryption(
          lastEncryptionData.originalData,
          lastEncryptionData.encryptedAESKey,
          lastEncryptionData.sessionKey
        );
      }
      
      throw error; // 让错误继续向上传播
    }
  }
  return config
}, (error) => {
  console.log("请求拦截器错误:", error);
  
  // 尝试在请求拦截器错误时进行测试
  if (lastEncryptionData.encryptedAESKey) {
    testRequestEncryption(
      lastEncryptionData.originalData,
      lastEncryptionData.encryptedAESKey,
      lastEncryptionData.sessionKey
    );
  }
  
  return Promise.reject(error);
})

// 响应拦截器
request.interceptors.response.use((response) => {
  try {
    // 检查是否是加密响应
    const isEncryptedResponse = response.headers['x-encrypted-response'] === 'true';
    
    // 如果是加密响应且有可用的对称密钥
    if (isEncryptedResponse && currentSymmetricKey && response.data) {
      // 解密响应数据
      const decryptResult = CryptoHybrid.aes.decrypt(response.data, currentSymmetricKey);
      
      if (decryptResult.success) {
        response.data = decryptResult.data;
        console.log('响应数据解密成功');
      } else {
        console.error("响应解密错误：", decryptResult.error);
      }
    }
    
    return response;
  } catch (error) {
    console.error("响应处理错误：", error);
    return response; // 即使解密失败也返回原始响应
  }
}, (error) => {
  console.log("响应错误", error);
  
  // 确保在响应错误时执行测试
  if (error.config && error.config.data && lastEncryptionData.encryptedAESKey) {
    console.warn('请求失败，自动检查加密流程...');
    setTimeout(() => {
      // 延迟执行，确保不会被其他错误处理打断
      testRequestEncryption(
        lastEncryptionData.originalData,
        lastEncryptionData.encryptedAESKey,
        lastEncryptionData.sessionKey
      );
    }, 10);
  }
  
  if (error.response && error.response.status === 404) return;
  message.error("网络连接错误，请检查网络后重试！");
  return Promise.reject(error);
})

<<<<<<< HEAD
// 导出调试工具
if (typeof window !== 'undefined') {
  // 扩展现有的debugRSA对象
  const existingDebugRSA = window.debugRSA || {};
  
  window['debugRSA'] = {
    ...existingDebugRSA,
    
    // 手动执行当前加密数据的测试
    testCurrentEncryption: () => {
      if (!lastEncryptionData.encryptedAESKey) {
        console.error('没有可用的加密数据进行测试');
        return { success: false, error: '没有可用的加密数据' };
      }
      
      // 执行测试，但不依赖本地私钥
      testRequestEncryption(
        lastEncryptionData.originalData,
        lastEncryptionData.encryptedAESKey,
        lastEncryptionData.sessionKey
      );
      
      return lastEncryptionData;
    },
    
    // 获取最近的加密数据
    getLastEncryptionData: () => lastEncryptionData,
    
    // 获取当前加密状态
    getState: () => ({
      publicKey: SERVER_PUBLIC_KEY ? (SERVER_PUBLIC_KEY.substring(0, 20) + '...') : null,
      hasSymmetricKey: !!currentSymmetricKey, 
      symmetricKey: currentSymmetricKey || null,
      encryptionMode: 'hybrid-per-request'
    }),
    
    // 获取本地存储的服务器公钥
    getPublicKey: () => SERVER_PUBLIC_KEY,
=======
// 移除预加载公钥的代码，因为我们现在使用硬编码公钥
console.log('使用硬编码公钥:', publicKey.substring(0, 20) + '...');
>>>>>>> 63b96c3268639e397275f7e09998c2e28137baa0

    // 直接使用内部testRequestEncryption函数
    testFailedRequest: () => {
      if (!lastEncryptionData.encryptedAESKey) {
        console.error('没有可用的加密数据进行测试');
        return { success: false, error: '没有加密记录' };
      }
      
      testRequestEncryption(
        lastEncryptionData.originalData,
        lastEncryptionData.encryptedAESKey,
        lastEncryptionData.sessionKey
      );
      
      return lastEncryptionData;
    }
  };
  
  // 添加测试方法
  window['testHybridEncryption'] = async (data = { test: "data" }) => {
    try {
      // 生成新密钥
      const symmetricKey = generateSymmetricKey();
      
      // 加密AES密钥
      const base64Key = CryptoHybrid.common.utf8ToBase64(symmetricKey);
      const encryptedAESKey = CryptoHybrid.keys.encryptWithRSA(base64Key, SERVER_PUBLIC_KEY);
      
      // 加密数据
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const encryptedData = CryptoHybrid.aes.encrypt(dataString, symmetricKey);
      
      // 构建请求结构
      const requestBody = {
        encryptedAESKey,
        encryptedData
      };
      
      console.log('测试加密结果:', {
        originalData: data,
        encryptedRequest: requestBody,
        sessionKey: symmetricKey
      });
      
      return {
        success: true,
        data: requestBody,
        sessionKey: symmetricKey
      };
    } catch (error) {
      console.error('混合加密测试失败:', error);
      return { success: false, error };
    }
  };
  
  // 导出服务器公钥
  window['getServerPublicKey'] = () => SERVER_PUBLIC_KEY;

  // 添加一个复制加密后请求体的方法，方便调试
  window['copyLastRequest'] = () => {
    if (!lastEncryptionData.encryptedAESKey) {
      console.error('没有可用的加密数据');
      return false;
    }
    
    const requestBody = {
      encryptedAESKey: lastEncryptionData.encryptedAESKey,
      encryptedData: lastEncryptionData.encryptedData
    };
    
    // 将加密后的请求体复制到剪贴板
    try {
      const requestJson = JSON.stringify(requestBody, null, 2);
      navigator.clipboard.writeText(requestJson)
        .then(() => console.log('✅ 加密后的请求已复制到剪贴板'))
        .catch(err => console.error('❌ 复制失败:', err));
      
      console.log('最近的加密请求体:', requestJson);
      return true;
    } catch (e) {
      console.error('复制失败:', e);
      return false;
    }
  };
}

// 导出请求实例和服务器公钥
export { request, SERVER_PUBLIC_KEY };

