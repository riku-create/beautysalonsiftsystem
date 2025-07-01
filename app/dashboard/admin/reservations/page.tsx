'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { 
  getReservations, 
  updateReservationStatus, 
  type Reservation 
} from '@/lib/data'

export default function AdminReservationsPage() {
  const { user, isAdmin } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin() || !user) return
    
    const loadReservations = () => {
      try {
        const allReservations = getReservations()
        const sortedReservations = allReservations.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setReservations(sortedReservations)
        setLoading(false)
      } catch (error) {
        console.error('予約データ読み込みエラー:', error)
        setLoading(false)
      }
    }
    
    loadReservations()
  }, [user, isAdmin])

  const handleStatusUpdate = async (reservationId: string, status: 'confirmed' | 'rejected' | 'completed' | 'cancelled') => {
    if (!user) return
    
    setActionLoading(reservationId)
    try {
      // User型を適切に変換
      const dataUser = {
        id: user.id,
        email: user.email,
        password: '', // 管理者操作では不要
        name: user.name,
        role: user.role,
        phone: user.phone,
        createdAt: new Date().toISOString()
      }
      
      const success = updateReservationStatus(reservationId, status, dataUser)
      if (success) {
        const updatedReservations = getReservations().sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setReservations(updatedReservations)
      }
    } catch (error) {
      console.error('予約ステータス更新エラー:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (!isAdmin()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">管理者権限が必要です。</p>
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">予約管理</h1>
      <p className="text-gray-600 mb-6">顧客からの予約申請を管理できます</p>
      
      <div className="space-y-4">
        {reservations.length > 0 ? (
          reservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{reservation.customerName}</h3>
                  <p className="text-gray-600">{reservation.customerEmail} • {reservation.customerPhone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  reservation.status === '未確認' ? 'bg-yellow-100 text-yellow-800' :
                  reservation.status === '確認済み' ? 'bg-green-100 text-green-800' :
                  reservation.status === '完了' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {reservation.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">日時</span>
                    <span className="font-medium">
                      {new Date(reservation.date).toLocaleDateString('ja-JP')} {reservation.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">サービス</span>
                    <span className="font-medium">{reservation.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">担当者</span>
                    <span className="font-medium">{reservation.staffName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">料金</span>
                    <span className="font-medium">¥{reservation.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">申請日</span>
                    <span className="font-medium">
                      {new Date(reservation.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>

              {reservation.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700"><strong>備考:</strong> {reservation.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {reservation.status === '未確認' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                      disabled={actionLoading === reservation.id}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      {actionLoading === reservation.id ? '処理中...' : '承認'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(reservation.id, 'rejected')}
                      disabled={actionLoading === reservation.id}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      {actionLoading === reservation.id ? '処理中...' : '否認'}
                    </button>
                  </>
                )}
                
                {reservation.status === '確認済み' && (
                  <button
                    onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                    disabled={actionLoading === reservation.id}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    {actionLoading === reservation.id ? '処理中...' : '完了にする'}
                  </button>
                )}
                
                {(reservation.status === '完了' || reservation.status === 'キャンセル') && (
                  <span className="text-sm text-gray-500 py-2">
                    最終ステータス: {reservation.status}
                  </span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">予約がありません</h3>
            <p className="text-gray-600">顧客からの予約申請をお待ちしています</p>
          </div>
        )}
      </div>
    </div>
  )
} 