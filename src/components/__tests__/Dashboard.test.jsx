import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '../Dashboard'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'zh',
    },
  }),
}))

// Mock dashboardService
vi.mock('../../services', () => ({
  dashboardService: {
    getTodaySummary: vi.fn(),
  },
}))

// Mock message
vi.mock('antd', async () => {
  const antd = await vi.importActual('antd')
  return {
    ...antd,
    message: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }
})

// 导入 mock 后的服务
import { dashboardService } from '../../services'

const mockSummaryData = {
  success: true,
  date: '2026-05-19',
  sleep: {
    total_minutes: 270,
    total_display: '4小时30分钟',
    nap_count: 2,
    nap_minutes: 180,
    night_minutes: 90,
    is_ongoing: false,
    record_count: 3,
  },
  diaper: {
    total_count: 2,
    pee_count: 1,
    poop_count: 0,
    both_count: 1,
    colors: ['yellow'],
    has_abnormal: false,
  },
  cry: {
    total_minutes: 13,
    total_count: 3,
    reason_counts: { hungry: 2, sleepy: 1 },
    top_reason: 'hungry',
    is_ongoing: false,
  },
  insights: [
    '今日睡眠总计4小时30分钟，建议增加夜间睡眠时间',
    '今日换尿布2次，颜色正常',
    '今日哭闹3次，主要原因是饥饿',
  ],
}

describe('Dashboard 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染测试', () => {
    it('组件能够渲染', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('dashboard.title')).toBeInTheDocument()
      })
    })

    it('应显示加载状态', async () => {
      dashboardService.getTodaySummary.mockImplementation(
        () => new Promise(() => {}) // 永不 resolved
      )

      const { container } = render(<Dashboard />)

      // 检查是否有 loading 元素
      await waitFor(() => {
        const loadingElement = container.querySelector('.ant-spin')
        expect(loadingElement).toBeTruthy()
      })
    })
  })

  describe('数据显示测试', () => {
    it('应显示统计卡片', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        // 检查睡眠卡片标题
        expect(screen.getByText('dashboard.sleep')).toBeInTheDocument()
        // 检查尿布卡片标题
        expect(screen.getByText('dashboard.diaper')).toBeInTheDocument()
        // 检查哭闹卡片标题
        expect(screen.getByText('dashboard.cry')).toBeInTheDocument()
      })
    })

    it('应显示睡眠时长', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('4小时30分钟')).toBeInTheDocument()
      })
    })

    it('应显示睡眠次数', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        // 使用 getAllByText 因为可能有多个元素包含 "2"
        const elements = screen.getAllByText('2')
        expect(elements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('应显示尿布次数', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        // 使用 getAllByText 因为可能有多个元素包含 "2"
        const elements = screen.getAllByText('2')
        expect(elements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('应显示哭闹次数', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        // 使用 getAllByText 因为可能有多个元素包含 "3"
        const elements = screen.getAllByText('3')
        expect(elements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('应显示 insights 列表', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('dashboard.insights')).toBeInTheDocument()
        expect(screen.getByText(/今日睡眠总计4小时30分钟/)).toBeInTheDocument()
      })
    })
  })

  describe('刷新功能测试', () => {
    it('应显示刷新按钮', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('dashboard.refresh')).toBeInTheDocument()
      })
    })

    it('点击刷新按钮应重新获取数据', async () => {
      dashboardService.getTodaySummary.mockResolvedValue(mockSummaryData)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('dashboard.title')).toBeInTheDocument()
      })

      // 清空之前的 mock 调用
      dashboardService.getTodaySummary.mockClear()

      // 点击刷新按钮
      const refreshButton = screen.getByText('dashboard.refresh')
      await userEvent.click(refreshButton)

      // 验证 getTodaySummary 被再次调用
      expect(dashboardService.getTodaySummary).toHaveBeenCalled()
    })
  })

  describe('错误处理测试', () => {
    it('API 失败时应显示错误消息', async () => {
      const { message } = await import('antd')
      dashboardService.getTodaySummary.mockResolvedValue({
        success: false,
        message: '获取数据失败',
      })

      render(<Dashboard />)

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('获取数据失败')
      })
    })

    it('网络错误时应显示错误消息', async () => {
      const { message } = await import('antd')
      dashboardService.getTodaySummary.mockRejectedValue(new Error('Network Error'))

      render(<Dashboard />)

      await waitFor(() => {
        expect(message.error).toHaveBeenCalled()
      })
    })
  })

  describe('特殊状态测试', () => {
    it('进行中的睡眠应显示标签', async () => {
      const dataWithOngoingSleep = {
        ...mockSummaryData,
        sleep: {
          ...mockSummaryData.sleep,
          is_ongoing: true,
        },
      }
      dashboardService.getTodaySummary.mockResolvedValue(dataWithOngoingSleep)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('dashboard.sleeping')).toBeInTheDocument()
      })
    })

    it('异常尿布颜色应显示警告标签', async () => {
      const dataWithAbnormal = {
        ...mockSummaryData,
        diaper: {
          ...mockSummaryData.diaper,
          has_abnormal: true,
        },
      }
      dashboardService.getTodaySummary.mockResolvedValue(dataWithAbnormal)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('dashboard.abnormalColor')).toBeInTheDocument()
      })
    })
  })
})
