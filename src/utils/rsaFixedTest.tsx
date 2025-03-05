import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';
import { formatToPEM } from './cryptoFormat';

/**
 * 专门用于测试RSA加密解密的工具
 * 针对无法解密问题进行排查
 */
export const RSAFixedTest = {
  /**
   * 测试直接加密解密字符串(不经过Base64编码)
   */
  testDirectEncryption: (
    message: string, 
    publicKey: string, 
    privateKey: string
  ) => {
    console.group('🔍 测试直接RSA加密解密（无Base64）');
    
    try {
      // 格式化密钥
      const formattedPublicKey = formatToPEM(publicKey, 'PUBLIC KEY');
      const formattedPrivateKey = formatToPEM(privateKey, 'PRIVATE KEY');
      
      console.log('1️⃣ 测试密钥格式化...');
      console.log(`公钥: ${formattedPublicKey.substring(0, 40)}...`);
      console.log(`私钥: ${formattedPrivateKey.substring(0, 40)}...`);
      
      // 创建加密器和解密器
      console.log('2️⃣ 创建加密解密实例...');
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(formattedPublicKey);
      
      const decryptor = new JSEncrypt();
      decryptor.setPrivateKey(formattedPrivateKey);
      
      // 加密
      console.log('3️⃣ 加密消息:', message);
      const encrypted = encryptor.encrypt(message);
      if (!encrypted) {
        throw new Error("加密失败");
      }
      console.log('加密结果:', encrypted);
      
      // 解密
      console.log('4️⃣ 解密消息...');
      const decrypted = decryptor.decrypt(encrypted);
      console.log('解密结果:', decrypted);
      
      // 验证结果
      const success = decrypted === message;
      console.log('验证结果:', success ? '✅ 成功' : '❌ 失败');
      
      if (!success) {
        console.log('期望得到:', message);
        console.log('实际得到:', decrypted);
      }
      
      console.groupEnd();
      return {
        success,
        message,
        encrypted,
        decrypted
      };
    } catch (error) {
      console.error('测试过程出错:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 测试通过Base64编码后再加密
   * 这是我们实际系统中使用的方式
   */
  testBase64Encryption: (
    message: string,
    publicKey: string,
    privateKey: string
  ) => {
    console.group('🔍 测试Base64编码后RSA加密解密');
    
    try {
      // 格式化密钥
      const formattedPublicKey = formatToPEM(publicKey, 'PUBLIC KEY');
      const formattedPrivateKey = formatToPEM(privateKey, 'PRIVATE KEY');
      
      console.log('1️⃣ 编码消息为Base64...');
      console.log('原始消息:', message);
      
      // Base64编码 - CryptoJS实现
      const words = CryptoJS.enc.Utf8.parse(message);
      const base64Message = CryptoJS.enc.Base64.stringify(words);
      console.log('Base64编码结果:', base64Message);
      
      // 创建加密器
      console.log('2️⃣ 加密Base64编码后的消息...');
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(formattedPublicKey);
      
      // 加密Base64消息
      const encrypted = encryptor.encrypt(base64Message);
      if (!encrypted) {
        throw new Error("加密Base64消息失败");
      }
      console.log('加密结果:', encrypted);
      
      // 解密
      console.log('3️⃣ 解密密文...');
      const decryptor = new JSEncrypt();
      decryptor.setPrivateKey(formattedPrivateKey);
      
      const decryptedBase64 = decryptor.decrypt(encrypted);
      console.log('解密得到的Base64:', decryptedBase64);
      
      // 检查解密是否成功
      if (!decryptedBase64) {
        console.error('❌ 解密失败，无法获得Base64消息');
        console.groupEnd();
        return {
          success: false,
          error: '解密失败'
        };
      }
      
      // 验证Base64结果
      const base64Match = decryptedBase64 === base64Message;
      console.log('Base64匹配:', base64Match ? '✅ 是' : '❌ 否');
      
      // 从Base64解码回原文
      console.log('4️⃣ 从Base64解码回原文...');
      
      try {
        const decryptedWords = CryptoJS.enc.Base64.parse(decryptedBase64);
        const decryptedUtf8 = CryptoJS.enc.Utf8.stringify(decryptedWords);
        console.log('解码后的原文:', decryptedUtf8);
        
        // 验证与原始消息是否匹配
        const messageMatch = decryptedUtf8 === message;
        console.log('原文匹配:', messageMatch ? '✅ 是' : '❌ 否');
        
        console.groupEnd();
        return {
          success: base64Match && messageMatch,
          originalMessage: message,
          base64Message,
          encrypted,
          decryptedBase64,
          decryptedMessage: decryptedUtf8
        };
      } catch (error) {
        console.error('Base64解码失败:', error);
        console.groupEnd();
        return {
          success: false,
          error: 'Base64解码失败: ' + error.message
        };
      }
    } catch (error) {
      console.error('测试过程出错:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 系统化测试，检查不同的密钥格式和加密库实现
   * 找出问题所在
   */
  debugRSAImplementation: (publicKey: string, privateKey: string) => {
    console.group('🔎 系统化RSA实现调试');
    
    try {
      // 测试数据
      const testMessage = 'ABCDEFGHABCDEFGH';  // 测试AES密钥格式
      
      // 1. 测试不同格式的密钥
      const keyFormats = [
        {
          name: '原始格式',
          publicKey,
          privateKey
        },
        {
          name: 'PEM格式(标准头尾)',
          publicKey: formatToPEM(publicKey, 'PUBLIC KEY'),
          privateKey: formatToPEM(privateKey, 'PRIVATE KEY')
        },
        {
          name: 'PKCS#8格式',
          publicKey: formatToPEM(publicKey, 'PUBLIC KEY'),
          privateKey: formatToPEM(privateKey, 'PRIVATE KEY')
        }
      ];
      
      // 2. 测试不同的加密库实现
      const implementations = [
        {
          name: 'JSEncrypt标准',
          encrypt: (msg, pubKey) => {
            const enc = new JSEncrypt();
            enc.setPublicKey(pubKey);
            return enc.encrypt(msg);
          },
          decrypt: (cipher, privKey) => {
            const dec = new JSEncrypt();
            dec.setPrivateKey(privKey);
            return dec.decrypt(cipher);
          }
        }
      ];
      
      // 3. 测试不同的编码方式
      const encodings = [
        {
          name: '直接字符串',
          encode: (str) => str,
          decode: (str) => str
        },
        {
          name: 'UTF-8→Base64',
          encode: (str) => {
            const words = CryptoJS.enc.Utf8.parse(str);
            return CryptoJS.enc.Base64.stringify(words);
          },
          decode: (base64) => {
            const words = CryptoJS.enc.Base64.parse(base64);
            return CryptoJS.enc.Utf8.stringify(words);
          }
        },
        {
          name: 'UTF-8→Hex',
          encode: (str) => {
            const words = CryptoJS.enc.Utf8.parse(str);
            return CryptoJS.enc.Hex.stringify(words);
          },
          decode: (hex) => {
            const words = CryptoJS.enc.Hex.parse(hex);
            return CryptoJS.enc.Utf8.stringify(words);
          }
        }
      ];
      
      // 执行系统化测试
      console.log('开始系统化测试，共测试 ' +
        `${keyFormats.length} 种密钥格式 × ` +
        `${implementations.length} 种实现 × ` +
        `${encodings.length} 种编码 = ` +
        `${keyFormats.length * implementations.length * encodings.length} 种组合`);
      
      const results = [];
      
      // 系统化测试所有组合
      for (const keyFormat of keyFormats) {
        for (const impl of implementations) {
          for (const encoding of encodings) {
            console.log(`测试: ${keyFormat.name} + ${impl.name} + ${encoding.name}`);
            
            try {
              // 编码消息
              const encodedMessage = encoding.encode(testMessage);
              console.log(`- 编码后消息: ${encodedMessage}`);
              
              // 加密
              const encrypted = impl.encrypt(encodedMessage, keyFormat.publicKey);
              console.log(`- 加密结果: ${encrypted?.substring(0, 20)}...`);
              
              if (!encrypted) {
                throw new Error('加密失败');
              }
              
              // 解密
              const decrypted = impl.decrypt(encrypted, keyFormat.privateKey);
              console.log(`- 解密结果: ${decrypted}`);
              
              if (!decrypted) {
                throw new Error('解密失败');
              }
              
              // 解码
              const decodedMessage = encoding.decode(decrypted);
              console.log(`- 解码后消息: ${decodedMessage}`);
              
              // 验证
              const success = decodedMessage === testMessage;
              console.log(`- 验证结果: ${success ? '✅ 成功' : '❌ 失败'}`);
              
              results.push({
                keyFormat: keyFormat.name,
                implementation: impl.name,
                encoding: encoding.name,
                success,
                encodedMessage,
                encrypted,
                decrypted,
                decodedMessage
              });
            } catch (error) {
              console.error(`- 错误: ${error.message}`);
              results.push({
                keyFormat: keyFormat.name,
                implementation: impl.name,
                encoding: encoding.name,
                success: false,
                error: error.message
              });
            }
            
            console.log('-'.repeat(40));
          }
        }
      }
      
      // 总结结果
      const successCount = results.filter(r => r.success).length;
      console.log(`测试完成: ${successCount}/${results.length} 成功`);
      
      if (successCount === 0) {
        console.error('❌ 所有测试均失败，这可能表明RSA密钥对真的不匹配');
      } else if (successCount < results.length) {
        console.warn('⚠️ 部分测试成功，请检查成功案例的详细信息');
        
        // 找出成功的案例
        const successful = results.filter(r => r.success);
        console.log('成功的组合:');
        successful.forEach((result, index) => {
          console.log(`${index+1}. ${result.keyFormat} + ${result.implementation} + ${result.encoding}`);
        });
      } else {
        console.log('✅ 所有测试均成功');
      }
      
      console.groupEnd();
      return {
        success: successCount > 0,
        successCount,
        totalTests: results.length,
        results
      };
      
    } catch (error) {
      console.error('调试过程出错:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 混合加密系统测试，模拟完整的业务逻辑
   */
  testHybridSystem: (data: any, publicKey: string, privateKey: string) => {
    console.group('🧪 混合加密系统完整测试');
    
    try {
      // 测试会话密钥
      const sessionKey = 'ABCDEFGHABCDEFGH';
      console.log('使用固定会话密钥:', sessionKey);
      
      // 1. 准备AES密钥的Base64编码
      console.log('1️⃣ Base64编码AES密钥...');
      const words = CryptoJS.enc.Utf8.parse(sessionKey);
      const base64Key = CryptoJS.enc.Base64.stringify(words);
      console.log('Base64编码后的密钥:', base64Key);
      
      // 2. 使用RSA加密Base64编码后的AES密钥
      console.log('2️⃣ 使用RSA加密Base64密钥...');
      const jsEncrypt = new JSEncrypt();
      jsEncrypt.setPublicKey(formatToPEM(publicKey, 'PUBLIC KEY'));
      
      const encryptedAESKey = jsEncrypt.encrypt(base64Key);
      if (!encryptedAESKey) {
        throw new Error('RSA加密AES密钥失败');
      }
      console.log('加密后的AES密钥:', encryptedAESKey);
      
      // 3. 使用AES加密业务数据
      console.log('3️⃣ 使用AES加密业务数据...');
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      
      const keyBytes = CryptoJS.enc.Utf8.parse(sessionKey);
      const encrypted = CryptoJS.AES.encrypt(dataStr, keyBytes, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const encryptedData = encrypted.toString();
      console.log('AES加密后的数据:', encryptedData);
      
      // 4. 使用RSA私钥解密AES密钥
      console.log('4️⃣ 使用RSA私钥解密AES密钥...');
      const decryptor = new JSEncrypt();
      decryptor.setPrivateKey(formatToPEM(privateKey, 'PRIVATE KEY'));
      
      const decryptedBase64Key = decryptor.decrypt(encryptedAESKey);
      if (!decryptedBase64Key) {
        throw new Error('RSA解密AES密钥失败');
      }
      console.log('解密后的Base64密钥:', decryptedBase64Key);
      
      // 验证Base64密钥是否匹配
      const base64Match = decryptedBase64Key === base64Key;
      console.log('Base64密钥匹配:', base64Match ? '✅ 成功' : '❌ 失败');
      
      if (!base64Match) {
        console.log('期望:', base64Key);
        console.log('实际:', decryptedBase64Key);
      }
      
      // 5. 从Base64解码回原始AES密钥
      console.log('5️⃣ 从Base64解码回原始AES密钥...');
      const decryptedKeyWords = CryptoJS.enc.Base64.parse(decryptedBase64Key);
      const decryptedKey = CryptoJS.enc.Utf8.stringify(decryptedKeyWords);
      console.log('解码后的原始AES密钥:', decryptedKey);
      
      // 验证原始密钥是否匹配
      const keyMatch = decryptedKey === sessionKey;
      console.log('原始AES密钥匹配:', keyMatch ? '✅ 成功' : '❌ 失败');
      
      // 6. 使用解密出的AES密钥解密业务数据
      console.log('6️⃣ 使用AES密钥解密业务数据...');
      
      // 使用解密出的密钥
      const decryptedKeyBytes = CryptoJS.enc.Utf8.parse(decryptedKey);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, decryptedKeyBytes, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // 修复这一行，完成未完成的代码
      const decryptedDataStr = decrypted.toString(CryptoJS.enc.Utf8);
      console.log('解密后的数据:', decryptedDataStr);
      
      // 尝试解析为JSON对象
      let decryptedData;
      try {
        decryptedData = JSON.parse(decryptedDataStr);
        console.log('解析为JSON成功:', decryptedData);
      } catch (error) {
        console.log('不是有效的JSON，使用原始字符串:', decryptedDataStr);
        decryptedData = decryptedDataStr;
      }
      
      // 验证数据是否匹配
      const originalStr = typeof data === 'string' ? data : JSON.stringify(data);
      const finalStr = typeof decryptedData === 'string' ? decryptedData : JSON.stringify(decryptedData);
      const dataMatch = originalStr === finalStr;
      console.log('数据匹配:', dataMatch ? '✅ 成功' : '❌ 失败');
      
      if (!dataMatch) {
        console.log('期望:', originalStr);
        console.log('实际:', finalStr);
      }
      
      const success = base64Match && keyMatch && dataMatch;
      console.log('完整流程测试:', success ? '✅ 全部通过' : '❌ 部分失败');
      
      console.groupEnd();
      return {
        success,
        base64Match,
        keyMatch,
        dataMatch,
        originalData: data,
        decryptedData,
        sessionKey,
        decryptedKey
      };
    } catch (error) {
      console.error('测试过程出错:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  }
};