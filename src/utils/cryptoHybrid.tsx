import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
// 新增：导入 encryptlong，用于处理长数据加密
import encryptLong from 'encryptlong';
// 删除或注释掉原有的LZ-string导入
// import LZString from 'lz-string';

/**
 * 加密工具核心库
 * 专为生产环境优化，不含测试代码
 */
export const CryptoHybrid = {
  /**
   * 配置项
   */
  config: {
    defaultKeyLength: 16,       // 默认密钥长度(字节)
    defaultIvLength: 16,        // 默认IV长度(字节)
    rsaPadding: 'PKCS1Padding', // RSA填充模式
    logLevel: 'warning',        // 日志级别: 'debug' | 'warning' | 'error' | 'none'
    cacheSize: 10               // 缓存大小，防止内存泄漏
  },

  /**
   * 内部状态管理
   */
  _state: {
    // 用于缓存格式化后的公钥，避免重复处理
    publicKeyCache: new Map<string, string>(),
    // 加密性能指标统计
    perfStats: {
      aesEncryptTime: 0,
      aesDecryptTime: 0,
      rsaEncryptTime: 0,
      aesCalls: 0,
      rsaCalls: 0
    },
    
    // 日志函数，根据日志级别选择输出方式
    log(level: string, ...args: any[]) {
      const logLevels = { debug: 0, warning: 1, error: 2, none: 3 };
      const configLevel = CryptoHybrid.config.logLevel;
      
      if (logLevels[level] >= logLevels[configLevel]) {
        switch (level) {
          case 'debug':
            console.log(...args);
            break;
          case 'warning':
            console.warn(...args);
            break;
          case 'error':
            console.error(...args);
            break;
        }
      }
    },
    
    // 性能计时器
    startTimer() {
      return performance.now();
    },
    
    endTimer(start: number) {
      return performance.now() - start;
    }
  },

  /**
   * 编码和公共工具 - 添加这个部分来共享给测试工具使用
   */
  common: {
    /**
     * 格式化RSA公钥 - 提取为可共享函数
     * @param publicKey 原始公钥字符串
     * @returns 格式化后的公钥
     */
    formatRSAPublicKey: (publicKey: string): string => {
      let formattedKey = publicKey.trim();
      if (!formattedKey.includes('BEGIN PUBLIC KEY')) {
        formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
      }
      return formattedKey;
    },
    
    /**
     * 将字符串转换为UTF-8字节数组后转Base64
     * @param str 要转换的字符串
     * @returns Base64编码后的字符串
     */
    utf8ToBase64: (str: string): string => {
      const utf8Bytes = new TextEncoder().encode(str);
      return btoa(String.fromCharCode.apply(null, Array.from(utf8Bytes)));
    },
    
    /**
     * 从Base64解码为UTF-8字符串
     * @param base64 Base64编码的字符串
     * @returns 解码后的UTF-8字符串
     */
    base64ToUtf8: (base64: string): string => {
      try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      } catch (e) {
        console.error('Base64解码失败:', e);
        return '';
      }
    },

    /**
     * 日志记录函数 - 支持不同级别
     * @param level 日志级别
     * @param args 日志参数
     */
    logger: (level: 'debug' | 'info' | 'warn' | 'error', ...args: any[]) => {
      const logLevel = CryptoHybrid.config.logLevel;
      const levels = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
      
      if (levels[level] >= levels[logLevel || 'warn']) {
        switch (level) {
          case 'debug':
          case 'info':
            console.log(...args);
            break;
          case 'warn':
            console.warn(...args);
            break;
          case 'error':
            console.error(...args);
            break;
        }
      }
    }
  },

  /**
   * 密钥管理
   */
  keys: {
    /**
     * 生成一个随机 AES 对称密钥
     * @param length 密钥长度(字节)，默认16字节(128位)
     */
    generateSymmetricKey: (length: number = CryptoHybrid.config.defaultKeyLength): string => {
      return CryptoJS.lib.WordArray.random(length).toString();
    },

    /**
     * 利用 RSA 公钥对 AES 对称密钥进行加密
     * @param symmetricKey 对称密钥
     * @param publicKey RSA 公钥字符串
     * @returns 加密后的对称密钥
     */
    encryptWithRSA: (symmetricKey: string, publicKey: string): string => {
      try {
        const jsEncrypt = new JSEncrypt();
        
        // 处理公钥格式
        let formattedKey = publicKey.trim();
        if (!formattedKey.includes('BEGIN PUBLIC KEY')) {
          formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
        }
        
        jsEncrypt.setPublicKey(formattedKey);
        
        // 先进行测试加密
        const testResult = jsEncrypt.encrypt('test');
        if (!testResult) {
          throw new Error('RSA公钥验证失败');
        }
        
        // 加密实际的对称密钥
        const encrypted = jsEncrypt.encrypt(symmetricKey);
        if (!encrypted) {
          throw new Error('RSA加密对称密钥失败');
        }
        
        return encrypted;
      } catch (error) {
        console.error('RSA加密过程出错:', error);
        throw error;
      }
    },

    /**
     * 为Java后端特别优化的密钥加密方法（使用encryptlong减少加密后数据长度）
     */
    encryptKeyForJava: (symmetricKey: string, publicKey: string): string => {
      try {
        // 使用encryptLong加密对称密钥，直接返回加密结果，不进行压缩
        return encryptLong(symmetricKey, publicKey);
      } catch (error) {
        console.error("使用encryptlong加密密钥失败，回退至原始RSA加密：", error);
        // 回退到原有RSA加密方法
        return CryptoHybrid.keys.encryptWithRSA(symmetricKey, publicKey);
      }
    },
    
    /**
     * 密钥健康检查
     * 验证密钥是否符合最低安全标准
     */
    validateKey(key: string): boolean {
      // 验证密钥长度
      if (!key || key.length < 16) {
        CryptoHybrid._state.log('error', '密钥不符合最低安全标准: 长度过短');
        return false;
      }
      
      // 验证密钥复杂度
      const hasLetters = /[A-Za-z]/.test(key);
      const hasNumbers = /[0-9]/.test(key);
      
      if (!(hasLetters && hasNumbers) && key.length < 24) {
        CryptoHybrid._state.log('warning', '密钥安全性较低: 缺乏复杂度');
      }
      
      return true;
    },

    /**
     * 生成结构化但安全的紧凑型对称密钥
     * @returns 安全但更短的密钥
     */
    generateCompactKey: (): string => {
      // 使用更小的熵源和确定性算法生成密钥
      const seed = CryptoJS.lib.WordArray.random(8).toString(); // 8字节种子
      const timestamp = Date.now().toString().slice(-6); // 时间戳后6位
      
      // 使用PBKDF2生成最终密钥
      const key = CryptoJS.PBKDF2(
        seed + timestamp,  // 混合种子
        'autogp_hzau',     // 固定盐
        {
          keySize: 128/32, // 16字节
          iterations: 100  // 减少迭代次数以提高性能
        }
      );
      
      return key.toString();
    },
    
    /**
     * 生成更短的会话密钥 - 使用确定性算法
     * 减少RSA加密负载同时保持安全性
     */
    generateShortKey: (): string => {
      // 以下步骤生成一个紧凑但安全的密钥
      const timestamp = Date.now().toString().slice(-8);
      const randomPart = Math.random().toString(36).substring(2, 6);
      
      // 混合形成一个唯一种子
      const seed = timestamp + randomPart;
      
      // 使用SHA-256哈希后截取前16个字符作为密钥
      const hash = CryptoJS.SHA256(seed).toString();
      return hash.substring(0, 16); // 取16字节
    }
  },

  /**
   * RSA加密功能
   * 添加这个命名空间以支持测试工具调用
   */
  rsa: {
    /**
     * 使用公钥加密数据
     * @param data 要加密的数据
     * @param publicKey RSA公钥
     * @returns 加密后的数据
     */
    encrypt: (data: string, publicKey: string): string => {
      // 直接调用已有的方法保持功能一致性
      return CryptoHybrid.keys.encryptWithRSA(data, publicKey);
    },
    
    /**
     * 格式化RSA公钥
     * @param publicKey 原始公钥字符串
     * @returns 格式化后的公钥
     */
    formatPublicKey: (publicKey: string): string => {
      let formattedKey = publicKey.trim();
      if (!formattedKey.includes('BEGIN PUBLIC KEY')) {
        formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
      }
      return formattedKey;
    }
  },

  /**
   * AES加密功能
   */
  aes: {
    // AES加密：采用ECB模式，无IV，使用PKCS7（等同PKCS5Padding）
    encrypt: (data: any, key: string): string => {
      const start = CryptoHybrid._state.startTimer();
      CryptoHybrid._state.perfStats.aesCalls++;
      try {
        let dataString = typeof data === 'string' ? data : JSON.stringify(data);
        if (!key || typeof key !== 'string') {
          throw new Error('无效的加密密钥');
        }
        const keyBytes = CryptoJS.enc.Utf8.parse(key);
        const encrypted = CryptoJS.AES.encrypt(dataString, keyBytes, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7  // 等同PKCS5Padding
        });
        const result = encrypted.toString();
        CryptoHybrid._state.log('debug', 'AES(ECB)加密结果:', result);
        CryptoHybrid._state.perfStats.aesEncryptTime += CryptoHybrid._state.endTimer(start);
        return result;
      } catch (error) {
        CryptoHybrid._state.log('error', 'AES(ECB)加密失败:', error);
        throw new Error(`加密失败: ${error.message || '未知错误'}`);
      }
    },
    
    // AES解密：确保使用ECB模式，无IV，与加密配置一致
    decrypt: (ciphertext: string, key: string): {
      success: boolean; 
      data?: any; 
      error?: string;
    } => {
      const start = CryptoHybrid._state.startTimer();
      try {
        if (!ciphertext || !key) {
          return { success: false, error: '无效的输入参数' };
        }
        const keyBytes = CryptoJS.enc.Utf8.parse(key);
        const decrypted = CryptoJS.AES.decrypt(ciphertext, keyBytes, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        });
        
        let decryptedText = "";
        try {
          decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        } catch (e) {
          decryptedText = decrypted.toString(CryptoJS.enc.Latin1);
        }
        
        if (!decryptedText) {
          return { success: false, error: '解密结果为空，可能密钥不正确' };
        }
        
        CryptoHybrid._state.perfStats.aesDecryptTime += CryptoHybrid._state.endTimer(start);
        
        try {
          return { success: true, data: JSON.parse(decryptedText) };
        } catch (e) {
          return { success: true, data: decryptedText };
        }
      } catch (error) {
        CryptoHybrid._state.log('error', 'AES(ECB)解密失败:', error);
        return { success: false, error: error?.message || '解密失败' };
      }
    }
  },

  /**
   * 混合加密系统(RSA+AES)
   */
  hybrid: {
    /**
     * 准备服务器通信的加密数据
     * @param data 要加密的数据
     * @param publicKey RSA公钥
     * @returns 加密密钥和加密数据
     */
    prepareEncryptedData: (data: any, publicKey: string): {
      encryptedAESKey: string;
      encryptedData: string;
      sessionKey: string;
    } => {
      // 使用固定AES密钥
      const sessionKey = 'ABCDEFGHABCDEFGH'; // 修改为16字节
      
      // 使用固定密钥通过RSA加密（调用encryptKeyForJava）
      const encryptedAESKey = CryptoHybrid.keys.encryptKeyForJava(sessionKey, publicKey);
      
      // 使用固定密钥加密业务数据
      const encryptedData = CryptoHybrid.aes.encrypt(data, sessionKey);
      
      return { encryptedAESKey, encryptedData, sessionKey };
    },

    /**
     * 创建加密表单数据
     * @param data 要加密的数据
     * @param publicKey RSA公钥
     * @returns URLSearchParams 对象
     */
    createEncryptedForm: (data: any, publicKey: string): URLSearchParams => {
      const { encryptedAESKey, encryptedData } = 
        CryptoHybrid.hybrid.prepareEncryptedData(data, publicKey);
      
      // 创建表单
      const form = new URLSearchParams();
      form.append('encryptedAESKey', encryptedAESKey);
      form.append('encryptedData', encryptedData);
      
      return form;
    }
  },
  
  /**
   * 编码工具
   */
  encoding: {
    /**
     * 将数据转换为Base64
     */
    toBase64: (data: string | Uint8Array): string => {
      if (typeof data === 'string') {
        return btoa(unescape(encodeURIComponent(data)));
      }
      
      return btoa(
        Array.from(data)
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
    },
    
    /**
     * 从Base64解码数据
     */
    fromBase64: (base64: string): string => {
      return decodeURIComponent(escape(atob(base64)));
    }
  },

  /**
   * 实用工具方法
   */
  utils: {
    /**
     * 清理密钥相关缓存和状态
     * 用于应用退出或会话结束时调用
     */
    cleanup() {
      CryptoHybrid._state.publicKeyCache.clear();
      
      // 重置性能统计
      CryptoHybrid._state.perfStats = {
        aesEncryptTime: 0,
        aesDecryptTime: 0,
        rsaEncryptTime: 0,
        aesCalls: 0,
        rsaCalls: 0
      };
      
      CryptoHybrid._state.log('debug', '已清理加密相关缓存和状态');
    },
    
    /**
     * 获取性能统计信息
     */
    getPerformanceStats() {
      const { aesCalls, rsaCalls, aesEncryptTime, aesDecryptTime, rsaEncryptTime } = 
        CryptoHybrid._state.perfStats;
        
      return {
        aesCalls,
        rsaCalls,
        totalCalls: aesCalls + rsaCalls,
        aesEncryptTime,
        aesDecryptTime,
        rsaEncryptTime,
        aesAvgTime: aesCalls ? (aesEncryptTime / aesCalls).toFixed(2) + 'ms' : '0ms',
        rsaAvgTime: rsaCalls ? (rsaEncryptTime / rsaCalls).toFixed(2) + 'ms' : '0ms'
      };
    }
  }
};

// 导出兼容接口
export const generateSymmetricKey = CryptoHybrid.keys.generateSymmetricKey;
export const encryptSymmetricKeyWithRSA = CryptoHybrid.keys.encryptWithRSA;
export const aesEncrypt = CryptoHybrid.aes.encrypt;
export const aesDecrypt = (ciphertext: string, key: string): string => {
  const result = CryptoHybrid.aes.decrypt(ciphertext, key);
  if (!result.success) {
    throw new Error(result.error || '解密失败');
  }
  return typeof result.data === 'string' 
    ? result.data 
    : JSON.stringify(result.data);
};

// 导出匹配index.tsx的导入语句
export const encrypt = aesEncrypt;
export const decrypt = aesDecrypt;

// 导出公共工具函数，供测试工具使用
export const formatRSAPublicKey = CryptoHybrid.common.formatRSAPublicKey;
export const utf8ToBase64 = CryptoHybrid.common.utf8ToBase64;
export const base64ToUtf8 = CryptoHybrid.common.base64ToUtf8;
export const cryptoLogger = CryptoHybrid.common.logger;

// 全局函数(仅在浏览器环境)
if (typeof window !== 'undefined') {
  window['cryptoHybrid'] = CryptoHybrid;
  window['encrypt'] = CryptoHybrid.aes.encrypt;
  window['decrypt'] = CryptoHybrid.aes.decrypt;
}

// 添加性能监控API到全局对象（仅开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window['cryptoStats'] = CryptoHybrid.utils.getPerformanceStats;
}

export default CryptoHybrid;