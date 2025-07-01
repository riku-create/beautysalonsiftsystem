'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getCustomerReservations, getUserNotifications, markNotificationAsRead, type Reservation, type Notification } from '@/lib/data'
import Link from 'next/link'

export default function CustomerDashboard() {
  const { user, isCustomer } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isCustomer() || !user) return
    
    const loadData = () => {
      try {
        // 予約データを取得
        const customerReservations = getCustomerReservations(user.id)
        setReservations(customerReservations)
        
        // 通知データを取得
        const userNotifications = getUserNotifications(user.id)
        setNotifications(userNotifications)
        
        setLoading(false)
      } catch (error) {
        console.error('データ読み込みエラー:', error)
        setLoading(false)
      }
    }
    
    loadData()
  }, [user, isCustomer])

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }

  if (!isCustomer()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">予約者権限が必要です。</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // 今後の予約（未確認・確認済み）
  const upcomingReservations = reservations.filter(r => 
    r.status === '未確認' || r.status === '確認済み'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 過去の予約（完了・キャンセル）
  const pastReservations = reservations.filter(r => 
    r.status === '完了' || r.status === 'キャンセル'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const unreadNotifications = notifications.filter(n => !n.isRead)

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.name}さんのダッシュボード
          </h1>
          <p className="text-gray-600">予約状況を確認できます</p>
        </div>
        
        <Link
          href="/dashboard/customer/booking"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          新規予約
        </Link>
      </div>

      {/* 通知 */}
      {unreadNotifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            未読通知 ({unreadNotifications.length}件)
          </h2>
          <div className="space-y-2">
            {unreadNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="bg-white p-3 rounded border cursor-pointer hover:bg-gray-50"
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 今後の予約 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">今後の予約</h2>
        </div>
        <div className="p-6">
          {upcomingReservations.length > 0 ? (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-medium">
                          {new Date(reservation.date).toLocaleDateString('ja-JP', { 
                            month: 'long', 
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </span>
                        <span className="text-lg font-medium">
                          {reservation.startTime} - {reservation.endTime}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">
                        サービス: {reservation.service}
                      </p>
                      <p className="text-gray-600 mb-1">
                        担当者: {reservation.staffName}
                      </p>
                      <p className="text-gray-600">
                        料金: ¥{reservation.price.toLocaleString()}
                      </p>
                      {reservation.notes && (
                        <p className="text-gray-600 text-sm mt-2">
                          備考: {reservation.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        reservation.status === '確認済み' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">今後の予約はありません</p>
              <Link
                href="/dashboard/customer/booking"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                新しい予約を作成する
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/customer/booking"
          className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-blue-200 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">新規予約</h3>
              <p className="text-sm text-gray-600">サービスを選んで予約申請</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/history"
          className="bg-gray-50 hover:bg-gray-100 p-6 rounded-lg border border-gray-200 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">予約履歴</h3>
              <p className="text-sm text-gray-600">過去の予約を確認</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 最近の履歴 */}
      {pastReservations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">最近の履歴</h2>
              <Link
                href="/dashboard/customer/history"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                すべて見る
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {pastReservations.slice(0, 3).map((reservation) => (
                <div key={reservation.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">
                      {new Date(reservation.date).toLocaleDateString('ja-JP')} - {reservation.service}
                    </p>
                    <p className="text-sm text-gray-600">{reservation.staffName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reservation.status === '完了' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 