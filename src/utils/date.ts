// 获取当前日期字符串 YYYY-MM-DD
export function formatDate(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 计算两个日期之间的天数差（date2 - date1）
export function diffDays(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00')
  const d2 = new Date(date2 + 'T00:00:00')
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

// 根据周期开始日期和当前日期计算当前是第几天
export function calcCurrentDay(startedAt: string, today = formatDate()): number {
  const diff = diffDays(startedAt, today)
  const day = diff + 1
  return Math.max(1, Math.min(day, 21))
}

// 获取周期第 N 天对应的日期
export function dateOfDay(startedAt: string, day: number): string {
  const d = new Date(startedAt + 'T00:00:00')
  d.setDate(d.getDate() + day - 1)
  return formatDate(d)
}