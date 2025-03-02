import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

/**
 * 加密工具核心库 - 对象化封装
 */
export const CryptoHybrid = {
  /**
   * 配置参数
   */
  config: {
    defaultKeyLength: 16,
    logLevel: 'warning'
  },

  /**
   * 公共工具方法
   */
  common: {
    /**
     * 格式化RSA公钥
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
     */
    utf8ToBase64: (str: string): string => {
      const utf8Bytes = new TextEncoder().encode(str);
      return btoa(String.fromCharCode.apply(null, Array.from(utf8Bytes)));
    },
    
    /**
     * 从Base64解码为UTF-8字符串
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
    }
  },
  
  /**
   * 密钥管理
   */
  keys: {
    /**
     * 生成一个随机 AES 对称密钥
     */
    generateSymmetricKey: (length: number = 16): string => {
      return CryptoJS.lib.WordArray.random(length).toString();
    },
    
    /**
     * 利用 RSA 公钥对 AES 对称密钥进行加密
     */
    encryptWithRSA: (symmetricKey: string, publicKey: string): string => {
      try {
        const jsEncrypt = new JSEncrypt();
        jsEncrypt.setPublicKey(CryptoHybrid.common.formatRSAPublicKey(publicKey));
        const encrypted = jsEncrypt.encrypt(symmetricKey);
        if (!encrypted) throw new Error('RSA加密失败');
        return encrypted;
      } catch (error) {
        console.error('RSA加密过程出错:', error);
        throw error;
      }
    },
    
    /**
     * 为Java后端特别优化的密钥加密方法
     */
    encryptKeyForJava: (symmetricKey: string, publicKey: string): string => {
      // 调用encryptWithRSA即可
      return CryptoHybrid.keys.encryptWithRSA(symmetricKey, publicKey);
    }
  },
  
  /**
   * RSA加密功能
   */
  rsa: {
    /**
     * 使用公钥加密数据
     */
    encrypt: (data: string, publicKey: string): string => {
      // 直接调用已有的方法保持功能一致性
      return CryptoHybrid.keys.encryptWithRSA(data, publicKey);
    }
  },
  
  /**
   * AES加密功能
   */
  aes: {
    /**
     * AES 加密数据
     */
    encrypt: (data: any, key: string): string => {
      // 处理传入的数据，如果不是字符串则转为JSON
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      return CryptoJS.AES.encrypt(dataStr, key).toString();
    },
    
    /**
     * AES 解密数据
     */
    decrypt: (ciphertext: string, key: string): {
      success: boolean;
      data?: any;
      error?: string;
    } => {
      try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) {
          return { success: false, error: '解密结果为空' };
        }
        
        // 尝试解析JSON
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
  }
};

// 导出兼容函数以便向后兼容
export const generateSymmetricKey = CryptoHybrid.keys.generateSymmetricKey;
export const encryptSymmetricKeyWithRSA = CryptoHybrid.keys.encryptWithRSA;
export const aesEncrypt = CryptoHybrid.aes.encrypt;
export const aesDecrypt = (ciphertext: string, key: string): string => {
  const result = CryptoHybrid.aes.decrypt(ciphertext, key);
  if (!result.success) {
    throw new Error(result.error || '解密失败');
  }
  return typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
};

export default CryptoHybrid;