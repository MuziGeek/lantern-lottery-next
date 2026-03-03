/**
 * 角色名 ↔ 合成邮箱转换工具
 *
 * Supabase Auth 要求 email 字段，但用户用角色名登录。
 * 方案：内部将角色名转为合成邮箱 `{encodedName}@lottery.local`
 * 中文需 Base64 编码保证邮箱合法性。
 */

/**
 * 将角色名转换为合成邮箱
 * @param name 角色名（可包含中文）
 * @returns 合成邮箱 {base64url}@lottery.local
 */
export function toEmail(name: string): string {
  const encoded = Buffer.from(name).toString('base64url')
  return `${encoded}@lottery.local`
}
