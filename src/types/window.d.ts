import { CryptoDebugger } from '../utils/cryptoDebugger';

// 扩展 Window 接口
interface Window {
  // RSA调试器
  RSADebugger: any;
  analyzeRSA: (aesKey: string, publicKey: string, privateKey: string) => any;
  testHybridEncryption: (data: any, publicKey: string, privateKey: string) => any;
  canDecryptEncryptedAESKey: (encryptedAESKey: string, privateKey: string) => { success: boolean, base64Key?: string, error?: string };
  testBase64: (str: string) => boolean;
  encryptTest: (data: any, publicKey: string) => any;
  loginTest: (username: string, password: string, publicKey?: string) => any;
  testConcurrency: (data: any) => Promise<any>;
  testKeyFormats: (data: any) => any;
  quickTest: (publicKey?: string, privateKey?: string) => any;
  prepareLogin: (username: string, password: string, publicKey?: string) => any;
  
  // 其他调试工具
  debugRSA: {
    testRSA: (input?: string) => any;
    getState: () => any;
    testCurrentEncryption: () => any;
    getLastEncryptionData: () => any;
    analyzeRSA: (aesKey: string, publicKey: string, privateKey: string) => any;
    testEncryption: (data: any, publicKey: string, privateKey: string) => any;
    quickTest: (publicKey?: string, privateKey?: string) => any;
    prepareLogin: (username: string, password: string, publicKey?: string) => any;
    getTestPrivateKey: () => string;
    testRequestEncryption: (
      originalData: any, 
      encryptedKey: string, 
      sessionKey: string, 
      publicKey: string, 
      privateKey: string
    ) => void;
    validateFormat: (encryptedStr: string) => any;
    validateEncryption: (
      originalData: any,
      encryptedAESKey: string,
      encryptedData: string,
      sessionKey: string
    ) => any;
    
    // 新方法
    testFailedRequest: () => any;
  };
  
  // CryptoAPI接口
  crypto: any;
  testLogin: (username?: string, password?: string) => any;
  cryptoTest: () => any;
  loginCommand: (username?: string, password?: string) => string;
  testRequestEncryption: (
    originalData: any, 
    encryptedKey: string, 
    sessionKey: string, 
    publicKey: string, 
    privateKey: string
  ) => void;
  getTestPrivateKey: () => string;

  // 便捷测试方法
  testEncryption: () => any;

  // 初始化调试工具的方法
  initDebugTools: () => boolean;
}
