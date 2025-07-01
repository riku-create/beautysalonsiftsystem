'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getShifts, getStaff, type Shift, type Staff } from '@/lib/data'

export default function AllShiftsPage() {
  const { user, isEmployee } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (!isEmployee()) {
      return
    }

    const loadData = () => {
      try {
        const allShifts = getShifts()
        const allStaff = getStaff()
        
        setShifts(allShifts)
        setStaff(allStaff)
        
        // 今日の日付をデフォルトに設定
        const today = new Date().toISOString().split('T')[0]
        setSelectedDate(today)
      } catch (error) {
        console.error('データ読み込みエラー:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isEmployee])

  // 権限チェック
  if (!isEmployee()) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">アクセス権限がありません</h1>
        <p className="text-gray-600 mt-2">従業員のみアクセスできるページです。</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    )
  }

  // スタッフ情報を取得する関数
  const getStaffInfo = (staffId: string) => {
    return staff.find(s => s.id === staffId) || { name: '不明', position: '不明' }
  }

  // フィルタリングされたシフト
  const filteredShifts = shifts.filter(shift => {
    const dateMatch = selectedDate ? shift.date === selectedDate : true
    const statusMatch = filterStatus === 'all' || shift.status === filterStatus
    return dateMatch && statusMatch
  })

  // 日付でグループ化
  const groupedShifts = filteredShifts.reduce((groups, shift) => {
    const date = shift.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(shift)
    return groups
  }, {} as Record<string, Shift[]>)

  // 日付を昇順でソート
  const sortedDates = Object.keys(groupedShifts).sort()

  // ステータス色の取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case '承認済み': return 'bg-green-100 text-green-800'
      case '申請中': return 'bg-yellow-100 text-yellow-800'
      case '却下': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📅 全員のシフト確認</h1>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 日付フィルター */}
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              日付を選択
            </label>
            <input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* ステータスフィルター */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべて</option>
              <option value="承認済み">承認済み</option>
              <option value="申請中">申請中</option>
              <option value="却下">却下</option>
            </select>
          </div>
        </div>

        {filteredShifts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">シフトが見つかりません</h3>
            <p className="text-gray-600">指定した条件のシフトはありません。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {groupedShifts[date]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(shift => {
                      const staffInfo = getStaffInfo(shift.staffId)
                      return (
                        <div key={shift.id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {shift.staffName}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  ({staffInfo.position})
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shift.status)}`}>
                                  {shift.status}
                                </span>
                              </div>
                              
                              <div className="mt-2 flex items-center text-sm text-gray-600 space-x-4">
                                <span>⏰ {shift.startTime} - {shift.endTime}</span>
                                {shift.position && (
                                  <span>👤 {shift.position}</span>
                                )}
                                {shift.breakStart && shift.breakEnd && (
                                  <span>☕ 休憩: {shift.breakStart} - {shift.breakEnd}</span>
                                )}
                              </div>
                              
                              {shift.notes && (
                                <div className="mt-2 text-sm text-gray-600">
                                  📝 {shift.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 情報パネル */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">💡 全員のシフト確認について</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>このページでは全スタッフのシフトを確認できます</li>
                <li>編集はできませんが、他の人の勤務予定を把握することができます</li>
                <li>日付やステータスでフィルタリングして表示できます</li>
                <li>自分のシフト申請は「シフト申請」ページから行ってください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 