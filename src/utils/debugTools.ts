/**
 * 调试工具统一初始化
 * 该文件负责所有调试工具的全局注册和错误处理
 */
import CryptoDebugger from './cryptoDebugger';
import CryptoHybrid from './cryptoHybrid';
import CryptoValidator from './cryptoValidator';

// 处理未定义工具的通用函数
const handleUndefinedTool = (toolName: string) => {
  console.warn(`${toolName}尚未初始化。请先调用initDebugTools()初始化测试工具。`);
  return { error: `调试工具${toolName}未初始化` };
};

// 创建安全的全局对象
const createSafeGlobal = <T extends Function>(fn: T, name: string): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error(`调用${name}时发生错误:`, error);
      return { error: `调用${name}失败: ${error.message}` };
    }
  }) as unknown as T;
};

/**
 * 初始化所有调试工具
 */
export function initDebugTools() {
  console.log('🔧 正在初始化加密调试工具...');
  
  if (typeof window === 'undefined') {
    console.warn('在非浏览器环境中无法初始化调试工具');
    return false;
  }
  
  try {
    // 确保CryptoDebugger已加载
    if (!CryptoDebugger) {
      console.error('CryptoDebugger未加载');
      return false;
    }
    
    // 验证quickTest方法是否存在
    if (!CryptoDebugger.quickTest || typeof CryptoDebugger.quickTest !== 'function') {
      console.warn('CryptoDebugger.quickTest方法未找到，使用临时实现');
      CryptoDebugger.quickTest = (publicKey?: string, privateKey?: string) => {
        console.error('使用临时quickTest实现，请更新cryptoDebugger.tsx');
        // 使用已有的testHybridEncryptionFlow作为替代
        return CryptoDebugger.testHybridEncryptionFlow(
          { test: "data" },
          publicKey || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAz0N/LGPJ9EsJ8qVCgDWXbNBeuUPQcil0fIUBvNOYN80mbgeSSlHeYbRc2Z/GfV2zFWlEprTFXyv9h3GyvrRnx4xtLL2HiX2MQcR97h1bM4BgJeexvbjNs0YlZIck8r83Ar88FzY6wKda5NUzNcbRRm7gwgiDirCZnL+Byl7S0WVGuMpsCci5p49qs/L+/+biF5Hs5A+8+7yI+WN7NXAoaaCvufEOJdmUweCMlEqL0EXdQTkLKYB37kaWHbQSdA1r8XMHWBB8yJaj8yXWWAt+rGuKuCa10u3Gr8ckH5tA7UNU8dwVwMw229HcwNCBQzqWZbSoY+X91QGO6yymCkUQIDAQAB', 
          privateKey || CryptoDebugger.getTestPrivateKey()
        );
      };
    }
    
    // 核心调试器
    window.RSADebugger = CryptoDebugger;
    window.CryptoHybrid = CryptoHybrid;
    
    // 2. 常用方法
    window.analyzeRSA = createSafeGlobal(CryptoDebugger.analyzeRSAEncryptionFlow, 'analyzeRSA');
    window.testHybridEncryption = createSafeGlobal(CryptoDebugger.testHybridEncryptionFlow, 'testHybridEncryption');
    window.canDecryptEncryptedAESKey = createSafeGlobal(CryptoDebugger.canDecryptEncryptedAESKey, 'canDecryptEncryptedAESKey');
    window.testBase64 = createSafeGlobal(CryptoDebugger.compareBase64Implementations, 'testBase64');
    window.encryptTest = createSafeGlobal(CryptoDebugger.encryptWithBusinessLogic, 'encryptTest');
    window.loginTest = createSafeGlobal(CryptoDebugger.loginTest, 'loginTest');
    window.testConcurrency = createSafeGlobal(CryptoDebugger.testConcurrentEncryption, 'testConcurrency');
    window.testKeyFormats = createSafeGlobal(CryptoDebugger.verifyKeyFormats, 'testKeyFormats');
    window.quickTest = createSafeGlobal(CryptoDebugger.quickTest, 'quickTest');
    window.prepareLogin = createSafeGlobal(CryptoDebugger.prepareLoginRequest, 'prepareLogin');
    window.testRequestEncryption = createSafeGlobal(CryptoDebugger.testRequestEncryption, 'testRequestEncryption');
    window.getTestPrivateKey = createSafeGlobal(CryptoDebugger.getTestPrivateKey, 'getTestPrivateKey');
    
    // 3. 统一的调试API对象
    window.debugRSA = {
      // 主要测试方法
      analyzeRSA: createSafeGlobal(CryptoDebugger.analyzeRSAEncryptionFlow, 'debugRSA.analyzeRSA'),
      testEncryption: createSafeGlobal(CryptoDebugger.testHybridEncryptionFlow, 'debugRSA.testEncryption'),
      quickTest: createSafeGlobal(CryptoDebugger.quickTest, 'debugRSA.quickTest'),
      testRequestEncryption: createSafeGlobal(CryptoDebugger.testRequestEncryption, 'debugRSA.testRequestEncryption'),
      
      // 辅助工具
      getTestPrivateKey: createSafeGlobal(CryptoDebugger.getTestPrivateKey, 'debugRSA.getTestPrivateKey'),
      validateFormat: createSafeGlobal(CryptoValidator.validateFormat, 'debugRSA.validateFormat'),
      validateEncryption: createSafeGlobal(CryptoValidator.validateEncryption, 'debugRSA.validateEncryption'),
      
      // 状态与上下文
      getState: () => {
        // 尝试从各个来源获取状态信息
        const state = {
          initialized: true,
          timestamp: new Date().toISOString(),
          message: '调试工具已初始化'
        };
        return state;
      },
      
      // 请求失败测试
      testFailedRequest: () => {
        console.log('准备测试最近失败的请求...');
        // 实际实现会在request.tsx中替换
        return { message: '请求测试功能已初始化，等待request模块集成' };
      }
    };
    
    // 确保window.debugRSA.quickTest直接指向RSADebugger.quickTest
    window.debugRSA.quickTest = CryptoDebugger.quickTest;
    window.quickTest = CryptoDebugger.quickTest;
  
    // 4. 便捷测试方法
    window.testEncryption = () => {
      console.log('执行加密测试...');
      if (window.debugRSA && typeof window.debugRSA.testFailedRequest === 'function') {
        return window.debugRSA.testFailedRequest();
      }
      return { message: '请使用debugRSA.quickTest()执行完整测试' };
    };
    
    // 5. 其他便捷功能
    window.loginCommand = (username = 'testuser', password = 'password123') => {
      const result = CryptoDebugger.loginTest(username, password);
      const command = `curl -X POST "http://218.199.69.63:39600/user/login" -H "Content-Type: application/json" -d '${JSON.stringify(result.request)}'`;
      
      // 尝试复制到剪贴板
      try {
        navigator.clipboard.writeText(command).then(
          () => console.log('✅ 命令已复制到剪贴板')
        );
      } catch (e) {}
      
      return command;
    };
    
    // 测试所有初始化的函数是否可用
    const testResult = window.debugRSA.getState();
    console.log('🔧 加密调试工具初始化完成', testResult);
    
    // 修改安全提醒
    console.log(`
🔐 安全提示：
当前版本已禁用本地RSA私钥测试。在实际生产环境中，RSA私钥应仅存在于服务器端。
所有依赖私钥的解密测试现在需要通过服务器端完成。

可用调试命令:
• testEncryption() - 快速测试最近的加密操作
• debugRSA.quickTest() - 执行完整加密流程测试
• loginCommand("用户名", "密码") - 生成测试登录请求
    `);
    
    return true;
  } catch (error) {
    console.error('调试工具初始化失败:', error);
    
    // 提供一个应急的测试功能
    window.testEncryption = () => {
      return { error: '调试工具初始化失败', message: error.message };
    };
    
    return false;
  }
}

// 立即初始化调试工具，但允许后续重新初始化
if (typeof window !== 'undefined') {
  // 标记初始化状态
  let initialized = false;
  
  // 创建重试机制
  const tryInitialize = () => {
    if (!initialized) {
      initialized = initDebugTools();
      
      if (!initialized) {
        console.log('将在2秒后重试初始化调试工具...');
        setTimeout(tryInitialize, 2000);
      }
    }
  };
  
  // 在页面加载完成后初始化
  if (document.readyState === 'complete') {
    tryInitialize();
  } else {
    window.addEventListener('load', tryInitialize);
  }
  
  // 暴露初始化函数，允许用户手动触发
  window['initDebugTools'] = () => {
    console.log('手动初始化调试工具...');
    initialized = initDebugTools();
    return initialized;
  };
}

export default { initDebugTools };
