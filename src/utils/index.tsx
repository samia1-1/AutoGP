import { request } from "./request";
import CryptoDebugger from './cryptoDebugger';
import CryptoHybrid from './cryptoHybrid';
import CryptoValidator from './cryptoValidator';

// 基础工具导出
export * from './calculateDistance'
export * from './cornPlatformDetails'
export * from './downloadRecords'
export * from './file'
export * from './requireAuth'
export * from './token'
export * from './user'
export * from './cryptoHybrid'

// 加密相关导出
export {
  request,
  CryptoDebugger,  // 统一的调试工具
  CryptoHybrid,    // 核心加密库
  CryptoValidator  // 验证工具
}

// 注册主要调试函数到全局
if (typeof window !== 'undefined') {
  // 快速测试功能 - 移除硬编码公钥
  window['cryptoTest'] = async () => {
    console.group('🔍 加密功能快速测试');
    
    // 1. 测试数据
    const testData = { username: 'test', password: 'password123' };
    
    // 2. 从服务器获取公钥
    let serverPublicKey;
    try {
      serverPublicKey = await request.get('/getPublicKey').then(res => {
        if (res.data && res.data.data) return res.data.data;
        return res.data;
      });
    } catch (error) {
      console.error('获取公钥失败:', error);
      console.groupEnd();
      return { error: '获取公钥失败' };
    }
    
    // 3. 运行加密流程测试
    CryptoHybrid.configure({ 
      useFixedKey: true, 
      fixedKey: 'ABCDEFGHABCDEFGH'
    });
    
    const { encryptedAESKey, encryptedData, sessionKey } = 
      CryptoHybrid.hybrid.prepareEncryptedData(testData, serverPublicKey);
    
    // 4. 测试AES加解密
    const decryptResult = CryptoHybrid.aes.decrypt(encryptedData, sessionKey);
    
    if (decryptResult.success) {
      console.log('✅ 加密测试通过');
    } else {
      console.error('❌ 加密测试失败:', decryptResult.error);
    }
    
    console.groupEnd();
    return {
      success: decryptResult.success,
      encryptedAESKey,
      encryptedData,
      sessionKey
    };
  };
  
  // 生成登录测试命令
  window['loginCommand'] = (username = 'testuser', password = 'password123') => {
    const result = CryptoDebugger.loginTest(username, password);
    return `curl -X POST "http://218.199.69.63:39600/user/login" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(result.request)}'`;
  };
}