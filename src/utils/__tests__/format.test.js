import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  formatNumber,
  formatWeight,
  formatHeight,
  getRelativeTime,
} from '../format'

describe('formatDate - 日期格式化', () => {
  it('应正确格式化有效日期', () => {
    const result = formatDate('2026-05-20', 'YYYY-MM-DD')
    expect(result).toBe('2026-05-20')
  })

  it('应使用默认格式 YYYY-MM-DD', () => {
    const result = formatDate('2026-05-20')
    expect(result).toBe('2026-05-20')
  })

  it('应支持自定义格式', () => {
    const result = formatDate('2026-05-20', 'YYYY/MM/DD')
    expect(result).toBe('2026/05/20')
  })

  it('应支持中文格式', () => {
    const result = formatDate('2026-05-20', 'YYYY年MM月DD日')
    expect(result).toBe('2026年05月20日')
  })

  it('空值应返回空字符串', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('应处理 Date 对象', () => {
    const date = new Date('2026-05-20')
    const result = formatDate(date, 'YYYY-MM-DD')
    expect(result).toBe('2026-05-20')
  })
})

describe('formatTime - 时间格式化', () => {
  it('应正确格式化时间', () => {
    const result = formatTime('2026-05-20 14:30:00', 'HH:mm')
    expect(result).toBe('14:30')
  })

  it('应使用默认格式 HH:mm', () => {
    const result = formatTime('2026-05-20 14:30:00')
    expect(result).toBe('14:30')
  })

  it('应支持秒的格式', () => {
    const result = formatTime('2026-05-20 14:30:45', 'HH:mm:ss')
    expect(result).toBe('14:30:45')
  })

  it('空值应返回空字符串', () => {
    expect(formatTime(null)).toBe('')
    expect(formatTime(undefined)).toBe('')
    expect(formatTime('')).toBe('')
  })
})

describe('formatDuration - 时长格式化', () => {
  it('应正确格式化分钟为小时和分钟', () => {
    expect(formatDuration(90)).toBe('1小时30分钟')
    expect(formatDuration(60)).toBe('1小时')
    expect(formatDuration(45)).toBe('45分钟')
  })

  it('应正确处理整小时无分钟的情况', () => {
    expect(formatDuration(120)).toBe('2小时')
    expect(formatDuration(180)).toBe('3小时')
  })

  it('应正确处理只有分钟的情况', () => {
    expect(formatDuration(30)).toBe('30分钟')
    expect(formatDuration(59)).toBe('59分钟')
  })

  it('空值或负数应返回 0分钟', () => {
    expect(formatDuration(null)).toBe('0分钟')
    expect(formatDuration(undefined)).toBe('0分钟')
    expect(formatDuration(-1)).toBe('0分钟')
    expect(formatDuration(0)).toBe('0分钟')
  })
})

describe('formatNumber - 数字格式化', () => {
  it('应正确格式化数字为指定小数位', () => {
    expect(formatNumber(3.14159, 2)).toBe('3.14')
    expect(formatNumber(3.14159, 0)).toBe('3')
    expect(formatNumber(3.5, 1)).toBe('3.5')
  })

  it('应使用默认小数位 2', () => {
    expect(formatNumber(3.14159)).toBe('3.14')
  })

  it('空值应返回 0', () => {
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
  })

  it('应处理字符串数字', () => {
    expect(formatNumber('3.14159', 2)).toBe('3.14')
  })
})

describe('formatWeight - 体重格式化', () => {
  it('应正确格式化体重单位为 kg', () => {
    expect(formatWeight(3.5)).toBe('3.5 kg')
    expect(formatWeight(10)).toBe('10 kg')
  })

  it('空值应返回空字符串', () => {
    expect(formatWeight(null)).toBe('')
    expect(formatWeight(undefined)).toBe('')
    expect(formatWeight('')).toBe('')
  })
})

describe('formatHeight - 身高格式化', () => {
  it('应正确格式化身高单位为 cm', () => {
    expect(formatHeight(50)).toBe('50 cm')
    expect(formatHeight(100.5)).toBe('100.5 cm')
  })

  it('空值应返回空字符串', () => {
    expect(formatHeight(null)).toBe('')
    expect(formatHeight(undefined)).toBe('')
    expect(formatHeight('')).toBe('')
  })
})

describe('getRelativeTime - 相对时间', () => {
  it('应返回"今天"对于今天的日期', () => {
    const today = new Date().toISOString().split('T')[0]
    const result = getRelativeTime(today)
    expect(result).toBe('今天')
  })

  it('应返回"昨天"对于昨天的日期', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const result = getRelativeTime(yesterday)
    expect(result).toBe('昨天')
  })

  it('空值应返回空字符串', () => {
    expect(getRelativeTime(null)).toBe('')
    expect(getRelativeTime(undefined)).toBe('')
    expect(getRelativeTime('')).toBe('')
  })
})

describe('formatDateTime - 日期时间格式化', () => {
  it('应正确格式化日期时间', () => {
    const result = formatDateTime('2026-05-20 14:30:45', 'YYYY-MM-DD HH:mm:ss')
    expect(result).toBe('2026-05-20 14:30:45')
  })

  it('应使用默认格式 YYYY-MM-DD HH:mm:ss', () => {
    const result = formatDateTime('2026-05-20 14:30:45')
    expect(result).toBe('2026-05-20 14:30:45')
  })

  it('空值应返回空字符串', () => {
    expect(formatDateTime(null)).toBe('')
    expect(formatDateTime(undefined)).toBe('')
    expect(formatDateTime('')).toBe('')
  })
})
