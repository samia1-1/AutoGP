import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

/**
 * 生成一个16字节的随机 AES 对称密钥
 */
export const generateSymmetricKey = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * 利用 RSA 公钥对 AES 对称密钥进行加密
 * @param symmetricKey 对称密钥
 * @param publicKey RSA 公钥字符串
 * @returns 加密后的对称密钥
 */
export const encryptSymmetricKeyWithRSA = (symmetricKey: string, publicKey: string): string => {
  try {
    const jsEncrypt = new JSEncrypt();
    
    // 处理公钥格式
    let formattedKey = publicKey.trim();
    if (!formattedKey.includes('BEGIN PUBLIC KEY')) {
      formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
    }
    
    console.log('设置RSA公钥...');
    jsEncrypt.setPublicKey(formattedKey);
    
    // 先进行测试加密
    const testResult = jsEncrypt.encrypt('test');
    if (!testResult) {
      console.error('RSA公钥测试失败');
      throw new Error('RSA公钥验证失败');
    }
    
    // 加密实际的对称密钥
    const encrypted = jsEncrypt.encrypt(symmetricKey);
    if (!encrypted) {
      console.error('对称密钥加密失败');
      throw new Error('RSA加密对称密钥失败');
    }
    
    return encrypted;
  } catch (error) {
    console.error('RSA加密过程出错:', error);
    throw error;
  }
}

/**
 * 使用 AES 加密数据
 * @param data 要加密的数据，字符串格式
 * @param key AES 对称密钥
 * @returns AES 加密后的密文
 */
export const aesEncrypt = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * 可选：使用 AES 解密数据
 * @param ciphertext 加密密文
 * @param key AES 对称密钥
 * @returns 解密后的明文
 */
export const aesDecrypt = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}