'use client'

import { useAuth } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode, useCallback } from 'react'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: ReactNode
}

// ログアウトボタンコンポーネント
function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()
  
  const handleLogout = useCallback(() => {
    logout()
    router.push('/')
  }, [logout, router])

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition duration-200"
    >
      ログアウト
    </button>
  )
}

// ナビゲーションアイテムコンポーネント
function NavigationItem({ item }: { item: { name: string; href: string; icon: string } }) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <li>
      <Link
        href={item.href}
        className={`flex items-center px-4 py-2 rounded-lg transition duration-200 ${
          isActive 
            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <span className="mr-3 text-lg">{item.icon}</span>
        {item.name}
      </Link>
    </li>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isEmployee, isAdmin, isCustomer } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // 権限に基づいたナビゲーション
  const navigation = isAdmin() ? [
    // 管理者用ナビゲーション
    { name: 'ダッシュボード', href: '/dashboard', icon: '🏠' },
    { name: 'AIシフト管理', href: '/dashboard/admin/shifts', icon: '🤖' },
    { name: 'シフト条件設定', href: '/dashboard/admin/shifts/conditions', icon: '⚙️' },
    { name: 'テンプレート管理', href: '/dashboard/admin/templates', icon: '📋' },
    { name: 'スタッフ管理', href: '/dashboard/admin/staff', icon: '👥' },
    { name: '予約管理', href: '/dashboard/admin/reservations', icon: '📝' },
    { name: 'カレンダー', href: '/dashboard/calendar', icon: '📆' },
    { name: '設定', href: '/dashboard/settings', icon: '⚙️' },
  ] : isEmployee() ? [
    // 従業員用ナビゲーション
    { name: 'ダッシュボード', href: '/dashboard', icon: '🏠' },
    { name: 'シフト希望提出', href: '/dashboard/employee/shifts', icon: '📝' },
    { name: '全員のシフト', href: '/dashboard/employee/all-shifts', icon: '👥' },
    { name: 'カレンダー', href: '/dashboard/calendar', icon: '📆' },
    { name: '設定', href: '/dashboard/settings', icon: '⚙️' },
  ] : [
    // 予約者用ナビゲーション
    { name: 'ダッシュボード', href: '/dashboard/customer', icon: '🏠' },
    { name: '新規予約', href: '/dashboard/customer/booking', icon: '📝' },
    { name: '予約履歴', href: '/dashboard/customer/history', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                美容室シフト管理
              </Link>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700">美容室シフト管理システム</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                こんにちは、{user.name}さん ({
                  user.role === 'admin' ? '管理者' : 
                  user.role === 'employee' ? '従業員' : 
                  '予約者'
                })
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <NavigationItem key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 