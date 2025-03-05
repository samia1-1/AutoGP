/**
 * 将Base64公钥转换为标准PEM格式
 * @param rawKey Base64编码的公钥
 * @returns 标准PEM格式的公钥
 */
export function formatToPEM(rawKey: string, type: 'PUBLIC KEY' | 'PRIVATE KEY' | 'RSA PRIVATE KEY' = 'PUBLIC KEY'): string {
  // 移除所有空白
  const cleanKey = rawKey.replace(/\s+/g, '');
  
  // 如果已经是PEM格式，直接返回
  if (cleanKey.includes('BEGIN') && cleanKey.includes('END')) {
    return rawKey;
  }
  
  // 每64个字符添加换行
  const chunks = [];
  for (let i = 0; i < cleanKey.length; i += 64) {
    chunks.push(cleanKey.slice(i, i + 64));
  }
  
  // 组装标准PEM格式
  return `-----BEGIN ${type}-----\n${chunks.join('\n')}\n-----END ${type}-----`;
}
