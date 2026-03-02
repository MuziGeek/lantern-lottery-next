/**
 * 灯谜答案校验 — 在 Server Action 中调用，客户端不接触答案
 */

function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, '')
}

export function checkAnswer(correctAnswer: string, userAnswer: string): boolean {
  return normalize(userAnswer) === normalize(correctAnswer)
}
