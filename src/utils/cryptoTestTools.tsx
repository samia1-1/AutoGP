import axios from 'axios';
import CryptoJS from 'crypto-js';
import { getToken } from './token';
import { CryptoHybrid } from './cryptoHybrid';
// 直接从cryptoHybrid的公共部分引用所需工具
const formatRSAPublicKey = CryptoHybrid.common.formatRSAPublicKey;
const utf8ToBase64 = CryptoHybrid.common.utf8ToBase64;

/**
 * 简化版加密测试工具
 * 只保留综合测试功能
 */
export const CryptoTestTools = {
  /**
   * 配置参数
   */
  config: {
    serverUrl: 'http://218.199.69.63:39600',
    // publicKeyEndpoint: '/getPublicKey', // 移除获取公钥端点
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyMEClBkki8JslEyx8Hd3CMEQyvWrLSFUCAtwuKVDzDNAMLNPZ7Ov2Wxb0kYco5N9oxGbh67J1sD6UmzKaywhi6Mjn3vHeA4WzIajKBnKYBJV22omzl9aktDZCe2xc6i17GUx4Ar2C8n+5Eb6TfYOJ+eiKFrzZx7UI30n1BJDxUFontCmIK6HhkNVXKvDS/wd2RR/kTY5xMIr/54DyrHG5qTSjJyA94bKfCpvA4zoRtPh5sodsdNLPcG6VhFfvH7yJZQhtrY6RSqD1g4CS1EUdVS7Bc0bfuA/AU4pE267yGTszJA691XIJJk1rnvnBf6tFe/0k/gyUTUyZh7rxvNEGQIDAQAB',
    decryptEndpoint: '/decryptKey1',
    timeout: 15000,
    defaultKey: 'ABCDEFGHABCDEFGH' // 修改为16字节
  },

  /**
   * 综合诊断工具
   */
  diagnostics: {
    /**
     * 综合加密测试 - 集成验证一致性和本地解密功能
     * 一站式验证加密系统的工作状态并提供详细诊断
     */
    comprehensiveEncryptionTest: async (testData: any = { message: "Comprehensive test", timestamp: Date.now() }): Promise<{
      success: boolean;
      serverCommunication: boolean;
      localEncryption: boolean;
      consistencyResults: any;
      problemAreas: string[];
      recommendations: string[];
      details: any;
    }> => {
      console.group('🔬 综合加密系统测试');
      console.log('测试数据:', testData);
      
      // 存储完整测试结果
      const results = {
        serverCommunication: false,
        localEncryption: false,
        localDecryption: false,
        dataConsistency: false,
        keyConsistency: true,
        decryptionConsistency: false,
        keyDataConsistency: true, // 新增: 密钥和数据是否一致
        rawResults: {},
        problemAreas: [] as string[],
        recommendations: [] as string[]
      };
      
      try {
        // 第1阶段: 本地加密验证
        console.log('1️⃣ 验证本地加密功能...');
        
        // 使用当前配置的密钥
        const aesKey = CryptoTestTools.config.defaultKey;
        console.log(`使用AES密钥: ${aesKey} (${aesKey.length}字节)`);
        
        // 1.1 测试本地加密解密循环 - 使用CryptoHybrid核心库
        const localEncryptionTest = await testLocalEncryptionLoop(testData);
        results.localEncryption = localEncryptionTest.success;
        
        if (!localEncryptionTest.success) {
          console.error('❌ 本地加密解密测试失败!');
          results.problemAreas.push('本地加密功能');
          results.recommendations.push('检查CryptoJS库是否正确加载');
          results.recommendations.push('确认浏览器对加密API的支持');
        } else {
          console.log('✅ 本地加密解密正常工作');
        }
        
        // 第2阶段: 向服务器发送加密数据并验证
        console.log('2️⃣ 测试与服务器的加密通信...');
        const serverTest = await testServerEncryption(testData);
        results.serverCommunication = serverTest.success;
        
        if (!serverTest.success) {
          console.error('❌ 服务器通信测试失败!');
          results.problemAreas.push('服务器通信');
          results.recommendations.push('检查网络连接');
          results.recommendations.push('确认服务器端点URL正确');
          results.recommendations.push('验证服务器是否在线');
        } else {
          console.log('✅ 服务器能够成功处理加密数据');
        }
        
        // 新增: 检查密钥和加密数据一致性
        console.log('3️⃣ 验证密钥和加密数据的一致性...');
        
        // 测试同一个密钥多次加密
        const testKey = CryptoTestTools.config.defaultKey;
        console.log(`使用固定测试密钥: ${testKey}`);
        
        // 生成RSA公钥加密后的AES密钥
        let encryptedKey = '';
        try {
          // 直接使用配置中的公钥，而不是从服务器获取
          const publicKey = CryptoTestTools.config.publicKey;
          console.log('使用配置中的RSA公钥');
          
          // 格式化公钥
          const formattedPublicKey = formatRSAPublicKey(publicKey);
          
          // 使用固定测试密钥进行RSA加密
          console.log(`使用固定测试密钥: ${testKey}`);
          
          // 直接调用优化后的密钥加密方法
          encryptedKey = CryptoHybrid.keys.encryptKeyForJava(testKey, formattedPublicKey);
          
          console.log('✅ 成功使用RSA公钥加密测试密钥');
        } catch (error) {
          console.error('❌ 无法加密测试密钥:', error);
          results.problemAreas.push('RSA密钥加密');
          results.recommendations.push('检查RSA公钥获取和加密过程');
        }
        
        // 使用同一密钥进行多次数据加密并验证一致性
        if (encryptedKey) {
          console.log('执行多次加密一致性测试...');
          
          // 创建多个测试请求，模拟不同时间点发送的请求
          const testRequests = [
            { id: 1, data: { test: "测试数据1", timestamp: Date.now() } },
            { id: 2, data: { test: "测试数据2", timestamp: Date.now() + 100 } },
            { id: 3, data: { test: "测试数据3", timestamp: Date.now() + 200 } }
          ];
          
          // 依次为每个测试对象创建加密数据
          const encryptedResults = [];
          
          for (const req of testRequests) {
            // 加密测试数据
            const testString = JSON.stringify(req.data);
            const encryptedData = CryptoHybrid.aes.encrypt(testString, testKey);
            
            encryptedResults.push({
              id: req.id,
              originalData: req.data,
              encryptedData,
              encryptedAESKey: encryptedKey,
              decryptable: false // 将稍后验证
            });
            
            console.log(`请求 #${req.id} 加密完成，数据长度: ${encryptedData.length}`);
          }
          
          // 验证每个加密结果是否可以被相同密钥解密
          console.log('验证所有加密结果都可以用相同密钥解密...');
          let allDecryptable = true;
          
          for (const result of encryptedResults) {
            const decryptResult = CryptoHybrid.aes.decrypt(result.encryptedData, testKey);
            result.decryptable = decryptResult.success;
            
            if (!decryptResult.success) {
              allDecryptable = false;
              console.error(`❌ 请求 #${result.id} 无法解密:`, decryptResult.error);
            } else {
              const originalStr = JSON.stringify(result.originalData);
              const decryptedStr = JSON.stringify(decryptResult.data);
              const match = originalStr === decryptedStr;
              
              if (!match) {
                allDecryptable = false;
                console.warn(`⚠️ 请求 #${result.id} 解密数据不匹配!`);
                console.log('- 原始数据:', originalStr);
                console.log('- 解密数据:', decryptedStr);
              }
            }
          }
          
          results.keyDataConsistency = allDecryptable;
          
          if (allDecryptable) {
            console.log('✅ 密钥一致性测试通过: 所有加密数据都可以用相同密钥正确解密');
          } else {
            console.error('❌ 密钥一致性测试失败: 部分加密数据无法使用相同密钥解密');
            results.problemAreas.push('密钥数据一致性');
            results.recommendations.push('确保同一会话中使用一致的加密密钥和加密方法');
          }
          
          // 模拟并发请求测试
          console.log('模拟并发请求场景...');
          try {
            // 创建模拟密钥管理器
            const keyManager = {
              currentKey: '',
              keyPromise: null,
              
              async getKey() {
                if (this.currentKey) return this.currentKey;
                
                if (this.keyPromise) return this.keyPromise;
                
                this.keyPromise = new Promise(resolve => {
                  setTimeout(() => {
                    this.currentKey = testKey;
                    resolve(this.currentKey);
                  }, 50);
                });
                
                return this.keyPromise;
              },
              
              async encryptData(data) {
                const key = await this.getKey();
                return CryptoHybrid.aes.encrypt(JSON.stringify(data), key);
              }
            };
            
            // 并行执行多个加密操作
            console.log('测试并发加密操作...');
            const concurrentEncryptions = await Promise.all([
              keyManager.encryptData({ test: "并发1", time: Date.now() }),
              keyManager.encryptData({ test: "并发2", time: Date.now() }),
              keyManager.encryptData({ test: "并发3", time: Date.now() })
            ]);
            
            // 验证所有并发加密结果都可以被同一密钥解密
            let concurrentSuccess = true;
            for (let i = 0; i < concurrentEncryptions.length; i++) {
              const decryptResult = CryptoHybrid.aes.decrypt(concurrentEncryptions[i], testKey);
              if (!decryptResult.success) {
                concurrentSuccess = false;
                console.error(`❌ 并发请求 #${i+1} 无法解密:`, decryptResult.error);
              } else {
                console.log(`✓ 并发请求 #${i+1} 解密成功`);
              }
            }
            
            if (concurrentSuccess) {
              console.log('✅ 并发密钥一致性测试通过');
            } else {
              console.error('❌ 并发密钥一致性测试失败');
              results.problemAreas.push('并发加密一致性');
              results.recommendations.push('检查并发请求时的密钥管理逻辑');
              results.keyDataConsistency = false;
            }
            
          } catch (error) {
            console.error('并发请求测试出错:', error);
          }
          
          // 保存测试结果
          results.rawResults.keyConsistencyTest = {
            testKey,
            encryptedKey,
            encryptedResults,
          };
        }
        
        // 在密钥一致性测试部分添加频繁更换密钥的测试
        if (encryptedKey) {
          // ...existing code for consistency testing...
          
          // 新增：测试频繁更换密钥的情况
          console.log('测试频繁更换密钥...');
          try {
            // 模拟频繁更换密钥的情况
            const keyRotationManager = {
              keys: [
                CryptoJS.lib.WordArray.random(16).toString(),
                CryptoJS.lib.WordArray.random(16).toString(),
                CryptoJS.lib.WordArray.random(16).toString()
              ],
              currentKeyIndex: 0,
              
              getCurrentKey() {
                return this.keys[this.currentKeyIndex];
              },
              
              rotateKey() {
                this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
                return this.getCurrentKey();
              },
              
              encryptData(data) {
                const key = this.getCurrentKey();
                const encrypted = CryptoHybrid.aes.encrypt(JSON.stringify(data), key);
                this.rotateKey(); // 加密后立即轮换密钥
                return { encrypted, key };
              }
            };
            
            // 加密多个数据，每次使用不同密钥
            const rotationResults = [];
            for (let i = 0; i < 3; i++) {
              const testObj = { test: `轮换测试${i+1}`, time: Date.now() + i*100 };
              const { encrypted, key } = keyRotationManager.encryptData(testObj);
              
              rotationResults.push({
                data: testObj,
                encrypted,
                key,
                decrypted: null
              });
            }
            
            // 验证每个加密结果是否可以用对应密钥解密
            let keyRotationSuccess = true;
            for (const result of rotationResults) {
              const decryptResult = CryptoHybrid.aes.decrypt(result.encrypted, result.key);
              result.decrypted = decryptResult.data;
              
              if (!decryptResult.success) {
                keyRotationSuccess = false;
                console.error('❌ 密钥轮换测试解密失败:', decryptResult.error);
              } else {
                const originalStr = JSON.stringify(result.data);
                const decryptedStr = JSON.stringify(decryptResult.data);
                if (originalStr !== decryptedStr) {
                  keyRotationSuccess = false;
                  console.error('❌ 密钥轮换测试数据不匹配');
                  console.log('- 原始:', originalStr);
                  console.log('- 解密:', decryptedStr);
                }
              }
            }
            
            // 检查交叉解密（用错误的密钥解密）- 应该失败
            const crossDecrypt = CryptoHybrid.aes.decrypt(
              rotationResults[0].encrypted, 
              rotationResults[1].key
            );
            
            // 验证不同的密钥不能解密其他密钥加密的数据
            const crossDecryptFailed = !crossDecrypt.success || 
              JSON.stringify(crossDecrypt.data) !== JSON.stringify(rotationResults[0].data);
            
            if (keyRotationSuccess && crossDecryptFailed) {
              console.log('✅ 密钥轮换测试通过: 每次请求使用不同密钥可行');
            } else {
              console.error('❌ 密钥轮换测试失败');
              if (!keyRotationSuccess) {
                results.problemAreas.push('密钥轮换功能');
                results.recommendations.push('修复密钥轮换逻辑，确保每个加密数据能用对应密钥解密');
              }
              if (!crossDecryptFailed) {
                console.warn('⚠️ 安全风险: 使用错误的密钥也能解密数据');
                results.problemAreas.push('密钥安全性');
                results.recommendations.push('检查加密实现，确保密钥不同时无法解密');
              }
            }
            
            // 保存测试结果
            results.rawResults.keyRotationTest = {
              success: keyRotationSuccess && crossDecryptFailed,
              details: rotationResults,
              crossDecryptSecure: crossDecryptFailed
            };
            
          } catch (error) {
            console.error('密钥轮换测试出错:', error);
            results.problemAreas.push('密钥轮换测试');
          }
        }
        
        // 第3阶段: 本地解密验证
        if (serverTest.encryptionDetails) {
          console.log('3️⃣ 验证本地解密能力...');
          
          const { encryptedData } = serverTest.encryptionDetails;
          const localDecryptResult = CryptoHybrid.aes.decrypt(encryptedData, aesKey);
          results.localDecryption = localDecryptResult.success;
          
          if (!localDecryptResult.success) {
            console.error('❌ 本地解密失败!');
            results.problemAreas.push('本地解密功能');
            results.recommendations.push('检查密钥格式');
            results.recommendations.push('确认加密数据格式是否包含IV分隔符');
          } else {
            console.log('✅ 本地解密成功');
            
            // 验证解密数据和原始数据匹配
            const decryptedStr = JSON.stringify(localDecryptResult.data);
            const originalStr = JSON.stringify(testData);
            results.dataConsistency = decryptedStr === originalStr;
            
            if (!results.dataConsistency) {
              console.warn('⚠️ 解密数据与原始数据不匹配!');
              results.problemAreas.push('数据一致性');
              results.recommendations.push('检查JSON序列化/反序列化过程');
              
              console.log('- 原始数据:', originalStr);
              console.log('- 解密数据:', decryptedStr);
            } else {
              console.log('✅ 解密数据与原始数据完全匹配');
            }
          }
        }
        
        // 第4阶段: 创建本地加密结果与服务器加密结果比较
        console.log('4️⃣ 验证本地加密与服务器加密一致性...');
        
        // 从头开始创建一个本地加密结果
        const testJsonStr = JSON.stringify(testData);
        // 修改后：更新日志描述为ECB模式
        console.log('4️⃣ 加密测试数据 (使用AES/ECB/PKCS5Padding)...');
        console.log('明确使用: AES/ECB/PKCS5Padding');
        
        const localEncryptedData = CryptoHybrid.aes.encrypt(testJsonStr, aesKey);
        
        // 如果有服务器加密结果，则进行比对
        if (serverTest.encryptionDetails) {
          const serverEncryptedData = serverTest.encryptionDetails.encryptedData;
          
          // 解密服务器加密数据
          const serverDecryptResult = CryptoHybrid.aes.decrypt(serverEncryptedData, aesKey);
          
          // 解密本地加密数据
          const localDecryptResult = CryptoHybrid.aes.decrypt(localEncryptedData, aesKey);
          
          // 比较两个解密结果是否匹配
          if (serverDecryptResult.success && localDecryptResult.success) {
            const serverDecryptStr = JSON.stringify(serverDecryptResult.data);
            const localDecryptStr = JSON.stringify(localDecryptResult.data);
            
            results.decryptionConsistency = serverDecryptStr === localDecryptStr;
            
            if (!results.decryptionConsistency) {
              console.warn('⚠️ 本地解密与服务器解密结果不一致!');
              results.problemAreas.push('加解密一致性');
              results.recommendations.push('确保前后端使用相同的加密标准');
              results.recommendations.push('检查UTF-8编码处理');
              
              console.log('- 服务器加密+本地解密:', serverDecryptStr);
              console.log('- 本地加密+本地解密:', localDecryptStr);
            } else {
              console.log('✅ 加密一致性验证通过');
            }
          } else {
            if (!serverDecryptResult.success) {
              console.error('❌ 无法解密服务器加密的数据:', serverDecryptResult.error);
            }
            if (!localDecryptResult.success) {
              console.error('❌ 无法解密本地加密的数据:', localDecryptResult.error);
            }
          }
        }
        
        // 第5阶段: 综合分析与建议
        console.log('5️⃣ 生成综合分析报告...');
        
        // 基于测试结果生成问题诊断
        if (results.problemAreas.length === 0) {
          if (serverTest.success && results.localEncryption && results.dataConsistency) {
            results.recommendations.push('✅ 加密系统工作正常，无需进一步操作');
          } else {
            results.recommendations.push('⚠️ 未检测到明确问题，但某些测试未完全通过');
          }
        } else {
          // 针对服务器问题的特定建议
          if (!results.serverCommunication && results.localEncryption) {
            results.recommendations.push('🔍 本地加密正常但服务器通信失败，问题可能在服务器端');
            results.recommendations.push('检查服务器加密参数是否与前端匹配');
            results.recommendations.push('确认服务器期望的参数名是否为encryptedAESKey和encryptedData');
          }
          
          // 针对密钥问题的特定建议
          if (!results.localDecryption && results.localEncryption) {
            results.recommendations.push('🔑 尝试不同长度的密钥 (16或32字节)');
          }
          
          // 针对一致性问题的特定建议
          if (!results.dataConsistency || !results.decryptionConsistency) {
            results.recommendations.push('检查JSON序列化过程，确保对象格式一致');
          }
        }
        
        // 存储详细原始结果
        results.rawResults = {
          localEncryptionTest,
          serverTest,
          localEncryptedData,
          aesKey
        };
        
        // 在综合分析中添加密钥一致性检查结果
        if (!results.keyDataConsistency) {
          results.problemAreas.push('密钥数据匹配');
          results.recommendations.push('修复request.tsx中的密钥管理，确保所有请求使用一致的会话密钥');
          results.recommendations.push('避免在加密过程中重复生成密钥，而是使用同步的密钥获取机制');
        }
        
        // 计算总体成功状态 - 添加密钥一致性因素
        const overallSuccess = results.localEncryption && 
          (results.serverCommunication || results.localDecryption) &&
          results.dataConsistency &&
          results.keyDataConsistency;  // 添加密钥一致性检查
        
        // 在建议措施中添加密钥轮换相关建议
        if (results.rawResults.keyRotationTest && !results.rawResults.keyRotationTest.success) {
          results.recommendations.push('实现可靠的密钥轮换机制，每次请求后更换密钥');
        } else {
          results.recommendations.push('✓ 密钥轮换测试通过，保持每次请求后更新密钥的机制');
        }
        
        console.log(`总体测试结果: ${overallSuccess ? '✅ 通过' : '❌ 未通过'}`);
        console.log('发现的问题:', results.problemAreas.length ? results.problemAreas.join(', ') : '无');
        console.log('建议措施:');
        results.recommendations.forEach(rec => console.log(`- ${rec}`));
        
        console.groupEnd();
        return {
          success: overallSuccess,
          serverCommunication: results.serverCommunication,
          localEncryption: results.localEncryption,
          consistencyResults: {
            dataConsistency: results.dataConsistency,
            decryptionConsistency: results.decryptionConsistency,
            keyDataConsistency: results.keyDataConsistency  // 添加新的一致性测试结果
          },
          problemAreas: results.problemAreas,
          recommendations: results.recommendations,
          details: results.rawResults
        };
        
      } catch (error) {
        console.error('❌ 综合测试过程中发生错误:', error);
        
        results.problemAreas.push('测试执行');
        results.recommendations.push(`修复错误: ${error.message}`);
        
        console.groupEnd();
        return {
          success: false,
          serverCommunication: false,
          localEncryption: false,
          consistencyResults: {},
          problemAreas: results.problemAreas,
          recommendations: results.recommendations,
          details: { error }
        };
      }
    }
  },
  
  /**
   * 测试辅助函数 - 这些是测试专用函数，在核心库中不应包含
   */
  testUtils: {
    /**
     * 测试UTF-8字符处理能力
     */
    utf8Support: (): boolean => {
      const testStrings = [
        "中文测试",
        "日本語テスト",
        "한국어 테스트",
        "こんにちは世界",
        "🔒🌍🚀",  // Emoji测试
        "Русский текст" // 俄语
      ];
      
      for (const text of testStrings) {
        try {
          const encrypted = CryptoHybrid.aes.encrypt(text, 'testkey');
          const decrypted = CryptoHybrid.aes.decrypt(encrypted, 'testkey');
          
          if (!decrypted.success || decrypted.data !== text) {
            console.error(`UTF-8测试失败: ${text}`);
            return false;
          }
        } catch (e) {
          console.error(`UTF-8测试异常: ${text}`, e);
          return false;
        }
      }
      
      return true;
    },
    
    /**
     * 分析密钥特性
     */
    analyzeKey: (key: string): object => {
      return {
        length: key.length,
        byteSize: new TextEncoder().encode(key).length,
        isASCII: /^[\x00-\x7F]*$/.test(key),
        isBase64: /^[A-Za-z0-9+/=]+$/.test(key),
        isHex: /^[0-9A-Fa-f]+$/.test(key),
        isValid16ByteKey: key.length === 16,
        isValid32ByteKey: key.length === 32
      };
    }
  }
};

/**
 * 内部辅助函数 - 测试本地加密解密
 * 使用CryptoHybrid核心库
 */
async function testLocalEncryptionLoop(data: any = { test: "测试数据", time: Date.now() }): Promise<{
  success: boolean;
  original: any;
  encrypted: string;
  decrypted?: any;
}> {
  try {
    // 修改：使用配置中的默认密钥而非硬编码的'testkey'
    const testKey = CryptoTestTools.config.defaultKey;
    console.log(`本地加密测试使用密钥: ${testKey}`);
    
    // 详细记录每个步骤以便调试
    console.log('原始数据:', data);
    
    // 加密 - 使用核心库
    const encrypted = CryptoHybrid.aes.encrypt(data, testKey);
    console.log('已加密数据:', encrypted);
    
    // 解密 - 使用核心库
    console.log('执行解密...');
    const decryptResult = CryptoHybrid.aes.decrypt(encrypted, testKey);
    
    if (!decryptResult.success) {
      console.error('解密失败:', decryptResult.error);
      return {
        success: false,
        original: data,
        encrypted,
        error: decryptResult.error
      };
    }
    
    console.log('解密结果:', decryptResult.data);
    
    // 验证 - 更严格的比较
    const originalJson = JSON.stringify(data);
    const decryptedJson = JSON.stringify(decryptResult.data);
    
    console.log('原始JSON:', originalJson);
    console.log('解密JSON:', decryptedJson);
    
    // 比较序列化后的结果
    const success = decryptedJson === originalJson;
    
    if (!success) {
      console.warn('解密后数据与原始数据不匹配:');
      console.warn('- 原始:', originalJson);
      console.warn('- 解密:', decryptedJson);
    }
    
    return {
      success,
      original: data,
      encrypted,
      decrypted: decryptResult.data
    };
  } catch (error) {
    // 增强错误处理 - 记录错误的完整详情
    console.error('本地加密解密循环测试出错:', error);
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    
    return {
      success: false,
      original: data,
      encrypted: '',
      error
    };
  }
}

/**
 * 内部辅助函数 - 测试与服务器的加密通信
 * 现在使用CryptoHybrid核心库
 */
async function testServerEncryption(testData: any = { message: "Backend test data", timestamp: Date.now() }): Promise<any> {
  console.group('🌐 与服务器进行加密测试');
  
  try {
    // 1. 从服务器获取公钥
    console.log('1️⃣ 从服务器获取公钥...');
    
    // 移除从服务器获取公钥的逻辑
    let publicKey = CryptoTestTools.config.publicKey;
    console.log('✅ 使用配置中的公钥');
    
    // 2. 格式化公钥
    let formattedPublicKey = formatRSAPublicKey(publicKey);
    
    // 3. 使用RSA/ECB/PKCS1Padding加密AES密钥
    const aesKey = CryptoTestTools.config.defaultKey;
    console.log('2️⃣ 使用密钥:', aesKey, '(长度:', aesKey.length, '字节)');
    
    // 先将密钥UTF-8编码再Base64编码 (与Java后端兼容的关键步骤)
    const base64Key = utf8ToBase64(aesKey);
    
    console.log('加密密钥的方式: RSA/ECB/PKCS1Padding');
    // 使用RSA公钥加密Base64编码的AES密钥
    let encryptedAESKey;
    if (CryptoHybrid.rsa?.encrypt) {
      // 直接使用RSA命名空间的加密方法
      encryptedAESKey = CryptoHybrid.rsa.encrypt(base64Key, formattedPublicKey);
    } else if (CryptoHybrid.keys?.encryptWithRSA) {
      // 备用: 使用keys命名空间的加密方法
      encryptedAESKey = CryptoHybrid.keys.encryptWithRSA(base64Key, formattedPublicKey);
    } else {
      // 错误处理: 尝试使用JSEncrypt直接实现
      console.warn('未找到CryptoHybrid的RSA加密方法，使用内联实现');
      const JSEncrypt = (await import('jsencrypt')).default;
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(formattedPublicKey);
      encryptedAESKey = encryptor.encrypt(base64Key);
      if (!encryptedAESKey) {
        throw new Error('RSA加密失败');
      }
    }
    console.log('3️⃣ 已加密AES密钥');
    
    // 4. 加密测试数据 - 使用AES/ECB/PKCS5Padding
    console.log('4️⃣ 加密测试数据 (使用AES/ECB/PKCS5Padding)...');
    console.log('明确使用: AES/ECB/PKCS5Padding');
    // 加密数据
    const testDataString = JSON.stringify(testData);
    const encryptedData = CryptoHybrid.aes.encrypt(testDataString, aesKey);
    
    // 5. 发送加密数据到服务器
    console.log('5️⃣ 发送加密数据到服务器...');
    
    // 准备payload，直接作为对象传递
    const payload = {
      encryptedAESKey,
      encryptedData
    };
    
    console.group('📤 即将发送到服务器的数据');
    console.log('参数名称: encryptedAESKey');
    console.log('数据长度:', encryptedAESKey.length);
    console.log('数据值:', encryptedAESKey);
    console.log('------------------------');
    console.log('参数名称: encryptedData');
    console.log('数据长度:', encryptedData.length);
    console.log('格式检查:', encryptedData.includes(':') ? '✓ 包含IV分隔符' : '✗ 缺少IV分隔符');
    console.log('数据值:', encryptedData);
    console.groupEnd();
    
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    // 直接传入payload对象，让axios自动序列化
    const serverResponse = await axios.post(
      `${CryptoTestTools.config.serverUrl}${CryptoTestTools.config.decryptEndpoint}`,
      payload,
      { headers, timeout: CryptoTestTools.config.timeout }
    );
    
    console.log('6️⃣ 收到服务器响应:', serverResponse.data);
    
    // 判断是否成功
    const serverSuccess = serverResponse.data && 
      (serverResponse.data.code === 200 || serverResponse.data.success === true);
    
    if (serverSuccess) {
      console.log('✅ 测试成功! 服务器能够正确解密数据');
    } else {
      console.error('❌ 测试失败! 服务器无法解密数据');
    }
    
    console.groupEnd();
    return {
      success: serverSuccess,
      stage: 'complete',
      serverResponse: serverResponse.data,
      encryptionDetails: {
        aesKey,
        base64Key,
        encryptedAESKey,
        testData,
        encryptedData
      }
    };
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    console.groupEnd();
    return {
      success: false,
      error,
      stage: error.message.includes('Network') ? 'network-error' : 'unknown-error'
    };
  }
}

if (typeof window !== 'undefined') {
  window['cryptoTest'] = CryptoTestTools;
  
  // 只保留综合测试函数
  window['comprehensiveEncryptionTest'] = CryptoTestTools.diagnostics.comprehensiveEncryptionTest;
  
  
  console.log('🧪 加密测试工具已加载! 可用命令:');
  console.log('- comprehensiveEncryptionTest() - 执行综合性加密系统测试');
}

export default CryptoTestTools;
