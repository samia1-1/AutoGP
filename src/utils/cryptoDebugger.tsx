// 移除未使用的导入
// import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';
import CryptoHybrid from './cryptoHybrid';
import { SERVER_PUBLIC_KEY } from './request';

// 工具常量和配置
const DEFAULT_SESSION_KEY = 'ABCDEFGHABCDEFGH';
const DEFAULT_PUBLIC_KEY = SERVER_PUBLIC_KEY || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMFliHCiiYlPIZ9Om8X8MnjcK9Lx4ESvRcI7gJDP18yLWEkx2ahzpOyE/gdztTXXzHoJ5dbB3NNw1q+HCyn0NUWloA1GNJJ6wT5WOsIEil8aWKAus+Rk+1jOkhHEVC7e0CTsE07iYkPkYzvS4qdR3BqFdmqg5A2I/UDdiRG8e535tMUkCdNCPffAzuxdT0A68mqc3wappLhVqhwhC2ToQzFAfCq8O+RQmZyvL6Bo4pyXAII1LXPTMUM/0jaXn8+TcjjdcGY9eaCDWuiuRcUuk6vzEvdRKuzKvarLhmpgrZWe4aTb7XCExpv7zDuq68f2X43ppvt94PFmrjt6XKjDTQIDAQAB';

// 结果类型定义
interface DebugResult<T = any> {
  success: boolean;
  error?: string;
  stage?: string;
  [key: string]: any;
  data?: T;
}

/**
 * RSA加解密调试工具
 * 整合所有加密相关的调试和测试功能
 */
const RSADebugger = {
  /**
   * 获取服务器公钥（如果可用）
   */
  getServerPublicKey(): string {
    return DEFAULT_PUBLIC_KEY;
  },

  /**
   * 初始化加密环境，包括设置固定密钥
   */
  initEncryptionEnvironment(sessionKey: string = DEFAULT_SESSION_KEY): void {
    CryptoHybrid.configure({ 
      useFixedKey: true, 
      fixedKey: sessionKey
    });
  },

  /**
   * 用于测试的加密函数，包装了整个加密流程
   */
  encryptData(data: any, publicKey?: string, sessionKey?: string): DebugResult {
    try {
      const usedPublicKey = publicKey || DEFAULT_PUBLIC_KEY;
      const usedSessionKey = sessionKey || DEFAULT_SESSION_KEY;
      
      // 初始化加密环境
      this.initEncryptionEnvironment(usedSessionKey);
      
      // 执行加密
      const result = CryptoHybrid.hybrid.prepareEncryptedData(data, usedPublicKey, usedSessionKey);
      
      return {
        success: true,
        ...result,
        request: {
          encryptedAESKey: result.encryptedAESKey,
          encryptedData: result.encryptedData
        }
      };
    } catch (error: any) { // 添加类型断言
      console.error('加密数据失败:', error);
      return {
        success: false,
        error: error.message,
        stage: 'encryption'
      };
    }
  },
  
  /**
   * 解密数据 - 仅限AES部分
   */
  decryptData(encryptedData: string, sessionKey: string): DebugResult {
    try {
      const result = CryptoHybrid.aes.decrypt(encryptedData, sessionKey);
      
      return {
        success: result.success,
        data: result.data,
        error: result.error
      };
    } catch (error: any) { // 添加类型断言
      return {
        success: false,
        error: error.message,
        stage: 'decryption'
      };
    }
  },
  
  /**
   * 快速测试加密流程 - 集成并简化版本
   */
  quickTest(publicKey?: string): DebugResult {
    console.group('🚀 加密系统快速测试');
    
    try {
      // 1. 测试数据和密钥
      const testData = { username: 'test', password: 'password123' };
      const sessionKey = DEFAULT_SESSION_KEY;
      const serverPublicKey = publicKey || DEFAULT_PUBLIC_KEY;
      
      console.log('测试数据:', testData);
      console.log('会话密钥:', sessionKey);
      console.log('公钥:', serverPublicKey.substring(0, 20) + '...');
      
      // 2. 初始化加密环境
      this.initEncryptionEnvironment(sessionKey);
      
      // 3. 执行加密
      console.log('\n1️⃣ 执行加密流程...');
      const encryptResult = this.encryptData(testData, serverPublicKey, sessionKey);
      
      if (!encryptResult.success) {
        console.error('❌ 加密失败:', encryptResult.error);
        console.groupEnd();
        return encryptResult;
      }
      
      const { encryptedAESKey, encryptedData } = encryptResult;
      console.log('加密结果:');
      console.log('- AES密钥(加密):', encryptedAESKey.substring(0, 20) + '...');
      console.log('- 数据(加密):', encryptedData.substring(0, 20) + '...');
      
      // 4. 测试AES解密
      console.log('\n2️⃣ 测试AES解密...');
      const decryptResult = this.decryptData(encryptedData, sessionKey);
      
      if (!decryptResult.success) {
        console.error('❌ 解密失败:', decryptResult.error);
        console.groupEnd();
        return {
          ...encryptResult,
          decryptSuccess: false,
          decryptError: decryptResult.error
        };
      }
      
      console.log('解密数据:', decryptResult.data);
      
      // 5. 验证数据匹配
      const originalStr = JSON.stringify(testData);
      const decryptedStr = JSON.stringify(decryptResult.data);
      const dataMatch = originalStr === decryptedStr;
      
      console.log('数据匹配:', dataMatch ? '✅ 是' : '❌ 否');
      
      if (!dataMatch) {
        console.log('- 原始:', originalStr);
        console.log('- 解密:', decryptedStr);
      }
      
      // 6. 生成测试报告
      const testReport = {
        encryptionWorking: true,
        decryptionWorking: decryptResult.success,
        dataIntegrity: dataMatch,
        performance: {
          encryptedKeySizeBytes: encryptedAESKey.length,
          encryptedDataSizeBytes: encryptedData.length
        }
      };
      
      console.log('\n🔍 测试报告:', testReport);
      
      // 7. 提供实用信息
      console.log('\n💡 使用提示:');
      console.log('- 复制加密数据: copyLastRequest()');
      console.log('- 测试登录请求: loginTest("username", "password")');
      
      console.groupEnd();
      return {
        success: true,
        encryptSuccess: true,
        decryptSuccess: decryptResult.success,
        dataMatch,
        encryptedAESKey,
        encryptedData,
        sessionKey,
        decryptedData: decryptResult.data,
        testReport
      };
    } catch (error: any) { // 添加类型断言
      console.error('测试过程中发生错误:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message,
        stage: 'test_execution'
      };
    }
  },
  
  /**
   * 生成登录API请求
   */
  loginTest(username: string, password: string): DebugResult {
    console.group('🔐 登录加密测试');
    
    try {
      // 1. 加密登录数据
      const loginData = { username, password };
      const encryptResult = this.encryptData(loginData);
      
      if (!encryptResult.success) {
        console.error('加密失败:', encryptResult.error);
        console.groupEnd();
        return encryptResult;
      }
      
      // 2. 生成API请求
      const request = {
        encryptedAESKey: encryptResult.encryptedAESKey,
        encryptedData: encryptResult.encryptedData
      };
      
      // 3. 生成curl命令
      const curlCommand = this.generateCurlCommand('/user/login', request);
      console.log('API请求体:', request);
      console.log('测试命令:', curlCommand);
      
      // 4. 尝试复制到剪贴板
      this.copyToClipboard(curlCommand, '登录命令');
      
      console.groupEnd();
      return {
        success: true,
        sessionKey: encryptResult.sessionKey,
        encryptedAESKey: encryptResult.encryptedAESKey,
        encryptedData: encryptResult.encryptedData,
        request,
        curlCommand
      };
    } catch (error: any) { // 添加类型断言
      console.error('登录测试失败:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message,
        stage: 'login_test'
      };
    }
  },
  
  /**
   * 生成curl命令
   */
  generateCurlCommand(endpoint: string, data: any): string {
    const baseUrl = 'http://218.199.69.63:39600';
    const url = `${baseUrl}${endpoint}`;
    
    return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "x-encrypted-request: true" \\
  -d '${JSON.stringify(data)}'`;
  },
  
  /**
   * 复制内容到剪贴板
   */
  copyToClipboard(text: string, description: string = '内容'): boolean {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => console.log(`✅ ${description}已复制到剪贴板`))
          .catch(err => console.error(`❌ 复制失败:`, err));
        return true;
      } else {
        console.warn('浏览器不支持Clipboard API');
        return false;
      }
    } catch (e: any) { // 添加类型断言
      console.error('复制失败:', e);
      return false;
    }
  },
  
  // 保留其他功能函数，但标记为已禁用
  testHybridEncryptionFlow: () => ({
    success: false, 
    error: '该功能已禁用，请使用quickTest替代'
  }),
  
  canDecryptEncryptedAESKey: () => ({
    success: false,
    error: '私钥解密功能已禁用'
  }),
  
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
  
  // 修改为使用新的encryptData
  encryptWithBusinessLogic: function(data: any, publicKey?: string): DebugResult {
    return this.encryptData(data, publicKey);
  },

  // 测试并发加密
  testConcurrentEncryption: async (data: any): Promise<DebugResult> => {
    console.group('🔄 并发加密测试');
    
    try {
      // 初始化加密环境
      CryptoHybrid.configure({ 
        useFixedKey: true, 
        fixedKey: DEFAULT_SESSION_KEY
      });
      
      const iterations = 5;
      console.log(`执行${iterations}次并发加密测试...`);
      
      // 多次加密同样的数据
      const promises = Array(iterations).fill(0).map(async (_, i) => {
        // 使用公钥加密
        try {
          const result = CryptoHybrid.hybrid.prepareEncryptedData(
            data, 
            DEFAULT_PUBLIC_KEY, 
            DEFAULT_SESSION_KEY
          );
          
          // 解密数据验证
          const decryptResult = CryptoHybrid.aes.decrypt(
            result.encryptedData, 
            result.sessionKey
          );
          
          return {
            run: i + 1,
            success: decryptResult.success,
            encryptedAESKey: result.encryptedAESKey,
            encryptedData: result.encryptedData,
            sessionKey: result.sessionKey
          };
        } catch (error: any) { // 添加类型断言
          return {
            run: i + 1,
            success: false,
            error: error.message
          };
        }
      });
      
      // 等待所有任务完成
      const results = await Promise.all(promises);
      
      // 分析结果
      const allSuccess = results.every(r => r.success);
      const allSameKey = results.every(r => r.sessionKey === results[0].sessionKey);
      const allSameEncryptedKey = results.every(r => r.encryptedAESKey === results[0].encryptedAESKey);
      
      // 输出结果摘要
      console.log('测试结果摘要:');
      console.log('- 全部加密成功:', allSuccess ? '✅ 是' : '❌ 否');
      console.log('- 使用相同会话密钥:', allSameKey ? '✅ 是' : '❌ 否');
      console.log('- 生成相同加密密钥:', allSameEncryptedKey ? '✅ 是' : '❌ 否');
      
      console.groupEnd();
      return {
        success: allSuccess,
        allSameKey,
        allSameEncryptedKey,
        results
      };
      
    } catch (error: any) { // 添加类型断言
      console.error('并发测试失败:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message,
        stage: 'concurrent_test'
      };
    }
  },
  
  // 不再提供测试私钥
  getTestPrivateKey: () => {
    console.warn('⚠️ 私钥已禁用，私钥应只存在于服务器端');
    return null;
  },
  
  // 准备登录请求
  prepareLoginRequest: function(username: string, password: string): DebugResult {
    try {
      // 使用登录测试函数
      const loginResult = this.loginTest(username, password);
      
      if (!loginResult.success) {
        return loginResult;
      }
      
      // 构建API请求参数
      return {
        success: true,
        url: 'http://218.199.69.63:39600/user/login',
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-encrypted-request': 'true' 
        },
        data: loginResult.request,
        request: loginResult.request,
        curlCommand: loginResult.curlCommand
      };
    } catch (error: any) { // 添加类型断言
      return {
        success: false,
        error: error.message,
        stage: 'prepare_login_request'
      };
    }
  },
  
  // 测试请求加密 - 简化版
  testRequestEncryption: function(
    originalData: any,
    encryptedKey: string,
    sessionKey: string
  ): DebugResult {
    console.group('🔍 请求加密调试');
    
    try {
      console.log('原始数据:', originalData);
      console.log('会话密钥:', sessionKey);
      console.log('加密AES密钥:', encryptedKey.substring(0, 20) + '...');
      
      // 仅测试AES部分
      console.log('\n测试AES解密功能:');
      
      // 加密流程 - 使用已知会话密钥重新加密原始数据
      const freshEncryptedData = CryptoHybrid.aes.encrypt(originalData, sessionKey);
      console.log('使用同一会话密钥重新加密:', freshEncryptedData.substring(0, 20) + '...');
      
      // 解密测试
      const decryptResult = CryptoHybrid.aes.decrypt(freshEncryptedData, sessionKey);
      
      if (decryptResult.success) {
        console.log('✅ AES解密成功');
        console.log('解密数据:', decryptResult.data);
      } else {
        console.error('❌ AES解密失败:', decryptResult.error);
      }
      
      console.groupEnd();
      return {
        success: decryptResult.success,
        encryptedData: freshEncryptedData,
        decryptedData: decryptResult.data,
        error: decryptResult.error
      };
    } catch (error: any) { // 添加类型断言
      console.error('测试失败:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message,
        stage: 'request_encryption_test'
      };
    }
  },
  
  // 验证AES密钥格式
  verifyKeyFormats: (data: any): DebugResult => {
    console.group('🔑 AES密钥格式测试');
    
    try {
      const testKey = DEFAULT_SESSION_KEY;
      console.log('测试密钥:', testKey);
      console.log('测试数据:', data);
      
      // 测试不同格式的AES密钥
      const formats = [
        {
          name: 'UTF-8字符串',
          key: testKey,
          bytes: CryptoJS.enc.Utf8.parse(testKey)
        },
        {
          name: 'Hex编码',
          key: Buffer.from(testKey).toString('hex'),
          bytes: CryptoJS.enc.Hex.parse(Buffer.from(testKey).toString('hex'))
        },
        {
          name: 'Base64编码',
          key: CryptoHybrid.common.utf8ToBase64(testKey),
          bytes: CryptoJS.enc.Base64.parse(CryptoHybrid.common.utf8ToBase64(testKey))
        }
      ];
      
      // 对每种格式进行测试
      const results = formats.map(format => {
        try {
          // 加密测试
          const encrypted = CryptoHybrid.aes.encrypt(data, format.key);
          
          // 解密测试
          const decryptResult = CryptoHybrid.aes.decrypt(encrypted, format.key);
          
          return {
            format: format.name,
            key: format.key,
            success: decryptResult.success,
            encryptedData: encrypted,
            decryptedData: decryptResult.data,
            error: decryptResult.error
          };
        } catch (error: any) { // 添加类型断言
          return {
            format: format.name,
            key: format.key,
            success: false,
            error: error.message
          };
        }
      });
      
      // 检查所有格式是否都成功
      const allSuccessful = results.every(r => r.success);
      console.log('所有格式测试结果:', allSuccessful ? '✅ 全部通过' : '❌ 部分失败');
      
      results.forEach(result => {
        console.log(`${result.format}: ${result.success ? '✅ 成功' : '❌ 失败'}`);
        if (!result.success) console.log(`  错误: ${result.error}`);
      });
      
      console.groupEnd();
      return {
        success: allSuccessful,
        formats: results
      };
    } catch (error: any) { // 添加类型断言
      console.error('密钥格式测试失败:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message,
        stage: 'key_format_test'
      };
    }
  }
};

// 全局注册调试函数 - 保持所有功能可访问
if (typeof window !== 'undefined') {
  // 创建相同方法的两种不同引用会增加内存使用
  window['RSADebugger'] = RSADebugger;
  
  // 精简全局注册函数列表，复用已有的bind函数
  const bindMethod = (method, name) => {
    window[name] = method.bind(RSADebugger);
  };
  
  // 活跃方法 - 保留核心功能
  bindMethod(RSADebugger.quickTest, 'quickTest');
  bindMethod(RSADebugger.loginTest, 'loginTest');
  bindMethod(RSADebugger.encryptData, 'encryptTest');
  bindMethod(RSADebugger.prepareLoginRequest, 'prepareLogin');
  bindMethod(RSADebugger.testRequestEncryption, 'testRequestEncryption');
  
  // 辅助方法 - 不需要bind的函数
  window['testBase64'] = RSADebugger.compareBase64Implementations;
  window['testKeyFormats'] = RSADebugger.verifyKeyFormats;
  window['testConcurrency'] = RSADebugger.testConcurrentEncryption;
  window['getTestPrivateKey'] = RSADebugger.getTestPrivateKey;
  
  // 已禁用的方法 - 统一返回一个警告
  const disabledMethod = (name) => {
    return () => {
      console.warn(`⚠️ 方法 ${name} 已禁用，请使用替代方法`);
      return { success: false, error: `${name} 已禁用` };
    };
  };
  
  window['analyzeRSA'] = disabledMethod('analyzeRSA');
  window['testHybridEncryption'] = disabledMethod('testHybridEncryption');
  window['canDecryptEncryptedAESKey'] = disabledMethod('canDecryptEncryptedAESKey');
}

export default RSADebugger;
