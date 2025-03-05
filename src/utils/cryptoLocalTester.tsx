import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

/**
 * 通用加密工具命名空间
 * 整合所有加密解密相关功能
 */
export const CryptoUtil = {
  /**
   * 配置参数
   */
  config: {
    debug: true,                   // 是否输出调试日志
    defaultKey: 'ABCDEFGHABCDEFGH' // 修改为16字节
  },

  /**
   * AES加密工具集 - 确保使用PKCS5Padding
   */
  aes: {
    /**
     * AES加密 - 使用ECB模式和PKCS5Padding (与Java兼容)
     * @param data 要加密的数据(字符串或对象)
     * @param key 加密密钥
     * @returns 密文格式的加密字符串
     */
    encrypt: (data: any, key: string = CryptoUtil.config.defaultKey): string => {
      // 1. 数据预处理
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      
      // 2. 处理密钥
      const keyData = CryptoJS.enc.Utf8.parse(key);
      
      // 3. 加密 - 使用ECB模式和PKCS5Padding (在CryptoJS中PKCS5和PKCS7填充实际上是相同的)
      const encrypted = CryptoJS.AES.encrypt(dataStr, keyData, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7  // 等同于Java的PKCS5Padding
      });
      
      // 4. 返回密文格式
      return encrypted.toString();
    },

    /**
     * AES解密 - 使用ECB模式和PKCS5Padding (与Java兼容)
     * @param encryptedData 加密的数据(密文格式)
     * @param key 解密密钥
     * @returns 解密结果对象，包含成功状态和解密数据
     */
    decrypt: (encryptedData: string, key: string = CryptoUtil.config.defaultKey): {
      success: boolean;
      data?: any;
      error?: string;
    } => {
      try {
        // 1. 处理密钥
        const keyData = CryptoJS.enc.Utf8.parse(key);
        
        // 2. 解密 - 确保使用与Java后端兼容的模式和填充
        const decrypted = CryptoJS.AES.decrypt(encryptedData, keyData, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7  // 等同于Java的PKCS5Padding
        });
        
        // 3. 转换为UTF-8字符串
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
          throw new Error('解密结果为空');
        }
        
        // 4. 尝试JSON解析
        try {
          return { success: true, data: JSON.parse(decryptedText) };
        } catch (e) {
          // 不是JSON，返回原始字符串
          return { success: true, data: decryptedText };
        }
      } catch (error) {
        return { success: false, error: error.message || '解密失败' };
      }
    }
  },

  /**
   * RSA加密功能 - 确保使用PKCS1Padding
   */
  rsa: {
    /**
     * 使用公钥加密数据 (RSA/ECB/PKCS1Padding)
     * @param data 要加密的数据
     * @param publicKey RSA公钥
     * @returns 加密后的Base64字符串
     */
    encrypt: (data: string, publicKey: string): string => {
      // 格式化公钥
      let formattedKey = publicKey;
      if (!formattedKey.includes('BEGIN PUBLIC KEY')) {
        formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
      }
      
      // 使用JSEncrypt加密 (默认使用PKCS1Padding)
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(formattedKey);
      
      // JSEncrypt内部使用的是RSA/ECB/PKCS1Padding
      const encrypted = encryptor.encrypt(data);
      if (!encrypted) {
        throw new Error('RSA加密失败');
      }
      
      return encrypted;
    }
  },

  /**
   * UTF-8编码处理工具
   */
  utf8: {
    // 检测是否包含非ASCII字符
    containsNonAscii: (str: string): boolean => {
      return /[^\x00-\x7F]/.test(str);
    },
    
    // 字符串转UTF-8字节
    toBytes: (str: string): Uint8Array => {
      return new TextEncoder().encode(str);
    },
    
    // UTF-8字节转字符串
    fromBytes: (bytes: Uint8Array): string => {
      return new TextDecoder().decode(bytes);
    },
    
    // 检测字符编码兼容性
    testEncoding: (text: string = "测试编码: 你好世界"): boolean => {
      const bytes = new TextEncoder().encode(text);
      const decoded = new TextDecoder().decode(bytes);
      return text === decoded;
    }
  },

  /**
   * 混合加密系统(RSA+AES)
   */
  hybrid: {
    /**
     * 获取服务器公钥并加密AES密钥
     * @param serverUrl 服务器URL
     * @returns 加密的会话密钥和原始AES密钥
     */
    prepareSessionKey: async (serverUrl: string): Promise<{
      aesKey: string;
      encryptedAesKey: string;
    }> => {
      // 动态导入axios以避免循环依赖
      const axios = (await import('axios')).default;
      
      // 生成随机AES密钥
      const aesKey = CryptoJS.lib.WordArray.random(16).toString();
      
      // 获取服务器公钥
      const response = await axios.get(`${serverUrl}/getPublicKey`);
      let publicKey = '';
      
      // 处理不同格式的响应
      if (typeof response.data === 'string') {
        publicKey = response.data;
      } else if (response.data?.data) {
        publicKey = typeof response.data.data === 'string' 
          ? response.data.data 
          : response.data.data.publicKey || '';
      }
      
      if (!publicKey) {
        throw new Error('无法从服务器获取公钥');
      }
      
      // 加密AES密钥
      const encryptedAesKey = CryptoUtil.rsa.encrypt(aesKey, publicKey);
      
      return { aesKey, encryptedAesKey };
    },
    
    /**
     * 发送加密数据到服务器
     * @param url 服务器URL
     * @param data 要加密的数据
     * @param sessionKey 会话密钥信息
     */
    sendEncryptedData: async (
      url: string, 
      data: any, 
      sessionKey: { aesKey: string; encryptedAesKey: string }
    ): Promise<any> => {
      // 动态导入axios
      const axios = (await import('axios')).default;
      
      // 加密业务数据
      const encryptedData = CryptoUtil.aes.encrypt(data, sessionKey.aesKey);
      
      // 准备表单数据
      const formData = new URLSearchParams();
      formData.append('encryptedAESKey', sessionKey.encryptedAesKey);
      formData.append('encryptedData', encryptedData);
      
      // 发送请求
      return axios.post(url, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    }
  },

  /**
   * 诊断工具
   */
  diagnostics: {
    /**
     * 使用健壮性更强的方法尝试解密
     */
    robustDecrypt: (encryptedData: string, key: string): {
      success: boolean;
      data?: any;
      method?: string;
      error?: string;
    } => {
      // 默认解密
      const defaultResult = CryptoUtil.aes.decrypt(encryptedData, key);
      if (defaultResult.success) {
        return { ...defaultResult, method: 'default' };
      }
      
      // 如果默认方法失败，尝试不同的方法
      const decryptMethods = [
        // 方法1: 尝试直接使用密钥字符串
        {
          name: 'raw-key',
          decrypt: () => {
            return CryptoJS.AES.decrypt(encryptedData, key, {
              mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7
            });
          }
        },
        // 方法2: 使用Utf8编码的密钥
        {
          name: 'utf8-encoded-key',
          decrypt: () => {
            const keyBytes = CryptoJS.enc.Utf8.parse(key);
            return CryptoJS.AES.decrypt(encryptedData, keyBytes, {
              mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7
            });
          }
        }
      ];
      
      // 尝试所有方法
      for (const method of decryptMethods) {
        try {
          const decrypted = method.decrypt();
          const text = decrypted.toString(CryptoJS.enc.Utf8);
          
          if (text && text.length > 0) {
            try {
              return { 
                success: true, 
                data: JSON.parse(text), 
                method: method.name 
              };
            } catch {
              return { 
                success: true, 
                data: text, 
                method: method.name 
              };
            }
          }
        } catch (e) {
          // 忽略错误，继续尝试其他方法
        }
      }
      
      // 所有方法都失败
      return { 
        success: false, 
        error: '所有解密方法均失败'
      };
    },
    
    /**
     * 分析密钥特性
     */
    analyzeKey: (key: string): object => {
      return {
        length: key.length,
        byteSize: new TextEncoder().encode(key).length,
        isASCII: /^[\x00-\x7F]*$/.test(key),
        isBase64: /^[A-Za-z0-9+/=]+$/.test(key),
        isHex: /^[0-9A-Fa-f]+$/.test(key),
        isValid16ByteKey: key.length === 16,
        isValid32ByteKey: key.length === 32
      };
    }
  },
  
  /**
   * 测试工具
   */
  test: {
    /**
     * 简单的加解密循环测试
     */
    encryptionLoop: (data: any = { test: "测试数据", time: Date.now() }): {
      success: boolean;
      original: any;
      encrypted: string;
      decrypted?: any;
    } => {
      try {
        // 加密
        const encrypted = CryptoUtil.aes.encrypt(data);
        
        // 解密
        const decrypted = CryptoUtil.aes.decrypt(encrypted);
        
        // 验证
        const success = decrypted.success && 
          JSON.stringify(data) === JSON.stringify(decrypted.data);
        
        return {
          success,
          original: data,
          encrypted,
          decrypted: decrypted.data
        };
      } catch (error) {
        return {
          success: false,
          original: data,
          encrypted: '',
          error
        };
      }
    },
    
    /**
     * 测试UTF-8字符处理能力
     */
    utf8Support: (): boolean => {
      const testStrings = [
        "中文测试",
        "日本語テスト",
        "한국어 테스트",
        "こんにちは世界",
        "🔒🌍🚀",  // Emoji测试
        "Русский текст" // 俄语
      ];
      
      for (const text of testStrings) {
        try {
          const encrypted = CryptoUtil.aes.encrypt(text);
          const decrypted = CryptoUtil.aes.decrypt(encrypted);
          
          if (!decrypted.success || decrypted.data !== text) {
            console.error(`UTF-8测试失败: ${text}`);
            return false;
          }
        } catch (e) {
          console.error(`UTF-8测试异常: ${text}`, e);
          return false;
        }
      }
      
      return true;
    }
  }
};

// 导出便捷函数以简化使用
export const encrypt = CryptoUtil.aes.encrypt;
export const decrypt = CryptoUtil.aes.decrypt;

// 添加全局函数
if (typeof window !== 'undefined') {
  // 设置全局命名空间
  window['cryptoUtil'] = CryptoUtil;
  
  // 添加便捷全局函数
  window['encrypt'] = encrypt;
  window['decrypt'] = decrypt;
  
  // 测试函数
  window['testEncryption'] = CryptoUtil.test.encryptionLoop;
  window['testUtf8'] = CryptoUtil.test.utf8Support;
  window['analyzeKey'] = CryptoUtil.diagnostics.analyzeKey;
  window['robustDecrypt'] = CryptoUtil.diagnostics.robustDecrypt;
  
  // 显示帮助信息
  console.log('✅ 加密工具已加载，使用cryptoUtil访问所有功能');
  console.log('基础函数：encrypt(数据), decrypt(密文)');
  console.log('测试函数：testEncryption(), testUtf8()');
  console.log('诊断函数：analyzeKey(密钥), robustDecrypt(密文, 密钥)');
}
