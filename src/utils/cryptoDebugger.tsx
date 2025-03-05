import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';
import CryptoHybrid from './cryptoHybrid';
import { formatToPEM } from './cryptoFormat';

/**
 * RSA加解密调试工具
 * 整合所有加密相关的调试和测试功能
 */
const RSADebugger = {
  /**
   * 逐步分析RSA加密逻辑，精确定位问题所在
   */
  analyzeRSAEncryptionFlow: (
    aesKey: string, 
    publicKey: string, 
    privateKey: string
  ) => {
    console.group('🔍 RSA加密流程深度分析');
    
    try {
      // 1. 输入参数检查
      console.log('1️⃣ 检查输入参数');
      
      const aesKeyDetails = {
        value: aesKey,
        length: aesKey.length,
        byteLength: new TextEncoder().encode(aesKey).length
      };
      console.log('AES密钥:', aesKeyDetails);
      
      if (aesKey.length !== 16) {
        console.warn('⚠️ AES密钥长度不是标准的16字节');
      }
      
      // 2. 密钥对验证
      console.log('2️⃣ 验证RSA密钥对');
      
      // 使用一个简单消息验证密钥对
      const testMessage = 'RSATestMessage';
      
      // 格式化密钥
      const formattedPublicKey = formatToPEM(publicKey, 'PUBLIC KEY');
      const formattedPrivateKey = formatToPEM(privateKey, 'PRIVATE KEY');
      
      // 创建加密实例
      const publicEncryptor = new JSEncrypt();
      publicEncryptor.setPublicKey(formattedPublicKey);
      
      const privateDecryptor = new JSEncrypt();
      privateDecryptor.setPrivateKey(formattedPrivateKey);
      
      // 测试加密解密
      const testEncrypted = publicEncryptor.encrypt(testMessage);
      const testDecrypted = privateDecryptor.decrypt(testEncrypted);
      
      const keyPairValid = testMessage === testDecrypted;
      console.log('密钥对加解密测试:', keyPairValid ? '✅ 成功' : '❌ 失败');
      
      if (!keyPairValid) {
        console.error('RSA密钥对无法正确加解密');
        console.log('- 原始消息:', testMessage);
        console.log('- 解密结果:', testDecrypted);
        // 提前返回
        console.groupEnd();
        return {
          success: false,
          stage: 'key-pair-validation',
          error: '密钥对无效'
        };
      }
      
      // 3. 检查Base64编码过程
      console.log('3️⃣ 检查Base64编码过程');
      
      // 直接使用密钥
      const directEncrypted = publicEncryptor.encrypt(aesKey);
      console.log('直接加密AES密钥:', directEncrypted);
      
      // CryptoHybrid实现中的Base64编码
      const base64Key = CryptoHybrid.common.utf8ToBase64(aesKey);
      console.log('Base64编码AES密钥:', base64Key);
      
      // 使用Base64编码后加密 (业务逻辑中的流程)
      const base64Encrypted = publicEncryptor.encrypt(base64Key);
      console.log('加密Base64编码后的密钥:', base64Encrypted);
      
      // 4. 检查解密过程
      console.log('4️⃣ 检查解密过程');
      
      // 解密直接加密的密钥
      const directDecrypted = privateDecryptor.decrypt(directEncrypted);
      const directSuccess = directDecrypted === aesKey;
      console.log('直接加密方式解密:', directSuccess ? '✅ 成功' : '❌ 失败');
      console.log('- 解密结果:', directDecrypted);
      
      // 解密Base64编码后加密的密钥
      const base64Decrypted = privateDecryptor.decrypt(base64Encrypted);
      const base64Success = base64Decrypted === base64Key;
      console.log('Base64编码方式解密:', base64Success ? '✅ 成功' : '❌ 失败');
      console.log('- 解密结果:', base64Decrypted);
      
      if (base64Success) {
        // 解码Base64
        try {
          const decodedKey = CryptoHybrid.common.base64ToUtf8(base64Decrypted);
          const decodeSuccess = decodedKey === aesKey;
          console.log('Base64解码:', decodeSuccess ? '✅ 成功' : '❌ 失败');
          console.log('- 解码结果:', decodedKey);
        } catch (e) {
          console.error('Base64解码失败:', e);
        }
      }
      
      // 5. 与业务代码流程对比
      console.log('5️⃣ 业务代码流程验证');
      
      // 使用CryptoHybrid模块的完整业务流程
      const businessResult = (() => {
        // 使用相同的密钥设定
        CryptoHybrid.configure({ 
          useFixedKey: true, 
          fixedKey: aesKey
        });
        
        // 测试数据
        const sampleData = { test: "sample" };
        
        // 业务加密过程
        const { encryptedAESKey, encryptedData, sessionKey } = 
          CryptoHybrid.hybrid.prepareEncryptedData(sampleData, publicKey);
        
        // 验证加密结果
        return {
          encryptedAESKey,
          sessionKey,
          match: sessionKey === aesKey
        };
      })();
      
      console.log('业务流程加密结果:', businessResult);
      console.log('业务密钥匹配:', businessResult.match ? '✅ 是' : '❌ 否');
      
      // 尝试解密业务流程中加密的密钥
      const businessDecrypted = privateDecryptor.decrypt(businessResult.encryptedAESKey);
      console.log('业务加密的密钥解密结果:', businessDecrypted);
      
      // 检查解密后的base64密钥是否能解码为原始密钥
      if (businessDecrypted) {
        try {
          const decodedBusinessKey = CryptoHybrid.common.base64ToUtf8(businessDecrypted);
          const businessKeyMatch = decodedBusinessKey === businessResult.sessionKey;
          console.log('业务密钥完整解密流程:', businessKeyMatch ? '✅ 成功' : '❌ 失败');
          console.log('- 解码后的密钥:', decodedBusinessKey);
        } catch (e) {
          console.error('解码业务密钥失败:', e);
        }
      }
      
      // 6. 诊断与修复建议
      console.log('6️⃣ 诊断与修复建议');
      
      const issues = [];
      const recommendations = [];
      
      if (!keyPairValid) {
        issues.push('RSA密钥对无效');
        recommendations.push('重新生成匹配的RSA密钥对');
      }
      
      if (!directSuccess) {
        issues.push('直接RSA加密/解密失败');
        recommendations.push('检查RSA实现，确保密钥格式正确');
      }
      
      if (!base64Success) {
        issues.push('Base64编码的密钥加密/解密失败');
        recommendations.push('检查UTF-8编码和Base64转换过程');
      }
      
      if (businessDecrypted !== base64Key) {
        issues.push('业务流程加密的密钥解密结果不符合预期');
        recommendations.push('检查业务代码中的密钥处理流程');
        recommendations.push('确保加密前的Base64编码与解密后的解码过程匹配');
      }
      
      if (issues.length === 0) {
        console.log('✅ 未发现问题，RSA加解密流程正常');
      } else {
        console.log('❌ 发现问题:');
        issues.forEach(issue => console.log(`- ${issue}`));
        console.log('建议修复:');
        recommendations.forEach(rec => console.log(`- ${rec}`));
      }
      
      console.groupEnd();
      return {
        success: issues.length === 0,
        directEncryption: directSuccess,
        base64Encryption: base64Success,
        businessFlow: businessDecrypted === base64Key,
        issues,
        recommendations
      };
      
    } catch (error) {
      console.error('分析过程发生错误:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 验证完整的混合加密流程
   */
  testHybridEncryptionFlow: (data: any, publicKey: string, privateKey: string) => {
    console.group('🔄 混合加密流程测试');
    try {
      // 1. 记录初始参数
      console.log('测试数据:', data);
      
      // 2. 配置CryptoHybrid使用固定密钥
      CryptoHybrid.configure({ 
        useFixedKey: true, 
        fixedKey: 'ABCDEFGHABCDEFGH'
      });
      
      // 3. 执行加密
      console.log('1️⃣ 执行加密流程');
      const { encryptedAESKey, encryptedData, sessionKey } = 
        CryptoHybrid.hybrid.prepareEncryptedData(data, publicKey);
      
      console.log('加密结果:');
      console.log('- 会话密钥:', sessionKey);
      console.log('- 加密的AES密钥:', encryptedAESKey);
      console.log('- 加密的数据:', encryptedData);
      
      // 4. RSA解密AES密钥
      console.log('2️⃣ 使用RSA私钥解密AES密钥');
      const privateDecryptor = new JSEncrypt();
      privateDecryptor.setPrivateKey(formatToPEM(privateKey, 'PRIVATE KEY'));
      
      const decryptedBase64Key = privateDecryptor.decrypt(encryptedAESKey);
      console.log('解密的Base64密钥:', decryptedBase64Key);
      
      if (!decryptedBase64Key) {
        console.error('❌ RSA解密失败');
        console.groupEnd();
        return { 
          success: false, 
          stage: 'rsa-decryption',
          error: 'RSA解密失败' 
        };
      }
      
      // 5. 解码Base64密钥
      console.log('3️⃣ 解码Base64密钥');
      try {
        const decodedKey = CryptoHybrid.common.base64ToUtf8(decryptedBase64Key);
        console.log('解码后的密钥:', decodedKey);
        console.log('原始会话密钥:', sessionKey);
        
        const keyMatch = decodedKey === sessionKey;
        console.log('密钥匹配:', keyMatch ? '✅ 是' : '❌ 否');
        
        if (!keyMatch) {
          console.error('❌ 解码后的密钥与原始会话密钥不匹配');
          console.groupEnd();
          return { 
            success: false, 
            stage: 'key-match',
            error: '密钥不匹配' 
          };
        }
      } catch (e) {
        console.error('❌ Base64解码失败:', e);
        console.groupEnd();
        return { 
          success: false, 
          stage: 'base64-decoding',
          error: e.message 
        };
      }
      
      // 6. AES解密数据
      console.log('4️⃣ 使用AES密钥解密数据');
      const decryptResult = CryptoHybrid.aes.decrypt(encryptedData, sessionKey);
      
      if (!decryptResult.success) {
        console.error('❌ AES解密失败:', decryptResult.error);
        console.groupEnd();
        return { 
          success: false, 
          stage: 'aes-decryption',
          error: decryptResult.error 
        };
      }
      
      console.log('解密数据:', decryptResult.data);
      
      // 7. 验证解密结果
      const originalStr = JSON.stringify(data);
      const decryptedStr = JSON.stringify(decryptResult.data);
      const dataMatch = originalStr === decryptedStr;
      
      console.log('数据匹配:', dataMatch ? '✅ 是' : '❌ 否');
      
      if (!dataMatch) {
        console.log('- 原始数据:', originalStr);
        console.log('- 解密数据:', decryptedStr);
        console.groupEnd();
        return { 
          success: false, 
          stage: 'data-match',
          error: '数据不匹配' 
        };
      }
      
      // 8. 完整流程通过
      console.log('✅ 混合加密流程测试通过');
      console.groupEnd();
      return {
        success: true,
        encryptedAESKey,
        encryptedData,
        sessionKey
      };
      
    } catch (error) {
      console.error('测试过程发生错误:', error);
      console.groupEnd();
      return { 
        success: false, 
        stage: 'unknown',
        error: error.message 
      };
    }
  },

  /**
   * 从rsaPrivateKeyChecker合并: 测试加密后AES密钥能否用私钥解密
   */
  canDecryptEncryptedAESKey: (encryptedAESKey: string, privateKey: string) => {
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(formatToPEM(privateKey, 'PRIVATE KEY'));
    const decryptedBase64Key = decryptor.decrypt(encryptedAESKey);
    if (!decryptedBase64Key) {
      return { success: false, error: '无法解密AES密钥' };
    }
    return { success: true, base64Key: decryptedBase64Key };
  },

  /**
   * 从cryptoDebug合并: 验证两种Base64编码实现之间的一致性
   */
  compareBase64Implementations: (str: string): boolean => {
    // 方法1: CryptoJS实现
    const cryptoJSImplementation = (() => {
      const words = CryptoJS.enc.Utf8.parse(str);
      return CryptoJS.enc.Base64.stringify(words);
    })();
    
    // 方法2: 浏览器原生实现
    const browserImplementation = btoa(unescape(encodeURIComponent(str)));
    
    // 比较结果
    const match = cryptoJSImplementation === browserImplementation;
    
    console.group('Base64编码实现对比');
    console.log('输入:', str);
    console.log('CryptoJS实现:', cryptoJSImplementation);
    console.log('浏览器原生实现:', browserImplementation);
    console.log('结果一致:', match ? '✅ 是' : '❌ 否');
    console.groupEnd();
    
    return match;
  },
  
  /**
   * 从testUtils合并: 使用与业务代码完全相同的方式加密数据
   * @param data 要加密的数据
   * @param publicKey 公钥（可选）
   */
  encryptWithBusinessLogic: (data: any, publicKey?: string) => {
    // 如果没有提供公钥，使用默认的服务器公钥
    let serverPublicKey = publicKey;
    if (!serverPublicKey) {
      try {
        // 尝试从request.tsx导入SERVER_PUBLIC_KEY
        const { SERVER_PUBLIC_KEY } = require('./request');
        serverPublicKey = SERVER_PUBLIC_KEY;
      } catch (error) {
        // 如果导入失败，使用默认的硬编码值
        serverPublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAz0N/LGPJ9EsJ8qVCgDWXbNBeuUPQcil0fIUBvNOYN80mbgeSSlHeYbRc2Z/GfV2zFWlEprTFXyv9h3GyvrRnx4xtLL2HiX2MQcR97h1bM4BgJeexvbjNs0YlZIck8r83Ar88FzY6wKda5NUzNcbRRm7gwgiDirCZnL+Byl7S0WVGuMpsCci5p49qs/L+/+biF5Hs5A+8+7yI+WN7NXAoaaCvufEOJdmUweCMlEqL0EXdQTkLKYB37kaWHbQSdA1r8XMHWBB8yJaj8yXWWAt+rGuKuCa10u3Gr8ckH5tA7UNU8dwVwMw229HcwNCBQzqWZbSoY+X91QGO6yymCkUQIDAQAB';
      }
    }
    
    // 启用固定密钥模式
    CryptoHybrid.configure({ 
      useFixedKey: true, 
      fixedKey: 'ABCDEFGHABCDEFGH'
    });
    
    // 固定会话密钥
    const sessionKey = 'ABCDEFGHABCDEFGH';
    
    // 加密AES密钥
    const base64Key = CryptoHybrid.common.utf8ToBase64(sessionKey);
    const encryptedAESKey = CryptoHybrid.keys.encryptWithRSA(base64Key, serverPublicKey);
    
    // 加密数据
    const encryptedData = CryptoHybrid.aes.encrypt(data, sessionKey);
    
    return {
      encryptedAESKey,
      encryptedData,
      sessionKey,
      request: {
        encryptedAESKey,
        encryptedData
      }
    };
  },

  /**
   * 便捷的登录测试工具
   */
  loginTest: (username: string, password: string) => {
    // 直接使用本地存储的公钥
    let publicKey;
    
    try {
      // 尝试从request.tsx导入SERVER_PUBLIC_KEY
      const { SERVER_PUBLIC_KEY } = require('./request');
      publicKey = SERVER_PUBLIC_KEY;
      console.log('使用本地存储的服务器公钥');
    } catch (error) {
      console.warn('无法导入服务器公钥，使用默认值');
      publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAz0N/LGPJ9EsJ8qVCgDWXbNBeuUPQcil0fIUBvNOYN80mbgeSSlHeYbRc2Z/GfV2zFWlEprTFXyv9h3GyvrRnx4xtLL2HiX2MQcR97h1bM4BgJeexvbjNs0YlZIck8r83Ar88FzY6wKda5NUzNcbRRm7gwgiDirCZnL+Byl7S0WVGuMpsCci5p49qs/L+/+biF5Hs5A+8+7yI+WN7NXAoaaCvufEOJdmUweCMlEqL0EXdQTkLKYB37kaWHbQSdA1r8XMHWBB8yJaj8yXWWAt+rGuKuCa10u3Gr8ckH5tA7UNU8dwVwMw229HcwNCBQzqWZbSoY+X91QGO6yymCkUQIDAQAB';
    }
    
    // 准备登录数据
    const loginData = { username, password };
    
    // 使用业务逻辑加密
    const result = RSADebugger.encryptWithBusinessLogic(loginData, publicKey);
    
    // 准备curl命令
    const curlCommand = `curl -X POST "http://218.199.69.63:39600/user/login" \\
    -H "Content-Type: application/json" \\
    -H "x-encrypted-request: true" \\
    -d '${JSON.stringify(result.request)}'`;
    
    console.group('🔐 登录测试工具');
    console.log('登录数据:', loginData);
    console.log('加密结果:', result);
    console.log('测试命令:', curlCommand);
    console.groupEnd();
    
    // 自动复制到剪贴板
    try {
      navigator.clipboard.writeText(curlCommand)
        .then(() => console.log('✅ 测试命令已复制到剪贴板'))
        .catch(err => console.error('❌ 复制失败:', err));
    } catch (e) {
      // 忽略错误
    }
    
    return result;
  },

  /**
   * 从cryptoDebug合并: 测试多个进程中密钥的一致性
   */
  testConcurrentEncryption: async (data: any) => {
    // 配置为使用固定密钥
    CryptoHybrid.configure({ 
      useFixedKey: true, 
      fixedKey: 'ABCDEFGHABCDEFGH'
    });
    
    // 多次加密同样的数据
    const results = [];
    
    for (let i = 0; i < 5; i++) {
      // 生成公钥 - 测试用固定公钥
      const mockPublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAz0N/LGPJ9EsJ8qVCgDWXbNBeuUPQcil0fIUBvNOYN80mbgeSSlHeYbRc2Z/GfV2zFWlEprTFXyv9h3GyvrRnx4xtLL2HiX2MQcR97h1bM4BgJeexvbjNs0YlZIck8r83Ar88FzY6wKda5NUzNcbRRm7gwgiDirCZnL+Byl7S0WVGuMpsCci5p49qs/L+/+biF5Hs5A+8+7yI+WN7NXAoaaCvufEOJdmUweCMlEqL0EXdQTkLKYB37kaWHbQSdA1r8XMHWBB8yJaj8yXWWAt+rGuKuCa10u3Gr8ckH5tA7UNU8dwVwMw229HcwNCBQzqWZbSoY+X91QGO6yymCkUQIDAQAB';
      
      // 使用业务代码加密
      const encryptResult = CryptoHybrid.hybrid.prepareEncryptedData(data, mockPublicKey);
      
      // 验证结果
      const decryptResult = CryptoHybrid.aes.decrypt(encryptResult.encryptedData, encryptResult.sessionKey);
      
      results.push({
        run: i + 1,
        encryptedAESKey: encryptResult.encryptedAESKey,
        encryptedData: encryptResult.encryptedData,
        sessionKey: encryptResult.sessionKey,
        decryptResult,
        success: decryptResult.success
      });
      
      // 短暂延迟，模拟实际网络环境
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 检查所有结果
    const allSucceeded = results.every(r => r.success);
    const allSameKey = results.every(r => r.sessionKey === results[0].sessionKey);
    const allSameEncryptedKey = results.every(r => r.encryptedAESKey === results[0].encryptedAESKey);
    
    console.group('🔄 并发加密一致性测试');
    console.log('所有请求加密成功:', allSucceeded ? '✅ 是' : '❌ 否');
    console.log('所有请求使用相同密钥:', allSameKey ? '✅ 是' : '❌ 否');
    console.log('所有请求产生相同加密密钥:', allSameEncryptedKey ? '✅ 是' : '❌ 否');
    console.log('详细结果:', results);
    console.groupEnd();
    
    return {
      allSucceeded,
      allSameKey,
      allSameEncryptedKey,
      results
    };
  },
  
  /**
   * 从cryptoDebug合并: 验证密钥在不同格式下是否生成相同加密结果
   */
  verifyKeyFormats: (data: any) => {
    const testKey = 'ABCDEFGHABCDEFGH'; // 16字节ASCII密钥
    
    // 不同格式的处理方式
    const testModes = [
      {
        name: 'UTF-8字符串',
        keyBytes: CryptoJS.enc.Utf8.parse(testKey)
      },
      {
        name: 'HEX解析',
        keyBytes: CryptoJS.enc.Hex.parse(Buffer.from(testKey).toString('hex'))
      }
    ];
    
    const encryptResults = {};
    const decryptResults = {};
    
    for (const mode of testModes) {
      // 加密测试
      try {
        // 加密数据
        const encrypted = CryptoJS.AES.encrypt(
          typeof data === 'string' ? data : JSON.stringify(data), 
          mode.keyBytes, 
          { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
        ).toString();
        
        encryptResults[mode.name] = encrypted;
        
        // 尝试解密
        const decrypted = CryptoJS.AES.decrypt(
          encrypted, 
          mode.keyBytes, 
          { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
        ).toString(CryptoJS.enc.Utf8);
        
        // 验证解密结果
        decryptResults[mode.name] = {
          success: true,
          data: decrypted
        };
      } catch (error) {
        encryptResults[mode.name] = `错误: ${error.message}`;
        decryptResults[mode.name] = {
          success: false,
          error: error.message
        };
      }
    }
    
    // 比较所有模式的输出是否一致
    const encryptedValues = Object.values(encryptResults);
    const firstValue = encryptedValues[0];
    const allEncryptSame = encryptedValues.every(value => value === firstValue);
    
    console.group('🔑 密钥格式一致性测试');
    console.log('所有格式产生相同加密结果:', allEncryptSame ? '✅ 是' : '❌ 否');
    console.log('加密结果:', encryptResults);
    console.log('解密结果:', decryptResults);
    console.groupEnd();
    
    return {
      allEncryptSame,
      encryptResults,
      decryptResults
    };
  },

  /**
   * 简化的测试工具 - 一键完成主要测试操作
   */
  quickTest: () => {
    console.group('🚀 快速加密测试');
    
    try {
      // 1. 使用默认测试数据
      const testData = { username: 'test', password: 'password123' };
      console.log('测试数据:', testData);
      
      // 2. 使用本地存储的公钥
      let serverPublicKey;
      try {
        const { SERVER_PUBLIC_KEY } = require('./request');
        serverPublicKey = SERVER_PUBLIC_KEY;
        console.log('使用本地存储的公钥:', serverPublicKey.substring(0, 20) + '...');
      } catch (error) {
        console.warn('无法导入服务器公钥，使用默认值');
        serverPublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAz0N/LGPJ9EsJ8qVCgDWXbNBeuUPQcil0fIUBvNOYN80mbgeSSlHeYbRc2Z/GfV2zFWlEprTFXyv9h3GyvrRnx4xtLL2HiX2MQcR97h1bM4BgJeexvbjNs0YlZIck8r83Ar88FzY6wKda5NUzNcbRRm7gwgiDirCZnL+Byl7S0WVGuMpsCci5p49qs/L+/+biF5Hs5A+8+7yI+WN7NXAoaaCvufEOJdmUweCMlEqL0EXdQTkLKYB37kaWHbQSdA1r8XMHWBB8yJaj8yXWWAt+rGuKuCa10u3Gr8ckH5tA7UNU8dwVwMw229HcwNCBQzqWZbSoY+X91QGO6yymCkUQIDAQAB';
      }
      
      // 3. 配置CryptoHybrid使用固定密钥
      const sessionKey = "ABCDEFGHABCDEFGH";
      CryptoHybrid.configure({ 
        useFixedKey: true, 
        fixedKey: sessionKey
      });
      
      // 4. 执行加密过程
      console.log('\n1️⃣ 执行加密流程...');
      const { encryptedAESKey, encryptedData } = CryptoHybrid.hybrid.prepareEncryptedData(
        testData, serverPublicKey
      );
      
      console.log('- 加密后的AES密钥:', encryptedAESKey);
      console.log('- 加密后的数据:', encryptedData.substring(0, 30) + '...');
      
      // 5. 通知测试限制
      console.log('\n2️⃣ RSA解密测试(已禁用)');
      console.log('⚠️ 注意：私钥解密测试已禁用，因为私钥仅在服务器端存在');
      
      // 6. 验证AES加解密
      console.log('\n3️⃣ 测试AES加解密功能...');
      const aesResult = CryptoHybrid.aes.decrypt(encryptedData, sessionKey);
      
      if (aesResult.success) {
        console.log('✅ AES解密成功');
        console.log('- 解密数据:', aesResult.data);
        
        // 验证数据是否正确
        const originalStr = JSON.stringify(testData);
        const decryptedStr = JSON.stringify(aesResult.data);
        const dataMatch = originalStr === decryptedStr;
        
        console.log('- 数据匹配:', dataMatch ? '✅ 是' : '❌ 否');
      } else {
        console.error('❌ AES解密失败:', aesResult.error);
      }
      
      // 7. 测试结果
      console.log('\n🔍 测试结果汇总:');
      console.log('- 公钥可用:', !!serverPublicKey ? '✅ 是' : '❌ 否');
      console.log('- AES加密成功:', !!encryptedData ? '✅ 是' : '❌ 否');
      console.log('- AES解密验证:', aesResult.success ? '✅ 通过' : '❌ 失败');
      console.log('- RSA测试:', '⚠️ 已禁用（需服务器验证）');
      
      console.groupEnd();
      return {
        success: aesResult.success,
        publicKey: serverPublicKey,
        encryptedData,
        encryptedAESKey,
        sessionKey,
        aesTestResult: aesResult
      };
    } catch (error) {
      console.error('测试过程中发生错误:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * 生成登录API请求体 - 方便进行接口测试
   */
  prepareLoginRequest: (username: string, password: string) => {
    // 使用本地存储的公钥
    let publicKey;
    
    try {
      const { SERVER_PUBLIC_KEY } = require('./request');
      publicKey = SERVER_PUBLIC_KEY;
    } catch (error) {
      console.warn('无法导入服务器公钥，使用默认值');
      publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAz0N/LGPJ9EsJ8qVCgDWXbNBeuUPQcil0fIUBvNOYN80mbgeSSlHeYbRc2Z/GfV2zFWlEprTFXyv9h3GyvrRnx4xtLL2HiX2MQcR97h1bM4BgJeexvbjNs0YlZIck8r83Ar88FzY6wKda5NUzNcbRRm7gwgiDirCZnL+Byl7S0WVGuMpsCci5p49qs/L+/+biF5Hs5A+8+7yI+WN7NXAoaaCvufEOJdmUweCMlEqL0EXdQTkLKYB37kaWHbQSdA1r8XMHWBB8yJaj8yXWWAt+rGuKuCa10u3Gr8ckH5tA7UNU8dwVwMw229HcwNCBQzqWZbSoY+X91QGO6yymCkUQIDAQAB';
    }
    
    // 使用业务逻辑加密
    const result = RSADebugger.encryptWithBusinessLogic(
      { username, password }, 
      publicKey
    );
    
    return {
      url: 'http://218.199.69.63:39600/user/login',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-encrypted-request': 'true' 
      },
      data: result.request,
      request: result.request,
      curlCommand: `curl -X POST "http://218.199.69.63:39600/user/login" \\\n  -H "Content-Type: application/json" \\\n  -H "x-encrypted-request: true" \\\n  -d '${JSON.stringify(result.request)}'`
    };
  },

  /**
   * 从request.tsx整合: 当请求失败时自动测试RSA加解密
   * 整合了请求中的测试功能，简化实现
   */
  testRequestEncryption: (
    originalData: any, 
    encryptedKey: string, 
    sessionKey: string, 
    publicKey: string, 
    privateKey: string
  ) => {
    console.group('🔍 请求失败 - 自动分析加密流程');
    
    try {
      // 1. 储存测试信息
      console.log('测试数据信息:');
      console.log('- 原始数据:', originalData);
      console.log('- 加密的AES密钥:', encryptedKey);
      console.log('- AES会话密钥:', sessionKey);
      console.log('- 使用的公钥:', publicKey.substring(0, 20) + '...');
      
      // 2. 检查AES密钥能否被解密
      console.log('\n1️⃣ 测试AES密钥解密...');
      const decryptResult = RSADebugger.canDecryptEncryptedAESKey(encryptedKey, privateKey);
      
      if (decryptResult.success) {
        console.log('✅ AES密钥解密成功');
        console.log('解密后的Base64密钥:', decryptResult.base64Key);
        
        // 3. 解码Base64密钥
        try {
          const decodedKey = CryptoHybrid.common.base64ToUtf8(decryptResult.base64Key);
          const keyMatch = decodedKey === sessionKey;
          console.log('\n2️⃣ 解码Base64密钥...');
          console.log('解码结果:', keyMatch ? '✅ 匹配' : '❌ 不匹配');
          console.log('- 原始密钥:', sessionKey);
          console.log('- 解码密钥:', decodedKey);
          
          // 4. 比对与原始AES密钥
          if (!keyMatch) {
            console.warn('⚠️ 解码后的密钥与会话密钥不匹配，可能是编码问题');
          }
        } catch (error) {
          console.error('❌ Base64解码失败:', error);
        }
      } else {
        console.error('❌ 私钥无法解密AES密钥:', decryptResult.error);
      }
      
      // 5. 执行全面诊断
      console.log('\n3️⃣ 执行完整RSA分析...');
      setTimeout(() => {
        RSADebugger.analyzeRSAEncryptionFlow(sessionKey, publicKey, privateKey);
      }, 0);
      
    } catch (error) {
      console.error('测试过程出错:', error);
    }
    
    console.groupEnd();
  },
  
  /**
   * 修改后不再提供默认测试私钥
   */
  getTestPrivateKey: () => {
    console.warn('⚠️ 警告：测试私钥功能已禁用。在生产环境中，私钥应只在服务器端存在。');
    return null;
  }

};

// 全局注册调试函数 - 保持所有功能可访问
if (typeof window !== 'undefined') {
  window['RSADebugger'] = RSADebugger;
  window['analyzeRSA'] = RSADebugger.analyzeRSAEncryptionFlow;
  window['testHybridEncryption'] = RSADebugger.testHybridEncryptionFlow;
  window['canDecryptEncryptedAESKey'] = RSADebugger.canDecryptEncryptedAESKey;
  window['testBase64'] = RSADebugger.compareBase64Implementations;
  window['encryptTest'] = RSADebugger.encryptWithBusinessLogic;
  window['loginTest'] = RSADebugger.loginTest;
  window['testConcurrency'] = RSADebugger.testConcurrentEncryption;
  window['testKeyFormats'] = RSADebugger.verifyKeyFormats;
  window['quickTest'] = RSADebugger.quickTest;
  window['prepareLogin'] = RSADebugger.prepareLoginRequest;
  window['testRequestEncryption'] = RSADebugger.testRequestEncryption;
  window['getTestPrivateKey'] = RSADebugger.getTestPrivateKey;
}

export default RSADebugger;
