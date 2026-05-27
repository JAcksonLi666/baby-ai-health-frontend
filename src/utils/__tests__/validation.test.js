import { describe, it, expect } from 'vitest'
import { validation } from '../validation'

describe('validation.isEmpty - 验证值是否为空', () => {
  it('应正确识别空值', () => {
    expect(validation.isEmpty(null)).toBe(true)
    expect(validation.isEmpty(undefined)).toBe(true)
    expect(validation.isEmpty('')).toBe(true)
  })

  it('应正确识别非空值', () => {
    expect(validation.isEmpty('hello')).toBe(false)
    expect(validation.isEmpty(0)).toBe(false)
    expect(validation.isEmpty(false)).toBe(false)
    expect(validation.isEmpty([])).toBe(false)
    expect(validation.isEmpty({})).toBe(false)
  })
})

describe('validation.isEmail - 验证邮箱格式', () => {
  it('应正确验证有效邮箱', () => {
    expect(validation.isEmail('test@example.com')).toBe(true)
    expect(validation.isEmail('user.name@domain.co.uk')).toBe(true)
    expect(validation.isEmail('user+tag@gmail.com')).toBe(true)
  })

  it('应拒绝无效邮箱', () => {
    expect(validation.isEmail('invalid')).toBe(false)
    expect(validation.isEmail('invalid@')).toBe(false)
    expect(validation.isEmail('@example.com')).toBe(false)
    expect(validation.isEmail('test@')).toBe(false)
    expect(validation.isEmail('test @example.com')).toBe(false)
  })
})

describe('validation.isPhone - 验证手机号格式', () => {
  it('应正确验证有效的中国手机号', () => {
    expect(validation.isPhone('13812345678')).toBe(true)
    expect(validation.isPhone('15912345678')).toBe(true)
    expect(validation.isPhone('18812345678')).toBe(true)
  })

  it('应拒绝无效手机号', () => {
    expect(validation.isPhone('12345678901')).toBe(false)
    expect(validation.isPhone('1381234567')).toBe(false)
    expect(validation.isPhone('abc12345678')).toBe(false)
    expect(validation.isPhone('138123456789')).toBe(false)
  })
})

describe('validation.isUrl - 验证 URL 格式', () => {
  it('应正确验证有效 URL', () => {
    expect(validation.isUrl('https://example.com')).toBe(true)
    expect(validation.isUrl('http://example.com/path')).toBe(true)
    expect(validation.isUrl('https://example.com/path?query=1')).toBe(true)
  })

  it('应拒绝无效 URL', () => {
    expect(validation.isUrl('invalid')).toBe(false)
    expect(validation.isUrl('example.com')).toBe(false)
    expect(validation.isUrl('')).toBe(false)
  })
})

describe('validation.isNumber - 验证数字', () => {
  it('应正确识别数字', () => {
    expect(validation.isNumber(123)).toBe(true)
    expect(validation.isNumber('123')).toBe(true)
    expect(validation.isNumber('3.14')).toBe(true)
    expect(validation.isNumber(-10)).toBe(true)
  })

  it('应拒绝非数字', () => {
    expect(validation.isNumber('abc')).toBe(false)
    expect(validation.isNumber(NaN)).toBe(false)
  })
})

describe('validation.isPositiveNumber - 验证正数', () => {
  it('应正确识别正数', () => {
    expect(validation.isPositiveNumber(1)).toBe(true)
    expect(validation.isPositiveNumber('5')).toBe(true)
    expect(validation.isPositiveNumber(0.5)).toBe(true)
  })

  it('应拒绝非正数', () => {
    expect(validation.isPositiveNumber(0)).toBe(false)
    expect(validation.isPositiveNumber(-1)).toBe(false)
    expect(validation.isPositiveNumber('abc')).toBe(false)
  })
})

describe('validation.isDate - 验证日期', () => {
  it('应正确识别有效日期', () => {
    expect(validation.isDate('2026-05-20')).toBe(true)
    expect(validation.isDate('2026-05-20 14:30:00')).toBe(true)
    expect(validation.isDate(new Date())).toBe(true)
  })

  it('应拒绝无效日期', () => {
    expect(validation.isDate('invalid')).toBe(false)
    expect(validation.isDate('')).toBe(false)
  })
})

describe('validation.minLength - 最小长度验证', () => {
  it('应正确验证最小长度', () => {
    expect(validation.minLength('hello', 3)).toBe(true)
    expect(validation.minLength('hello', 5)).toBe(true)
    expect(validation.minLength('hi', 3)).toBe(false)
  })

  it('应处理数字', () => {
    expect(validation.minLength(12345, 3)).toBe(true)
    expect(validation.minLength(12, 3)).toBe(false)
  })
})

describe('validation.maxLength - 最大长度验证', () => {
  it('应正确验证最大长度', () => {
    expect(validation.maxLength('hello', 5)).toBe(true)
    expect(validation.maxLength('hello', 10)).toBe(true)
    expect(validation.maxLength('hello', 3)).toBe(false)
  })
})

describe('validation.between - 范围验证', () => {
  it('应正确验证值在范围内', () => {
    expect(validation.between(5, 1, 10)).toBe(true)
    expect(validation.between(1, 1, 10)).toBe(true)
    expect(validation.between(10, 1, 10)).toBe(true)
  })

  it('应拒绝超出范围的值', () => {
    expect(validation.between(0, 1, 10)).toBe(false)
    expect(validation.between(11, 1, 10)).toBe(false)
  })

  it('应处理字符串数字', () => {
    expect(validation.between('5', 1, 10)).toBe(true)
    expect(validation.between('5', '1', '10')).toBe(true)
  })
})

describe('validation.validateSleepDuration - 睡眠时长验证', () => {
  it('应正确验证有效睡眠时长', () => {
    expect(validation.validateSleepDuration(0, 30)).toBe(true)
    expect(validation.validateSleepDuration(1, 0)).toBe(true)
    expect(validation.validateSleepDuration(8, 30)).toBe(true)
  })

  it('应拒绝无效睡眠时长', () => {
    expect(validation.validateSleepDuration(0, 0)).toBe(false)
    expect(validation.validateSleepDuration(25, 0)).toBe(false) // 超过24小时
  })
})

describe('validation.validateWeight - 体重验证', () => {
  it('应正确验证有效体重 (kg)', () => {
    expect(validation.validateWeight(3.5)).toBe(true)
    expect(validation.validateWeight(10)).toBe(true)
    expect(validation.validateWeight(0.5)).toBe(true)
    expect(validation.validateWeight(50)).toBe(true)
  })

  it('应拒绝超出范围的体重', () => {
    expect(validation.validateWeight(0.3)).toBe(false)
    expect(validation.validateWeight(60)).toBe(false)
    expect(validation.validateWeight(-1)).toBe(false)
  })
})

describe('validation.validateHeight - 身高验证', () => {
  it('应正确验证有效身高 (cm)', () => {
    expect(validation.validateHeight(50)).toBe(true)
    expect(validation.validateHeight(100)).toBe(true)
    expect(validation.validateHeight(30)).toBe(true)
    expect(validation.validateHeight(200)).toBe(true)
  })

  it('应拒绝超出范围的身高', () => {
    expect(validation.validateHeight(20)).toBe(false)
    expect(validation.validateHeight(250)).toBe(false)
  })
})

describe('validation.validateAge - 年龄验证', () => {
  it('应正确验证有效的月龄', () => {
    expect(validation.validateAge(0)).toBe(true)
    expect(validation.validateAge(12)).toBe(true)
    expect(validation.validateAge(240)).toBe(true) // 20岁
  })

  it('应拒绝超出范围的年龄', () => {
    expect(validation.validateAge(-1)).toBe(false)
    expect(validation.validateAge(300)).toBe(false)
  })
})

describe('validation.validateLabValue - 检验值验证', () => {
  it('应正确判断正常值', () => {
    expect(validation.validateLabValue(50, '0-100')).toBe('normal')
    expect(validation.validateLabValue(10, '0-100')).toBe('normal')
    expect(validation.validateLabValue(100, '0-100')).toBe('normal')
  })

  it('应正确判断低于参考范围的值', () => {
    expect(validation.validateLabValue(5, '10-100')).toBe('low')
  })

  it('应正确判断高于参考范围的值', () => {
    expect(validation.validateLabValue(150, '0-100')).toBe('high')
  })

  it('应处理无效输入', () => {
    expect(validation.validateLabValue(null, '0-100')).toBe(null)
    expect(validation.validateLabValue(50, null)).toBe(null)
    expect(validation.validateLabValue(50, '')).toBe(null)
    expect(validation.validateLabValue('invalid', '0-100')).toBe(null)
  })
})
