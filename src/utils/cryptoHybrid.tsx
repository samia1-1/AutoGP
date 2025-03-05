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
 * 生成一个16字节的随机AES对称密钥
 */
export const generateSymmetricKey = (): string => {
  // 如果配置为使用固定密钥，则返回固定值
  if (config.useFixedKey && config.fixedKey) {
    log('使用固定密钥:', config.fixedKey);
    return config.fixedKey;
  }
  
  // 否则生成随机密钥
  const randomKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  log('生成新的随机密钥:', randomKey);
  return randomKey;
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
 * 格式化公钥为标准PEM格式
 */
export const formatRSAPublicKey = (publicKey: string): string => {
  try {
    if (!publicKey) return '';
    
    // 如果已经是PEM格式，直接返回
    if (publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
      return publicKey;
    }
    
    // 清理可能的空格和换行符
    const cleanKey = publicKey.trim().replace(/\s+/g, '');
    
    // 每64个字符添加换行符
    const chunks = [];
    for (let i = 0; i < cleanKey.length; i += 64) {
      chunks.push(cleanKey.slice(i, i + 64));
    }
    
    const formattedKey = `-----BEGIN PUBLIC KEY-----\n${chunks.join('\n')}\n-----END PUBLIC KEY-----`;
    log('公钥格式化完成');
    return formattedKey;
  } catch (error) {
    console.error('公钥格式化失败:', error);
    return '';
  }
};

/**
 * 利用RSA公钥对字符串进行加密
 * 注意：这里需要传入已经编码好的字符串，如Base64格式的AES密钥
 */
export const encryptWithRSA = (data: string, publicKey: string): string => {
  try {
    log('RSA加密开始，数据长度:', data.length);
    
    // 格式化公钥
    const formattedPublicKey = formatRSAPublicKey(publicKey);
    if (!formattedPublicKey) {
      throw new Error('公钥格式无效');
    }
    
    // 创建加密实例
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(formattedPublicKey);
    
    // 执行加密操作
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
    
    // 确保密钥格式正确
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    
    // 解密
    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyBytes, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // 转换为UTF-8字符串
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      return {
        success: false,
        error: '解密结果为空'
      };
    }
    
    // 尝试解析JSON
    try {
      const parsedData = JSON.parse(decryptedString);
      log('AES解密完成(JSON)');
      return {
        success: true,
        data: parsedData
      };
    } catch (e) {
      // 不是JSON，直接返回字符串
      log('AES解密完成(非JSON)');
      return {
        success: true,
        data: decryptedString
      };
    }
  } catch (error) {
    console.error('AES解密失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 准备加密的请求数据
 * 结合RSA和AES加密方式，返回加密后的结果
 */
export const prepareEncryptedData = (data: any, publicKey: string, sessionKey?: string): {encryptedAESKey: string; encryptedData: string; sessionKey: string} => {
  try {
    // 1. 生成随机AES密钥或使用提供的密钥
    const aesKey = sessionKey || generateSymmetricKey();
    log('使用的会话密钥:', aesKey);
    
    // 2. 使用AES密钥加密数据
    const encryptedData = aesEncrypt(data, aesKey);
    log('数据加密完成');
    
    // 3. 把AES密钥转为Base64，再使用RSA公钥加密
    // 重要：这里明确转为Base64，然后再加密
    const base64Key = utf8ToBase64(aesKey);
    log('AES密钥转为Base64:', base64Key);
    
    const encryptedAESKey = encryptWithRSA(base64Key, publicKey);
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
    encryptWithRSA
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
    formatRSAPublicKey
  },
  
  // 混合加密
  hybrid: {
    prepareEncryptedData
  }
};

// 导出为默认导出
export default CryptoHybrid;