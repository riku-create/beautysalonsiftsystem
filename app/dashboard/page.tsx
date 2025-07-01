'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { 
  getShifts, 
  getStaff, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUsers,
  getReservations
} from '@/lib/data'
import { formatDate, getStatusColor, getPositionColor } from '@/lib/utils'
import type { Shift, Staff, Notification } from '@/lib/data'

export default function DashboardPage() {
  const { user, isEmployee, isAdmin } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  // 通知ドロップダウンを外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showNotifications && !target.closest('[data-notification-dropdown]')) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showNotifications])

  useEffect(() => {
    const loadData = () => {
      try {
        setShifts(getShifts())
        setStaff(getStaff())
        setReservations(getReservations())
        
        if (user) {
          // ユーザーIDを取得するため、全ユーザーから検索
          const allUsers = getUsers()
          const currentUser = allUsers.find(u => u.email === user.email)
          if (currentUser) {
            const userNotifications = getUserNotifications(currentUser.id)
            setNotifications(userNotifications)
          }
        }
      } catch (error) {
        console.error('データ読み込みエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user])

  // 通知を既読にする関数
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ))
  }

  // 全通知を既読にする関数
  const handleMarkAllAsRead = () => {
    if (!user) return
    
    const allUsers = getUsers()
    const currentUser = allUsers.find(u => u.email === user.email)
    if (currentUser) {
      markAllNotificationsAsRead(currentUser.id)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  // 統計データを直接計算（外部関数依存を排除）
  const today = new Date().toISOString().split('T')[0]
  
  // シフト統計
  const shiftStats = {
    total: shifts.length,
    approved: shifts.filter(s => s.status === '承認済み').length,
    pending: shifts.filter(s => s.status === '申請中').length,
    rejected: shifts.filter(s => s.status === '却下').length,
    today: shifts.filter(s => s.date === today && s.status === '承認済み').length
  }

  // 予約統計
  const reservationStats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === '確認済み').length,
    pending: reservations.filter(r => r.status === '未確認').length,
    cancelled: reservations.filter(r => r.status === 'キャンセル').length,
    completed: reservations.filter(r => r.status === '完了').length,
    today: reservations.filter(r => r.date === today).length
  }

  // 本日のデータ
  const todayShifts = shifts.filter(s => s.date === today && s.status === '承認済み')
  const todayReservations = reservations.filter(r => r.date === today)

  // 基本統計
  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.isActive).length
  
  // 通知関連
  const unreadNotifications = notifications.filter(n => !n.isRead)
  const recentNotifications = notifications.slice(0, 5) // 最新5件
  
  // 最近のシフト（今日から7日間）
  const recentShifts = shifts
    .filter(s => {
      const shiftDate = new Date(s.date)
      const todayDate = new Date(today)
      const weekFromNow = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      return shiftDate >= todayDate && shiftDate <= weekFromNow
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  // 現在のユーザーのシフト数をチェック
  const userShifts = shifts.filter(s => 
    staff.find(staff => staff.email === user?.email)?.id === s.staffId
  )
  const isNewEmployee = user?.role === 'employee' && userShifts.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">美容室シフト管理システムへようこそ</p>
        </div>
        
        {/* 通知ベル */}
        {notifications.length > 0 && (
          <div className="relative" data-notification-dropdown>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white rounded-lg shadow border hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a50.8 50.8 0 00-4.5-5.5V6a6 6 0 10-12 0v2c0 2-1.5 3.5-4.5 5.5L3 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* 通知ドロップダウン */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">通知</h3>
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        すべて既読
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      通知はありません
                    </div>
                  ) : (
                    recentNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {notification.type === 'shift_edit' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 新規従業員向け案内 */}
      {isNewEmployee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500">
                <span className="text-white text-sm font-bold">👋</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-blue-900">
                ようこそ、{user?.name}さん！
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                アカウント作成ありがとうございます。まずはシフト希望提出から始めましょう。
              </p>
              <div className="mt-4 flex space-x-3">
                <Link
                  href="/dashboard/employee/shifts"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <span className="mr-2">📝</span>
                  シフト希望提出
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  <span className="mr-2">⚙️</span>
                  プロフィール設定
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">総スタッフ数</p>
              <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">今日のシフト</p>
              <p className="text-2xl font-bold text-gray-900">{todayShifts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">申請中シフト</p>
              <p className="text-2xl font-bold text-gray-900">{shiftStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">今日の予約</p>
              <p className="text-2xl font-bold text-gray-900">{todayReservations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - 権限別表示 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isEmployee() && (
            <>
              <Link
                href="/dashboard/employee/shifts"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-200"
              >
                <div className="p-2 bg-orange-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-orange-900">シフト希望提出</p>
                  <p className="text-sm text-orange-700">希望シフトを提出</p>
                </div>
              </Link>

              <Link
                href="/dashboard/employee/all-shifts"
                className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition duration-200"
              >
                <div className="p-2 bg-teal-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-teal-900">全員のシフト</p>
                  <p className="text-sm text-teal-700">チーム全体の確認</p>
                </div>
              </Link>
            </>
          )}

          {isAdmin() && (
            <>
              <Link
                href="/dashboard/admin/shifts"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200"
              >
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-blue-900">AIシフト管理</p>
                  <p className="text-sm text-blue-700">自動シフト作成</p>
                </div>
              </Link>

              <Link
                href="/dashboard/admin/templates"
                className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition duration-200"
              >
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-indigo-900">テンプレート管理</p>
                  <p className="text-sm text-indigo-700">シフトパターンの設定</p>
                </div>
              </Link>

              <Link
                href="/dashboard/admin/staff"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-200"
              >
                <div className="p-2 bg-green-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-green-900">スタッフ管理</p>
                  <p className="text-sm text-green-700">スタッフの追加・編集</p>
                </div>
              </Link>
            </>
          )}

          <Link
            href="/dashboard/calendar"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-200"
          >
            <div className="p-2 bg-purple-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-purple-900">カレンダー表示</p>
              <p className="text-sm text-purple-700">月間スケジュール確認</p>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <div className="p-2 bg-gray-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">設定</p>
              <p className="text-sm text-gray-700">プロフィール・アカウント</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Shifts and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 今週のシフト */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">今週のシフト</h2>
          </div>
          <div className="p-6">
            {recentShifts.length > 0 ? (
              <div className="space-y-3">
                {recentShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{shift.staffName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(shift.date)} • {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(shift.position || '')}`}>
                        {shift.position || '-'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shift.status)}`}>
                        {shift.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">今週のシフトはありません</p>
              </div>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">統計情報</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">承認済みシフト</span>
                <span className="font-medium">{shiftStats.approved}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">申請中シフト</span>
                <span className="font-medium">{shiftStats.pending}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">確認済み予約</span>
                <span className="font-medium">{reservationStats.confirmed}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">アクティブスタッフ</span>
                <span className="font-medium">{activeStaff}名</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">本日の予約</span>
                <span className="font-medium">{todayReservations.length}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}