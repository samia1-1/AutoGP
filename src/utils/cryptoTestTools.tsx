import axios from 'axios';
import { CryptoHybrid } from './cryptoHybrid';

const formatRSAPublicKey = CryptoHybrid.common.formatRSAPublicKey;
const utf8ToBase64 = CryptoHybrid.common.utf8ToBase64;

/**
 * 精简版加密测试工具
 */
export const CryptoTestTools = {
  // 配置
  config: {
    serverUrl: 'http://218.199.69.63:39600',
    publicKeyEndpoint: '/getPublicKey',
    decryptEndpoint: '/decryptKey1',
    // 添加备选端点列表
    alternativeEndpoints: ['/decryptKey', '/api/decrypt', '/decrypt'],
    timeout: 15000,
    // 移除固定密钥配置，改为动态生成
    // defaultKey: 'ABCDEFGHABCDEFGH'
  },

  // 对外暴露的测试函数
  test: async (testData = { message: "Test data", timestamp: Date.now() }) => {
    // 随机生成测试密钥，提高安全性
    const testKey = CryptoHybrid.keys.generateSymmetricKey(16);
    
    console.log('🔬 开始加密测试...');
    console.log(`使用随机生成的AES密钥: ${testKey.length}字节`);
    
    try {
      // 将随机生成的密钥传递给测试函数
      // 1. 本地加密解密循环测试
      console.log('1. 测试本地加密解密...');
      const localResult = await testLocalEncryption(testData, testKey);
      
      if (!localResult.success) {
        console.error('❌ 本地加密解密测试失败:', localResult.error || '未知错误');
        return { success: false, error: localResult.error };
      }
      console.log('✅ 本地加密解密测试成功');
      
      // 2. 服务端通信测试
      console.log('2. 测试与服务端通信...');
      const serverResult = await testServerEncryption(testData, testKey);
      
      if (!serverResult.success) {
        console.error('❌ 服务端通信测试失败:', serverResult.error || '未知错误');
        return { 
          success: false, 
          localSuccess: true,
          serverSuccess: false,
          error: serverResult.error 
        };
      }
      console.log('✅ 服务端通信测试成功');
      
      // 返回完整结果
      return {
        success: true,
        localSuccess: localResult.success,
        serverSuccess: serverResult.success,
        details: {
          localTest: localResult,
          serverTest: serverResult
        }
      };
    } catch (error) {
      console.error('❌ 测试过程中出错:', error);
      return { success: false, error };
    }
  }
};

// 本地加密解密测试 - 添加密钥参数
async function testLocalEncryption(data, testKey) {
  try {
    const encrypted = CryptoHybrid.aes.encrypt(data, testKey);
    const decryptResult = CryptoHybrid.aes.decrypt(encrypted, testKey);
    
    if (!decryptResult.success) {
      return { success: false, error: decryptResult.error };
    }
    
    // 验证解密结果是否与原始数据一致
    const originalJson = JSON.stringify(data);
    const decryptedJson = JSON.stringify(decryptResult.data);
    const success = decryptedJson === originalJson;
    
    return {
      success,
      original: data,
      encrypted,
      decrypted: decryptResult.data,
      matches: success
    };
  } catch (error) {
    return { success: false, error };
  }
}

// 测试与服务器的加密通信 - 添加密钥参数
async function testServerEncryption(testData, testKey) {
  try {
    // 1. 获取公钥
    const response = await axios.get(
      `${CryptoTestTools.config.serverUrl}${CryptoTestTools.config.publicKeyEndpoint}`, 
      { timeout: CryptoTestTools.config.timeout }
    );
    
    // 提取公钥
    let publicKey;
    if (typeof response.data === 'string') {
      publicKey = response.data;
    } else if (response.data?.data) {
      publicKey = typeof response.data.data === 'string' ? 
        response.data.data : response.data.data.publicKey || '';
    } else {
      publicKey = response.data?.publicKey || '';
    }
    
    if (!publicKey) {
      throw new Error('无法从响应中提取公钥');
    }
    
    // 2. 格式化公钥并加密AES密钥
    const formattedPublicKey = formatRSAPublicKey(publicKey);
    // 使用传入的测试密钥而非config中的固定密钥
    const aesKey = testKey;
    console.log('2️⃣ 使用密钥:', aesKey, '(长度:', aesKey.length, '字节)');
    const base64Key = utf8ToBase64(aesKey);
    const encryptedAESKey = CryptoHybrid.rsa.encrypt(base64Key, formattedPublicKey);
    
    // 3. 加密测试数据
    const encryptedData = CryptoHybrid.aes.encrypt(testData, aesKey);
    
    // 4. 尝试使用多个端点发送请求...
    console.log('4. 尝试使用多个端点发送请求...');
    
    let lastError = null;
    const endpoints = [
      CryptoTestTools.config.decryptEndpoint, 
      ...CryptoTestTools.config.alternativeEndpoints
    ];
    
    // 去重端点
    const uniqueEndpoints = [...new Set(endpoints)];
    
    // 逐个尝试端点
    for (const endpoint of uniqueEndpoints) {
      try {
        console.log(`尝试端点: ${endpoint}...`);
        
        const jsonPayload = {
          encryptedAESKey: encryptedAESKey,
          encryptedData: encryptedData
        };
        
        // 添加详细请求日志
        console.group('📤 请求详情');
        console.log('URL:', `${CryptoTestTools.config.serverUrl}${endpoint}`);
        console.log('请求方法:', 'POST');
        
        // 请求头
        const headers = { 'Content-Type': 'application/json' };
        console.log('请求头:', headers);
        
        // 请求体
        console.log('请求体类型:', typeof jsonPayload);
        console.log('请求体结构:', Object.keys(jsonPayload));
        
        // 打印请求体数据详情
        console.group('请求体详情:');
        console.log('encryptedAESKey:', {
          value: jsonPayload.encryptedAESKey,
          length: jsonPayload.encryptedAESKey.length
        });
        console.log('encryptedData:', {
          value: jsonPayload.encryptedData,
          length: jsonPayload.encryptedData.length
        });
        console.groupEnd();
        
        // 将完整请求体转换为字符串，注意限制长度避免控制台卡死
        const payloadString = JSON.stringify(jsonPayload);
        console.log('完整请求体字符串长度:', payloadString.length);
        if (payloadString.length > 500) {
          console.log('请求体预览 (前500字符):', payloadString.substring(0, 500) + '...');
        } else {
          console.log('完整请求体:', payloadString);
        }
        
        console.groupEnd(); // 结束请求详情组
        
        const serverResponse = await axios.post(
          `${CryptoTestTools.config.serverUrl}${endpoint}`,
          jsonPayload,
          { 
            headers: headers,
            timeout: CryptoTestTools.config.timeout 
          }
        );
        
        // 处理成功响应...
        console.log(`✅ 成功使用端点: ${endpoint}`);
        
        // 增强服务器响应日志
        console.group('📥 服务器响应详情');
        console.log('状态码:', serverResponse.status, serverResponse.statusText);
        console.log('响应头:', serverResponse.headers);
        console.log('响应类型:', typeof serverResponse.data);
        
        if (typeof serverResponse.data === 'object') {
          console.log('响应数据结构:', Object.keys(serverResponse.data));
          console.log('完整响应数据:', JSON.stringify(serverResponse.data, null, 2));
        } else {
          console.log('响应内容:', serverResponse.data);
        }
        
        // 检查常见的API响应格式
        if (serverResponse.data?.code !== undefined) {
          console.log('API状态码:', serverResponse.data.code, 
            serverResponse.data.code === 200 ? '✅ 成功' : '❌ 失败');
        }
        if (serverResponse.data?.success !== undefined) {
          console.log('API成功标志:', serverResponse.data.success ? '✅ 成功' : '❌ 失败');
        }
        if (serverResponse.data?.message || serverResponse.data?.msg) {
          console.log('API消息:', serverResponse.data.message || serverResponse.data.msg);
        }
        
        console.groupEnd();
        
        // 5. 检查响应
        const serverSuccess = serverResponse.data && 
          (serverResponse.data.code === 200 || serverResponse.data.success === true);
        
        if (serverSuccess) {
          console.log('✅ 测试成功! 服务器能够正确解密数据');
        } else {
          console.error('❌ 测试失败! 服务器无法解密数据');
        }
        
        return {
          success: serverSuccess,
          endpoint: endpoint,
          serverResponse: serverResponse.data,
          encryptionDetails: {
            aesKey,
            encryptedAESKey,
            encryptedData
          }
        };
      } catch (error) {
        console.log(`❌ 端点 ${endpoint} 请求失败: ${error.message}`);
        lastError = error;
        // 继续尝试下一个端点
      }
    }
    
    // 所有端点都失败了，抛出最后一个错误
    throw lastError || new Error('所有端点请求均失败');
    
  } catch (error) {
    // 增强错误日志
    console.group('❌ 服务器请求失败');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    if (error.response) {
      console.error('服务器状态码:', error.response.status);
      console.error('服务器响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送但无响应');
    }
    console.groupEnd();
    
    return { 
      success: false, 
      error,
      errorDetails: error.message
    };
  }
}

// 注册全局函数
if (typeof window !== 'undefined') {
  window['cryptoTest'] = CryptoTestTools.test;
  
  // 重新添加原始的函数名称，指向同一个测试函数
  window['comprehensiveEncryptionTest'] = CryptoTestTools.test;
  
  console.log('🧪 加密测试工具已加载，请使用以下命令测试:');
  console.log('- cryptoTest() - 简化版测试');
  console.log('- comprehensiveEncryptionTest() - 兼容原测试名称');
}

export default CryptoTestTools;
