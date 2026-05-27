import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SleepRecords from '../SleepRecords'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'zh',
    },
  }),
}))

// Mock sleepService
vi.mock('../../services', () => ({
  sleepService: {
    listRecords: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
    getOngoing: vi.fn(),
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
import { sleepService } from '../../services'

const mockRecordsData = {
  success: true,
  records: [
    {
      id: 'sleep_001',
      start_time: '2026-05-19 07:30:00',
      end_time: '2026-05-19 08:15:00',
      sleep_type: 'nap',
      duration_minutes: 45,
      is_ongoing: false,
      notes: '上午小睡',
    },
    {
      id: 'sleep_002',
      start_time: '2026-05-19 13:00:00',
      end_time: '2026-05-19 15:30:00',
      sleep_type: 'nap',
      duration_minutes: 150,
      is_ongoing: false,
      notes: '下午小睡',
    },
  ],
  total: 2,
}

const mockOngoingData = {
  success: true,
  record: {
    id: 'sleep_003',
    start_time: '2026-05-19 21:00:00',
    sleep_type: 'night',
    is_ongoing: true,
  },
}

describe('SleepRecords 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sleepService.listRecords.mockResolvedValue(mockRecordsData)
    sleepService.getOngoing.mockResolvedValue({ success: false })
  })

  describe('组件渲染测试', () => {
    it('组件能够渲染', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        expect(screen.getByText('睡眠记录')).toBeInTheDocument()
      })
    })

    it('应显示添加记录按钮', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        expect(screen.getByText('添加记录')).toBeInTheDocument()
      })
    })
  })

  describe('记录列表测试', () => {
    it('应显示记录列表', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        // 检查表格中的时间
        expect(screen.getByText('2026-05-19 07:30:00')).toBeInTheDocument()
        expect(screen.getByText('2026-05-19 13:00:00')).toBeInTheDocument()
      })
    })

    it('应显示记录类型标签', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        // 检查睡眠类型标签
        const napTags = screen.getAllByText('小睡')
        expect(napTags.length).toBeGreaterThan(0)
      })
    })

    it('应显示已结束状态标签', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        const endedTags = screen.getAllByText('已结束')
        expect(endedTags.length).toBeGreaterThan(0)
      })
    })
  })

  describe('表单测试', () => {
    it('点击添加记录应打开表单弹窗', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        expect(screen.getByText('添加记录')).toBeInTheDocument()
      })

      const addButton = screen.getByText('添加记录')
      await userEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('添加睡眠记录')).toBeInTheDocument()
      })
    })
  })

  describe('编辑功能测试', () => {
    it('点击编辑按钮应打开编辑表单', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        expect(screen.getByText('2026-05-19 07:30:00')).toBeInTheDocument()
      })

      // 查找编辑按钮 (包含"编辑"文字)
      const editButtons = screen.getAllByText('编辑')
      await userEvent.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText('编辑睡眠记录')).toBeInTheDocument()
      })
    })
  })

  describe('操作按钮测试', () => {
    it('应显示开始按钮', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        // 检查是否有开始按钮
        const startButtons = screen.getAllByText('开始')
        expect(startButtons.length).toBeGreaterThan(0)
      })
    })

    it('应显示编辑按钮', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        const editButtons = screen.getAllByText('编辑')
        expect(editButtons.length).toBeGreaterThan(0)
      })
    })

    it('应显示删除按钮', async () => {
      render(<SleepRecords />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('删除')
        expect(deleteButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('进行中睡眠测试', () => {
    it('有进行中睡眠时应显示提示横幅', async () => {
      sleepService.getOngoing.mockResolvedValue(mockOngoingData)

      render(<SleepRecords />)

      await waitFor(() => {
        expect(screen.getByText('宝宝正在睡觉')).toBeInTheDocument()
      })
    })

    it('点击结束睡眠按钮应调用更新接口', async () => {
      sleepService.getOngoing.mockResolvedValue(mockOngoingData)
      sleepService.updateRecord.mockResolvedValue({ success: true })

      render(<SleepRecords />)

      await waitFor(() => {
        expect(screen.getByText('宝宝正在睡觉')).toBeInTheDocument()
      })

      const endButton = screen.getByText('结束睡眠')
      await userEvent.click(endButton)

      await waitFor(() => {
        expect(sleepService.updateRecord).toHaveBeenCalled()
      })
    })
  })
})
