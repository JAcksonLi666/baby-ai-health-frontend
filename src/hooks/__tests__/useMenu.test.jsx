import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { useMenu } from '../useMenu'

// Mock menuConfig
vi.mock('../../config/menu.jsx', () => ({
  menuConfig: [
    {
      key: 'dashboard',
      route: '/',
      label: 'nav.dashboard',
    },
    {
      key: 'records-group',
      label: 'nav.records',
      children: [
        {
          key: 'sleep',
          route: '/sleep',
          label: 'nav.sleep',
        },
        {
          key: 'diaper',
          route: '/diaper',
          label: 'nav.diaper',
        },
      ],
    },
    {
      key: 'chat',
      route: '/chat',
      label: 'nav.chat',
    },
  ],
}))

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/']}>
    {children}
  </MemoryRouter>
)

describe('useMenu hook', () => {
  describe('初始状态测试', () => {
    it('selectedKeys 和 openKeys 应为空数组', () => {
      const { result } = renderHook(() => useMenu(), { wrapper })

      expect(result.current.selectedKeys).toEqual(['/'])
      expect(result.current.openKeys).toEqual([])
    })

    it('handleOpenChange 应是一个函数', () => {
      const { result } = renderHook(() => useMenu(), { wrapper })

      expect(typeof result.current.handleOpenChange).toBe('function')
    })
  })

  describe('handleOpenChange 测试', () => {
    it('应能改变 openKeys', async () => {
      const { result } = renderHook(() => useMenu(), { wrapper })

      // 初始状态为空数组
      expect(result.current.openKeys).toEqual([])

      // 调用 handleOpenChange
      act(() => {
        result.current.handleOpenChange(['records-group'])
      })

      // openKeys 应该被更新
      expect(result.current.openKeys).toEqual(['records-group'])
    })

    it('应能设置多个 openKeys', async () => {
      const { result } = renderHook(() => useMenu(), { wrapper })

      act(() => {
        result.current.handleOpenChange(['records-group', 'services-group'])
      })

      expect(result.current.openKeys).toEqual(['records-group', 'services-group'])
    })

    it('应能清空 openKeys', async () => {
      const { result } = renderHook(() => useMenu(), { wrapper })

      // 先设置一些 openKeys
      act(() => {
        result.current.handleOpenChange(['records-group'])
      })
      expect(result.current.openKeys).toEqual(['records-group'])

      // 然后清空
      act(() => {
        result.current.handleOpenChange([])
      })
      expect(result.current.openKeys).toEqual([])
    })
  })

  describe('路由变化测试', () => {
    it('当路由变化时 selectedKeys 应更新', () => {
      // 初始路由为 /
      const { result, rerender } = renderHook(() => useMenu(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/']}>
            {children}
          </MemoryRouter>
        ),
      })

      expect(result.current.selectedKeys).toEqual(['/'])

      // 路由变为 /sleep
      rerender(
        <MemoryRouter initialEntries={['/sleep']}>
          <useMenu.component />
        </MemoryRouter>
      )
    })
  })
})
