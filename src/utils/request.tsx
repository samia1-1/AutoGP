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
      
      // 根据服务器实际返回的格式提取公钥
      if (response.data && response.data.data && typeof response.data.data === 'string') {
        // 处理 {msg: '获取公钥成功', code: 200, data: 'MIIBIjANBgkqhkiG9w0BAQEF...'} 格式
        extractedPublicKey = response.data.data;
        console.log('从 response.data.data 提取公钥');
      } else if (response.data && response.data.publicKey) {
        // 处理 {publicKey: 'MIIBIjANBgkqhkiG9w0BAQEF...'} 格式
        extractedPublicKey = response.data.publicKey;
        console.log('从 response.data.publicKey 提取公钥');
      } else if (response.data && typeof response.data === 'string') {
        // 处理直接返回字符串的情况
        extractedPublicKey = response.data;
        console.log('直接从 response.data 提取公钥字符串');
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
  
  // 为所有有请求体的接口使用混合加密
  if (config.data) {
    try {
      // 跳过公钥和密钥相关接口的加密
      if (config.url.includes('/getPublicKey') || config.url.includes('/decryptKey')) {
        return config;
      }

      // 确保获取公钥
      if (!publicKey) {
        try {
          await fetchPublicKey();
        } catch (error) {
          console.error("获取公钥失败:", error);
          throw new Error('获取公钥失败，请刷新页面重试');
        }
      }

      // 生成新的对称密钥
      if (!currentSymmetricKey) {
        currentSymmetricKey = generateSymmetricKey();
        console.log('已生成新的对称密钥');
        
        const keySent = await sendSymmetricKeyToServer(currentSymmetricKey, publicKey);
        if (!keySent) {
          console.error('密钥发送失败，将重试');
          currentSymmetricKey = ''; // 重置密钥以便下次重试
          throw new Error('无法安全传输加密密钥，请稍后重试');
        }
      }

      // 加密请求数据
      const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      config.data = aesEncrypt(dataString, currentSymmetricKey);
      config.headers['x-encrypted-request'] = 'true';
      console.log('请求数据已加密');
      
    } catch (error) {
      console.error("加密过程出错:", error);
      throw error; // 让错误继续向上传播
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
    // 检查是否是加密响应
    const isEncryptedResponse = response.headers['x-encrypted-response'] === 'true';
    
    // 如果是加密响应且有可用的对称密钥
    if (isEncryptedResponse && currentSymmetricKey && response.data) {
      // 解密响应数据
      const decryptedData = aesDecrypt(response.data, currentSymmetricKey);
      
      // 尝试解析为JSON
      try {
        response.data = JSON.parse(decryptedData);
      } catch (e) {
        // 如果不是JSON，直接使用解密后的字符串
        response.data = decryptedData;
        console.error("响应解密错误：", e);
      }
    }
    
    return response;
  } catch (error) {
    console.error("响应解密错误：", error);
    return response; // 即使解密失败也返回原始响应
  }
}, (error) => {
  console.log("响应错误", error);
  
  if (error.response && error.response.status === 404) return;
  message.error("网络连接错误，请检查网络后重试！");
  return Promise.reject(error);
})

// 定期刷新对称密钥
setInterval(() => {
  // 每隔一段时间重置对称密钥，强制下次请求时生成新密钥
  currentSymmetricKey = '';
}, 30 * 60 * 1000); // 每30分钟刷新一次

// 尝试在应用启动时预先获取公钥，但不阻塞应用启动
setTimeout(() => {
  fetchPublicKey()
    .then(() => console.log('预加载公钥成功'))
    .catch(error => {
      console.warn("预加载公钥失败，将在需要时重试:", error.message);
    });
}, 2000); // 延迟2秒再尝试，避免和其他初始化过程冲突

export { request, fetchPublicKey };

