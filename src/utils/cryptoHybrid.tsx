import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

// 配置和状态对象
let config = {
  useFixedKey: false,
  fixedKey: 'ABCDEFGHABCDEFGH',
  logEnabled: true
};

// 配置方法
export const configureCrypto = (options: {
  useFixedKey?: boolean;
  fixedKey?: string;
  logEnabled?: boolean;
}) => {
  if (options.useFixedKey !== undefined) config.useFixedKey = options.useFixedKey;
  if (options.fixedKey !== undefined) config.fixedKey = options.fixedKey;
  if (options.logEnabled !== undefined) config.logEnabled = options.logEnabled;
};

// 日志方法
const log = (message: string, ...args: any[]) => {
  if (config.logEnabled) {
    console.log(`[CryptoHybrid] ${message}`, ...args);
  }
};

/**
 * 生成一个16位（字符）的AES对称密钥
 * 注意：必须确保密钥长度为16位字符
 */
export const generateSymmetricKey = (): string => {
  // 如果配置为使用固定密钥，则返回固定值
  if (config.useFixedKey && config.fixedKey) {
    // 确保固定密钥也是16位
    const fixedKey = config.fixedKey.length === 16 ? 
      config.fixedKey : config.fixedKey.substring(0, 16);
    log('使用固定密钥:', fixedKey);
    return fixedKey;
  }
  
  // 生成包含16个随机字符的字符串
  // 使用字母和数字的组合
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // 生成16位随机字符串
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  log('生成新的16位随机密钥:', result);
  return result;
};

/**
 * 转换字符串为Base64格式
 */
export const utf8ToBase64 = (str: string): string => {
  try {
    const words = CryptoJS.enc.Utf8.parse(str);
    const base64 = CryptoJS.enc.Base64.stringify(words);
    log('UTF-8转Base64:', { original: str, base64 });
    return base64;
  } catch (error) {
    console.error('UTF-8转Base64失败:', error);
    throw error;
  }
};

/**
 * 从Base64解码回字符串
 */
export const base64ToUtf8 = (base64: string): string => {
  try {
    const words = CryptoJS.enc.Base64.parse(base64);
    const utf8 = CryptoJS.enc.Utf8.stringify(words);
    log('Base64转UTF-8:', { base64, utf8 });
    return utf8;
  } catch (error) {
    console.error('Base64转UTF-8失败:', error);
    throw error;
  }
};

/**
 * 将密钥转换为标准PEM格式
 * @param rawKey Base64编码的密钥
 * @param type 密钥类型，如 'PUBLIC KEY' 或 'PRIVATE KEY'
 * @returns 标准PEM格式的密钥
 */
export const formatToPEM = (rawKey: string, type: 'PUBLIC KEY' | 'PRIVATE KEY' | 'RSA PRIVATE KEY' = 'PUBLIC KEY'): string => {
  try {
    if (!rawKey) return '';
    
    // 如果已经是PEM格式，直接返回
    if (rawKey.includes(`-----BEGIN ${type}-----`)) {
      return rawKey;
    }
    
    // 清理可能的空格和换行符
    const cleanKey = rawKey.trim().replace(/\s+/g, '');
    
    // 每64个字符添加换行符
    const chunks = [];
    for (let i = 0; i < cleanKey.length; i += 64) {
      chunks.push(cleanKey.slice(i, i + 64));
    }
    
    const formattedKey = `-----BEGIN ${type}-----\n${chunks.join('\n')}\n-----END ${type}-----`;
    log('密钥格式化完成:', type);
    return formattedKey;
  } catch (error) {
    console.error(`${type}格式化失败:`, error);
    return '';
  }
};

/**
 * 利用RSA公钥对字符串进行加密
 * 修改：现在直接加密UTF-8格式的字符串，无需Base64预处理
 */
export const encryptWithRSA = (data: string, publicKey: string): string => {
  try {
    log('RSA加密开始，数据长度:', data.length);
    
    // 格式化公钥
    const formattedPublicKey = formatToPEM(publicKey, 'PUBLIC KEY');
    if (!formattedPublicKey) {
      throw new Error('公钥格式无效');
    }
    
    // 创建加密实例
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(formattedPublicKey);
    
    // 执行加密操作 - 直接加密字符串，不进行Base64编码
    const encrypted = jsEncrypt.encrypt(data);
    
    if (!encrypted) {
      throw new Error('RSA加密失败');
    }
    
    log('RSA加密完成，密文长度:', encrypted.length);
    return encrypted;
  } catch (error) {
    console.error('RSA加密失败:', error);
    throw error;
  }
};

/**
 * 使用AES对数据进行加密
 */
export const aesEncrypt = (data: any, key: string): string => {
  try {
    log('AES加密开始');
    
    // 将对象/数组转为JSON字符串
    let dataString;
    if (data === null || data === undefined) {
      dataString = '';
    } else if (typeof data === 'string') {
      dataString = data;
    } else if (typeof data === 'object') {
      dataString = JSON.stringify(data);
    } else {
      dataString = String(data);
    }
    
    // 确保密钥格式正确(密钥需要是Utf8格式)
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    
    // 使用ECB模式和PKCS7填充(与Java端一致)
    const encrypted = CryptoJS.AES.encrypt(dataString, keyBytes, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const result = encrypted.toString();
    log('AES加密完成，密文长度:', result.length);
    return result;
  } catch (error) {
    console.error('AES加密失败:', error);
    throw error;
  }
};

/**
 * 使用AES对数据进行解密
 */
export const aesDecrypt = (ciphertext: string, key: string): {success: boolean; data?: any; error?: string} => {
  try {
    log('AES解密开始');
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyBytes, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      return { success: false, error: '解密结果为空' };
    }
    
    let resultData: any = decryptedString;
    
    // 如果解密后字符串以引号包裹，则尝试先解除外层引号再解析
    if (resultData.startsWith('"') && resultData.endsWith('"')) {
      try {
        const unescaped = JSON.parse(resultData);
        // 如果解除后又是JSON格式的字符串，尝试再次解析
        if (typeof unescaped === 'string' && unescaped.trim().startsWith('{') && unescaped.trim().endsWith('}')) {
          resultData = JSON.parse(unescaped);
        } else {
          resultData = unescaped;
        }
      } catch (e) {
        // 解析失败则保留原始结果
      }
    } else {
      // 尝试解析为JSON对象
      try {
        resultData = JSON.parse(resultData);
      } catch (e) {
        // 如果解析失败，则认为结果为普通字符串
      }
    }
    
    log('AES解密完成', resultData);
    return { success: true, data: resultData };
  } catch (error: any) {
    console.error('AES解密失败:', error);
    return { success: false, error: error.message || '未知错误' };
  }
};

/**
 * 准备加密的请求数据
 * 结合RSA和AES加密方式，返回加密后的结果
 * 修改：直接使用RSA加密AES密钥，无需Base64编码
 */
export const prepareEncryptedData = (data: any, publicKey: string, sessionKey?: string): {encryptedAESKey: string; encryptedData: string; sessionKey: string} => {
  try {
    // 1. 生成随机AES密钥或使用提供的密钥
    const aesKey = sessionKey || generateSymmetricKey();
    log('使用的会话密钥:', aesKey);
    
    // 2. 使用AES密钥加密数据
    const encryptedData = aesEncrypt(data, aesKey);
    log('数据加密完成');
    
    // 3. 直接使用RSA公钥加密AES密钥
    const encryptedAESKey = encryptWithRSA(aesKey, publicKey);
    log('RSA加密AES密钥完成');
    
    return {
      encryptedAESKey,
      encryptedData,
      sessionKey: aesKey
    };
  } catch (error) {
    console.error('准备加密数据失败:', error);
    throw error;
  }
};

// 导出一个统一的CryptoHybrid对象
const CryptoHybrid = {
  // 配置方法
  configure: configureCrypto,
  
  // 密钥相关
  keys: {
    generateSymmetricKey,
    encryptWithRSA,
    formatToPEM
  },
  
  // AES加密相关
  aes: {
    encrypt: aesEncrypt,
    decrypt: aesDecrypt
  },
  
  // 通用工具
  common: {
    utf8ToBase64,
    base64ToUtf8,
    formatToPEM
  },
  
  // 混合加密
  hybrid: {
    prepareEncryptedData
  }
};

// 为了保持向后兼容，添加这些属性
Object.defineProperties(CryptoHybrid, {
  // 直接在顶层添加常用方法，简化调用
  formatRSAPublicKey: {
    value: formatToPEM,
    enumerable: true
  },
  // 其他可能需要顶层访问的函数也可以这样添加...
});

// 导出为默认导出
export default CryptoHybrid;