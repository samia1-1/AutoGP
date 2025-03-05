import CryptoJS from 'crypto-js';
// 修改导入方式：从命名导入改为默认导入
import CryptoHybrid from './cryptoHybrid';

/**
 * 加密验证工具 - 用于验证加密流程并排查问题
 */
const CryptoValidator = {
  /**
   * 验证和比较加密结果
   * 当服务器解密失败时，验证本地加密/解密是否正确
   */
  validateEncryption: (
    originalData: any,          // 原始请求数据
    encryptedAESKey: string,    // RSA加密后的AES密钥
    encryptedData: string,      // AES加密后的数据
    sessionKey: string          // 原始AES会话密钥 (十六进制格式)
  ) => {
    console.group('🔍 加密验证工具 - 验证加密过程');
    console.log('原始数据:', originalData);
    
    try {
      // 1. 尝试使用原始会话密钥解密数据
      console.log('1️⃣ 尝试本地解密加密数据...');
      const decryptResult = CryptoHybrid.aes.decrypt(encryptedData, sessionKey);
      
      if (!decryptResult.success) {
        console.error('❌ 本地解密失败:', decryptResult.error);
        console.groupEnd();
        return {
          success: false,
          stage: 'decrypt',
          error: decryptResult.error,
        };
      }
      
      console.log('✅ 本地解密成功!');
      console.log('解密结果:', decryptResult.data);
      
      // 2. 验证解密结果是否与原始数据匹配
      const originalStr = JSON.stringify(originalData);
      const decryptedStr = JSON.stringify(decryptResult.data);
      const dataMatch = originalStr === decryptedStr;
      
      console.log('原始数据匹配:', dataMatch ? '✅ 一致' : '❌ 不一致');
      if (!dataMatch) {
        console.log('  - 原始:', originalStr);
        console.log('  - 解密:', decryptedStr);
      }
      
      // 3. 使用相同密钥重新加密，看结果是否一致
      console.log('2️⃣ 尝试重新加密数据...');
      const reEncryptedData = CryptoHybrid.aes.encrypt(originalData, sessionKey);
      const encryptionMatch = reEncryptedData === encryptedData;
      
      console.log('加密结果匹配:', encryptionMatch ? '✅ 一致' : '❌ 不一致');
      if (!encryptionMatch) {
        console.log('  - 原始密文:', encryptedData);
        console.log('  - 重新加密:', reEncryptedData);
      }
      
      // 4. 检查AES密钥转Base64格式
      console.log('3️⃣ 验证AES密钥转换为Base64格式');
      const base64Key = CryptoHybrid.common.utf8ToBase64(sessionKey);
      console.log('原始AES密钥:', sessionKey);
      console.log('转换为Base64格式:', base64Key);
      
      console.log('4️⃣ 综合诊断:');
      
      // 5. 生成诊断信息
      const diagnosis = [];
      
      if (dataMatch && encryptionMatch) {
        diagnosis.push('✓ 本地加密/解密正常工作');
        diagnosis.push('✓ 数据加密一致性正常');
        diagnosis.push('问题可能在服务器端的RSA私钥解密过程');
      } else if (dataMatch && !encryptionMatch) {
        diagnosis.push('✓ 本地解密正常');
        diagnosis.push('✗ 加密结果不一致 - 可能使用了不确定性的加密模式');
        diagnosis.push('建议检查加密配置，确保使用ECB模式和确定性填充');
      } else if (!dataMatch) {
        diagnosis.push('✗ 解密数据与原始数据不匹配');
        diagnosis.push('✗ 可能使用了错误的密钥格式或加密参数');
        diagnosis.push('建议检查密钥格式和数据编码');
      }
      
      diagnosis.forEach(d => console.log(d));
      
      const result = {
        success: dataMatch && encryptionMatch,
        dataMismatch: !dataMatch,
        encryptionMismatch: !encryptionMatch,
        decryptedData: decryptResult.data,
        reEncryptedData,
        base64Key,
        diagnosis
      };
      
      console.groupEnd();
      return result;
      
    } catch (error) {
      console.error('❌ 验证过程出错:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 验证加密字符串格式
   */
  validateFormat: (encryptedStr: string) => {
    console.group('🔍 密文格式验证');
    
    try {
      // 检查是否为有效Base64格式
      const isValidBase64 = /^[A-Za-z0-9+/=]+$/.test(encryptedStr);
      console.log('是否有效Base64格式:', isValidBase64 ? '✅ 是' : '❌ 否');
      
      // 计算长度信息
      console.log('密文长度:', encryptedStr.length, '字符');
      
      // 检查是否包含填充字符
      const hasPadding = encryptedStr.includes('=');
      console.log('包含填充字符:', hasPadding ? '✅ 是' : '❌ 否');
      
      if (hasPadding) {
        const paddingCount = encryptedStr.split('').filter(c => c === '=').length;
        console.log('填充字符数量:', paddingCount);
      }
      
      // 诊断信息
      const diagnosis = [];
      
      if (!isValidBase64) {
        diagnosis.push('❌ 密文不是有效的Base64格式，可能导致服务端解析失败');
      }
      
      if (encryptedStr.length > 2048) {
        diagnosis.push('⚠️ 密文长度超过2048字符，可能超出服务端处理限制');
      }
      
      if (diagnosis.length > 0) {
        diagnosis.forEach(d => console.log(d));
      } else {
        console.log('✅ 密文格式符合要求');
      }
      
      console.groupEnd();
      return {
        success: isValidBase64,
        length: encryptedStr.length,
        hasPadding,
        paddingCount: hasPadding ? encryptedStr.split('').filter(c => c === '=').length : 0,
        diagnosis
      };
    } catch (error) {
      console.error('❌ 格式验证失败:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// 添加全局方法
if (typeof window !== 'undefined') {
  window['validateEncryption'] = CryptoValidator.validateEncryption;
  window['validateFormat'] = CryptoValidator.validateFormat;
}

export default CryptoValidator;
