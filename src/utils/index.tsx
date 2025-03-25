import { request, getEncryptionStatus, testEncryption } from "./request";
import CryptoHybrid from './cryptoHybrid';

// 基础工具导出
export * from './calculateDistance'
export * from './cornPlatformDetails'
export * from './downloadRecords'
export * from './file'
export * from './requireAuth'
export * from './token'
export * from './user'
// 不要再导出所有cryptoHybrid的内容
// export * from './cryptoHybrid'

// 加密相关导出
export {
  request,
  CryptoHybrid,
  // 测试工具
  testEncryption,
  getEncryptionStatus
}

// 方便开发者使用的快捷方法
if (process.env.NODE_ENV !== 'production') {
  if (typeof window !== 'undefined') {
    window['testAPI'] = async (url = '/user/get', data = { test: new Date().toISOString() }) => {
      try {
        console.group(`🧪 API测试: ${url}`);
        console.log('请求数据:', data);
        
        // 先执行本地测试验证加密流程
        const testResult = testEncryption(data);
        console.log('本地加密测试:', testResult.success ? '✓ 通过' : '✗ 失败');
        
        // 发送实际请求
        console.log('发送请求到服务器...');
        const response = await request.post(url, data);
        
        console.log('服务器响应:', response.data);
        console.log('加密状态:', getEncryptionStatus());
        console.groupEnd();
        
        return {
          success: true,
          response: response.data,
          encryptionTest: testResult.success
        };
      } catch (error: any) { // 添加类型断言
        console.error('API测试失败:', error);
        console.log('加密状态:', getEncryptionStatus());
        console.groupEnd();
        
        return {
          success: false,
          error: error.message || '未知错误',
          encryptionTest: testEncryption(data).success
        };
      }
    };
    
    window['getEncryptionStatus'] = getEncryptionStatus;
  }
}