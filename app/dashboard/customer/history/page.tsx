'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getCustomerReservations, type Reservation } from '@/lib/data'
import Link from 'next/link'

type FilterStatus = 'all' | '未確認' | '確認済み' | '完了' | 'キャンセル'

export default function ReservationHistoryPage() {
  const { user, isCustomer } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isCustomer() || !user) return
    
    const loadReservations = () => {
      try {
        const customerReservations = getCustomerReservations(user.id)
        const sortedReservations = customerReservations.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setReservations(sortedReservations)
        setFilteredReservations(sortedReservations)
        setLoading(false)
      } catch (error) {
        console.error('予約履歴読み込みエラー:', error)
        setLoading(false)
      }
    }
    
    loadReservations()
  }, [user, isCustomer])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReservations(reservations)
    } else {
      setFilteredReservations(reservations.filter(r => r.status === statusFilter))
    }
  }, [statusFilter, reservations])

  const getStatusColor = (status: string) => {
    switch (status) {
      case '未確認':
        return 'bg-yellow-100 text-yellow-800'
      case '確認済み':
        return 'bg-green-100 text-green-800'
      case '完了':
        return 'bg-blue-100 text-blue-800'
      case 'キャンセル':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusCount = (status: FilterStatus) => {
    if (status === 'all') return reservations.length
    return reservations.filter(r => r.status === status).length
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <Link href="/dashboard/customer" className="hover:text-blue-600">
            ダッシュボード
          </Link>
          <span>›</span>
          <span>予約履歴</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">予約履歴</h1>
            <p className="text-gray-600">過去の予約を確認できます</p>
          </div>
          <Link
            href="/dashboard/customer/booking"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            新規予約
          </Link>
        </div>
      </div>

      {/* ステータスフィルター */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all' as FilterStatus, label: 'すべて' },
            { key: '未確認' as FilterStatus, label: '未確認' },
            { key: '確認済み' as FilterStatus, label: '確認済み' },
            { key: '完了' as FilterStatus, label: '完了' },
            { key: 'キャンセル' as FilterStatus, label: 'キャンセル' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({getStatusCount(filter.key)})
            </button>
          ))}
        </div>
      </div>

      {/* 予約一覧 */}
      <div className="space-y-4">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(reservation.date).toLocaleDateString('ja-JP', { 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </h3>
                    <p className="text-gray-600">
                      {reservation.startTime} - {reservation.endTime}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">サービス</span>
                    <span className="font-medium">{reservation.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">担当者</span>
                    <span className="font-medium">{reservation.staffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">料金</span>
                    <span className="font-medium">¥{reservation.price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">申請日</span>
                    <span className="font-medium">
                      {new Date(reservation.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  {reservation.notes && (
                    <div>
                      <span className="text-gray-600 block mb-1">備考</span>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {reservation.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 予約状況に応じたアクション */}
              <div className="mt-4 pt-4 border-t">
                {reservation.status === '未確認' && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-yellow-700">
                      予約申請が送信されました。管理者による確認をお待ちください。
                    </p>
                  </div>
                )}
                {reservation.status === '確認済み' && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-700">
                      予約が確定しました。当日は時間通りにお越しください。
                    </p>
                  </div>
                )}
                {reservation.status === '完了' && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-700">
                      サービスが完了しました。ご利用ありがとうございました。
                    </p>
                  </div>
                )}
                {reservation.status === 'キャンセル' && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      この予約はキャンセルされました。
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? '予約履歴がありません' : `${statusFilter}の予約がありません`}
            </h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all' 
                ? '初回予約を作成して美容サービスをご利用ください'
                : '別のステータスの予約を確認するか、新しい予約を作成してください'
              }
            </p>
            <Link
              href="/dashboard/customer/booking"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              新規予約を作成
            </Link>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      {reservations.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {reservations.length}
            </div>
            <div className="text-sm text-gray-600">総予約数</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {reservations.filter(r => r.status === '完了').length}
            </div>
            <div className="text-sm text-gray-600">完了</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {reservations.filter(r => r.status === '未確認').length}
            </div>
            <div className="text-sm text-gray-600">未確認</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ¥{reservations.filter(r => r.status === '完了').reduce((sum, r) => sum + r.price, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">総利用額</div>
          </div>
        </div>
      )}
    </div>
  )
} 