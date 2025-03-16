// 封装axios
import axios from "axios";
import { getToken } from "./token";
import CryptoHybrid from "./cryptoHybrid";

// 获取需要使用的加密函数
const { keys, aes } = CryptoHybrid;
const { generateSymmetricKey } = keys;
const { encrypt: aesEncrypt, decrypt: aesDecrypt } = aes;

// 公钥
const SERVER_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMFliHCiiYlPIZ9Om8X8MnjcK9Lx4ESvRcI7gJDP18yLWEkx2ahzpOyE/gdztTXXzHoJ5dbB3NNw1q+HCyn0NUWloA1GNJJ6wT5WOsIEil8aWKAus+Rk+1jOkhHEVC7e0CTsE07iYkPkYzvS4qdR3BqFdmqg5A2I/UDdiRG8e535tMUkCdNCPffAzuxdT0A68mqc3wappLhVqhwhC2ToQzFAfCq8O+RQmZyvL6Bo4pyXAII1LXPTMUM/0jaXn8+TcjjdcGY9eaCDWuiuRcUuk6vzEvdRKuzKvarLhmpgrZWe4aTb7XCExpv7zDuq68f2X43ppvt94PFmrjt6XKjDTQIDAQAB';

// 存储当前使用的AES密钥
let currentSymmetricKey = '';

// 添加请求ID到会话密钥的映射表，确保响应可以正确找到对应的密钥
const requestKeyMap = new Map();

// 配置需要从GET转为POST的路径 - 这个配置可以根据需要修改或通过API暴露给用户配置
let GET_TO_POST_PATHS = [
  '/user/get',
  '/download',
  '/getFile',
  '/corn/getAll',
  // '/corn/download'
];

// 定义不需要加密的POST请求路径
let NO_ENCRYPT_PATHS = [
  '/upload',
  '/share/upload', 
  '/boutique/upload',
  '/revise/user',
  // '/corn/download',
  '/delete'
];

// 配置根域名、超时时间
const request = axios.create({
  baseURL: "/api",
  timeout: 0
});

/**
 * 设置需要从GET转为POST的API路径
 * @param paths 路径数组
 */
const setGetToPostPaths = (paths) => {
  if (Array.isArray(paths)) {
    GET_TO_POST_PATHS = paths;
    console.log('已更新GET转POST路径配置:', GET_TO_POST_PATHS);
    return true;
  }
  return false;
};

/**
 * 获取当前GET转POST的配置
 */
const getGetToPostPaths = () => {
  return [...GET_TO_POST_PATHS]; // 返回副本
};

/**
 * 设置无需加密的POST请求路径
 * @param paths 路径数组
 */
const setNoEncryptPaths = (paths) => {
  if (Array.isArray(paths)) {
    NO_ENCRYPT_PATHS = paths;
    console.log('已更新无需加密路径配置:', NO_ENCRYPT_PATHS);
    return true;
  }
  return false;
};

/**
 * 获取当前无需加密的POST请求配置
 */
const getNoEncryptPaths = () => {
  return [...NO_ENCRYPT_PATHS]; // 返回副本
};

// 新增函数：从URL中提取干净的路径（不含查询字符串）
const extractCleanPath = (url: string): string => {
  return url.split('?')[0];
};

// 修改匹配GET_TO_POST_PATHS中的路径函数，使用更宽松的匹配逻辑
const shouldConvertToPostFunc = (url: string): boolean => {
  const cleanUrl = extractCleanPath(url);
  // 同时支持精确匹配和前缀匹配
  return GET_TO_POST_PATHS.some(path => 
    cleanUrl === path || 
    cleanUrl.startsWith(path + '/') ||
    // 处理查询参数前的精确匹配
    path === cleanUrl.split('?')[0]
  );
};

// 替换现有的shouldSkipEncryption函数，实现更严格的路径匹配
const shouldSkipEncryption = (url) => {
  if (!url) return false;
  const cleanUrl = extractCleanPath(url);
  
  // 严格匹配：完全匹配或路径前缀匹配
  return NO_ENCRYPT_PATHS.some(path => 
    cleanUrl === path || 
    cleanUrl.startsWith(path + '/')
  );
};

// 请求拦截器
request.interceptors.request.use(async (config) => {
  const token = getToken()

  console.log('拦截器收到请求:', config.url, config.method);
  
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
  
  // 日志输出："hasToken: true"说明请求已经携带了token
  // 在登陆成功后调用如 getUserInfoAPI() 之类的接口时，可从控制台日志确认该请求携带了token
  
  // 添加更多日志输出以便调试
  if (config.url && config.url.includes('download')) {
    console.group(`🔍 下载请求详细分析: ${config.url}`);
    console.log('原始URL:', config.url);
    console.log('清理后URL:', extractCleanPath(config.url));
    console.log('查询参数:', config.params);
    console.log('请求体:', config.data);
    console.log('强制加密头:', config.headers?.['x-force-encrypt']);
    console.log('在无需加密列表中:', shouldSkipEncryption(config.url));
    console.groupEnd();
  }
  
  // 检查是否需要将GET请求转为POST
  const shouldConvertToPost = config.method === 'get' && config.url && shouldConvertToPostFunc(config.url);
  
  // 检查是否是期望接收二进制数据的请求
  const isBinaryResponseRequest = config.responseType === 'blob' || config.responseType === 'arraybuffer';
  
  if (shouldConvertToPost) {
    console.log(`将GET请求转为POST: ${config.url}`);
    // 获取GET参数
    const params = config.params || {};
    
    // 保存GET参数到请求头，以便后端可以使用（仍然保留这个，兼容性考虑）
    config.headers['x-original-params'] = JSON.stringify(params);
    
    // 修改为POST
    
    config.method = 'post';
    
    // 修改：使用查询参数作为请求体，而不是固定值1
    // 如果参数对象有值，则使用参数对象，否则使用固定值1
    const hasParams = Object.keys(params).length > 0;
    
    if (hasParams) {
      config.data = params;
      console.log('GET转POST: 使用URL参数作为请求体:', config.data);
      
      // 关键修复：对于强制加密的请求，不要记录明文参数值
      if (config.headers?.['x-force-encrypt'] === 'true') {
        console.log('GET转POST + 强制加密: 参数将被加密处理');
      }
    } else {
      config.data = 1;  
      console.log('GET转POST: 无URL参数，使用固定值1作为请求体');
    }
    
    // 标记这个请求是由GET转换为POST的
    config.headers['x-converted-from-get'] = 'true';
    
    // 如果是二进制响应请求，也标记一下，以便响应拦截器可以识别
    if (isBinaryResponseRequest) {
      config.headers['x-binary-response'] = 'true';
      console.log('标记为二进制响应请求');
    }
    
    // 保留强制加密标记，确保它不会在其他头部设置中丢失
    const forceEncrypt = config.headers?.['x-force-encrypt'] === 'true';
    
    // 设置Content-Type为application/json
    config.headers['Content-Type'] = 'application/json';
    
    // 恢复强制加密标记(如果有)
    if (forceEncrypt) {
      config.headers['x-force-encrypt'] = 'true';
      console.log('保留强制加密标记 ✓');
    }
    
    // 清除原GET参数
    config.params = undefined;
  }
  
  // 1. 检测是否是FormData - 所有FormData都不加密
  const isFormData = config.data instanceof FormData;
  if (isFormData) {
    console.log('📦 检测到FormData请求，跳过加密处理');
    // FormData不需要设置Content-Type，浏览器会自动处理
    delete config.headers['Content-Type']; 
    console.log('📦 FormData上传: 自动设置Content-Type');
    return config;
  }
  
  // 2. 首先判断是否在NO_ENCRYPT_PATHS中
  const isNoEncryptPath = config.url && shouldSkipEncryption(config.url);
  
  // 3. 获取强制加密标记
  const forceEncrypt = config.headers?.['x-force-encrypt'] === 'true';
  const forceBinaryEncryption = config.headers?.['x-binary-encryption-required'] === 'true';
  
  // 4. 标记保留，确保后续逻辑能够正确访问
  if (forceEncrypt) {
    config.headers['x-force-encrypt'] = 'true';
  }
  if (forceBinaryEncryption) {
    config.headers['x-binary-encryption-required'] = 'true';
  }
  
  // 5. 关键修改：NO_ENCRYPT_PATHS优先级最高，只有不在该列表中才考虑加密
  // 除非显式强制加密，否则NO_ENCRYPT_PATHS中的路径一律不加密
  if (isNoEncryptPath && !(forceEncrypt || forceBinaryEncryption)) {
    console.log('🚫 严格遵守NO_ENCRYPT_PATHS: 跳过加密', config.url);
    
    if (isFormData) {
      delete config.headers['Content-Type']; // FormData自动设置
      console.log('📦 FormData上传: 自动设置Content-Type');
    }
    return config;
  }
  
  // 6. 如果不在NO_ENCRYPT_PATHS中，或者虽在但被强制加密，则进行加密处理
  if (!isNoEncryptPath) {
    console.log('✓ 不在NO_ENCRYPT_PATHS中，将进行加密:', config.url);
  } else if (forceEncrypt || forceBinaryEncryption) {
    console.log('⚠️ 虽在NO_ENCRYPT_PATHS中，但因强制加密标记将进行加密:', config.url);
  }
  
  // 7. 增加格式检测和加密策略选择逻辑
  const isJSONData = !isFormData && (
    (typeof config.data === 'object' && config.data !== null) || 
    (typeof config.data === 'string' && (
      config.data.trim().startsWith('{') || 
      config.data.trim().startsWith('[')
    ))
  );
  
  // 8. 获取加密策略标记
  const preferJSONEncryption = config.headers?.['x-prefer-json-encryption'] === 'true';
  
  // JSON数据处理
  if (isJSONData || preferJSONEncryption) {
    console.log('🔒 使用JSON加密策略');
    // 执行现有的JSON数据加密逻辑
    try {
      // 如果没有会话密钥，生成一个新的
      if (!currentSymmetricKey) {
        currentSymmetricKey = generateSymmetricKey();
        console.log('已生成新的会话密钥:', currentSymmetricKey);
      }

      // 加密请求数据
      const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      const encryptedData = aesEncrypt(dataString, currentSymmetricKey);
      
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
      console.log('URL:', `${request.defaults.baseURL}${config.url}`);
      console.log('请求ID:', requestId);
      console.log('加密状态: ✓ 已加密');
      console.log('原始会话密钥(仅在客户端使用):', currentSymmetricKey);
      console.log('RSA直接加密密钥(无Base64)长度:', rsaEncryptedKey.length);
      console.log('加密数据长度:', encryptedData.length);
      console.log('请求头:', config.headers);
      console.log('请求体:', config.data);
    } catch (error) {
      console.error("加密过程出错:", error);
      throw error;
    }
    return config;
  }
  
  // 默认的POST请求加密
  if (config.method === 'post' && config.data) {
    console.log('🔒 使用默认POST加密策略');
    try {
      // 如果没有会话密钥，生成一个新的
      if (!currentSymmetricKey) {
        currentSymmetricKey = generateSymmetricKey();
        console.log('已生成新的会话密钥:', currentSymmetricKey);
      }

      // 加密请求数据
      const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      const encryptedData = aesEncrypt(dataString, currentSymmetricKey);
      
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
      console.log('URL:', `${request.defaults.baseURL}${config.url}`);
      console.log('请求ID:', requestId);
      console.log('加密状态: ✓ 已加密');
      console.log('原始会话密钥(仅在客户端使用):', currentSymmetricKey);
      console.log('RSA直接加密密钥(无Base64)长度:', rsaEncryptedKey.length);
      console.log('加密数据长度:', encryptedData.length);
      console.log('请求头:', config.headers);
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

// 新增：递归解密函数，处理多层嵌套的data字段
function decryptNestedData(encrypted: any, sessionKey: string): any {
	// 如果是字符串，则尝试解密
	if (typeof encrypted === 'string') {
		const decryptResult = aesDecrypt(encrypted, sessionKey);
		if (decryptResult.success) {
			let finalData = decryptResult.data;
			if (typeof finalData === 'string') {
				try {
					const trimmed = finalData.trim();
					if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
							(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
						finalData = JSON.parse(trimmed);
					}
				} catch (e) {
					// 保留原字符串
				}
			}
			// 若解密结果是对象，并且存在data字段为字符串，则递归处理
			if (typeof finalData === 'object' && finalData.data && typeof finalData.data === 'string') {
				finalData.data = decryptNestedData(finalData.data, sessionKey);
			}
			return finalData;
		} else {
			return encrypted;
		}
	} else if (typeof encrypted === 'object' && encrypted !== null) {
		if (encrypted.data && typeof encrypted.data === 'string') {
			encrypted.data = decryptNestedData(encrypted.data, sessionKey);
		}
		return encrypted;
	}
	return encrypted;
}

// 响应拦截器
request.interceptors.response.use((response) => {
  console.log('拦截器收到了响应:', response.config);
  console.log("响应数据:", response.data);
  try {
    const contentType = response.headers['content-type'] || '';
    const isConvertedFromGet = response.config?.headers?.['x-converted-from-get'] === 'true';
    const requiresBinaryDecryption = response.config?.headers?.['x-binary-response-decryption'] === 'true';
    
    // 判断是否是二进制响应
    const isBinaryResponse = 
      contentType.includes('application/octet-stream') || 
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/pdf') ||
      response.config?.responseType === 'blob' ||
      response.config?.responseType === 'arraybuffer' ||
      response.config?.headers?.['x-binary-response'] === 'true';
    
    // 修复：获取与此响应关联的会话密钥
    let sessionKey = currentSymmetricKey;
    const requestId = response.config?.headers?.['x-request-id'];
    if (requestId && requestKeyMap.has(requestId)) {
      sessionKey = requestKeyMap.get(requestId);
      console.log(`使用请求ID ${requestId} 对应的密钥解密响应`);
    } else {
      console.log('未找到请求匹配密钥，使用当前全局密钥解密');
    }
    
    // 如果设置了二进制响应解密标记
    if (requiresBinaryDecryption && response.data instanceof Blob) {
      console.log('检测到加密的二进制响应，开始解密处理');
      
      // 新增：处理可能是加密JSON的二进制响应
      if (contentType.includes('application/json')) {
        console.log('检测到加密JSON二进制响应');
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonText = reader.result as string;
              const jsonData = JSON.parse(jsonText);
              console.log('解析JSON成功:', jsonData);
              
              // 如果包含加密的data字段
              if (jsonData.data && typeof jsonData.data === 'string' && sessionKey) {
                console.log('开始解密data字段');
                // 解密数据
                const decryptResult = aesDecrypt(jsonData.data, sessionKey);
                
                if (decryptResult.success) {
                  console.log('解密成功，检查是否为Base64编码的二进制数据');
                  let decodedData = decryptResult.data;
                  
                  // 判断是否是Base64编码的二进制数据
                  if (typeof decodedData === 'string' && 
                      (decodedData.match(/^[A-Za-z0-9+/=]+$/) || 
                       decodedData.startsWith('data:'))) {
                    
                    // 如果是Base64，转换回二进制Blob
                    const base64Data = decodedData.includes('base64,') ? 
                      decodedData.split('base64,')[1] : decodedData;
                    
                    const binary = atob(base64Data);
                    const array = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                      array[i] = binary.charCodeAt(i);
                    }
                    
                    // 创建新的响应对象，包含解密后的二进制数据
                    const newResponse = {
                      ...response,
                      data: new Blob([array], { 
                        type: response.headers['x-original-content-type'] || 'video/mp4' 
                      })
                    };
                    console.log('成功解密并转换为二进制Blob');
                    resolve(newResponse);
                    return;
                  }
                  
                  // 如果不是Base64，返回解密后的数据
                  const newResponse = { ...response, data: decodedData };
                  console.log('成功解密数据');
                  resolve(newResponse);
                  return;
                } else {
                  console.error('解密失败');
                }
              }
              
              // 如果不需要解密或解密失败，返回原始JSON
              resolve({ ...response, data: jsonData });
            } catch (e) {
              console.error('解析JSON失败:', e);
              resolve(response); // 解析失败返回原始响应
            }
          };
          reader.onerror = () => {
            console.error('读取Blob失败');
            resolve(response);
          };
          reader.readAsText(response.data);
        });
      }
      
      console.log('非JSON二进制响应，跳过解密');
    }
    
    // 对二进制或特殊响应直接返回
    if (isBinaryResponse) {
      console.log('二进制响应或特殊类型，跳过解密');
      return response;
    }
    
    // 如果响应未设置 x-encrypted-request 则认为不需要解密，直接尝试解析JSON
    if (!response.config.headers['x-encrypted-request']) {
      if (typeof response.data === 'string') {
        try {
          response.data = JSON.parse(response.data);
          console.log('解析响应字符串成功');
        } catch (e) {}
      }
      return response;
    }
    
    // 解密逻辑：提取响应数据中加密的 payload，一般为 { code, msg, data }
    if (sessionKey && response.data && typeof response.data.data === 'string') {
      // 递归解密data字段
      const decrypted = decryptNestedData(response.data.data, sessionKey);
      // 直接替换整个响应数据
      response.data = decrypted;
      console.log('整体替换响应数据为解密结果, 数据类型:', typeof decrypted);
    } else {
      console.log('响应数据无需解密或格式不符，直接返回');
    }
    
    // 最后统一尝试解析字符串形式的响应数据为JSON对象
    if (typeof response.data === 'string') {
      try {
        const trimmedData = response.data.trim();
        if ((trimmedData.startsWith('{') && trimmedData.endsWith('}')) ||
            (trimmedData.startsWith('[') && trimmedData.endsWith(']'))) {
          response.data = JSON.parse(trimmedData);
          console.log('最终检查: JSON字符串已解析为对象');
        }
      } catch (e) { }
    }
    
    // 清理会话密钥映射
    if (requestId && requestKeyMap.has(requestId)) {
      requestKeyMap.delete(requestId);
      console.log(`请求完成，清理密钥映射: ${requestId}`);
    }
    
    return response;
  } catch (error) {
    console.error("响应处理错误：", error);
    return response;
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
  } catch (error: any) {
    console.error('加密测试失败:', error);
    return { success: false, error: error.message || '未知错误' };
  }
};

export { 
  request, 
  getEncryptionStatus, 
  testEncryption, 
  SERVER_PUBLIC_KEY, 
  setGetToPostPaths, // 导出设置函数
  getGetToPostPaths,  // 导出获取函数
  setNoEncryptPaths,  // 导出设置函数
  getNoEncryptPaths   // 导出获取函数
};

