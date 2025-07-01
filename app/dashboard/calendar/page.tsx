'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { 
  getShifts, 
  getStaff, 
  getReservations, 
  getShiftTemplates,
  saveShifts,
  updateShift,
  getUsers,
  type Shift, 
  type Staff, 
  type Reservation,
  type ShiftTemplate
} from '@/lib/data'
import { formatDate, getPositionColor, getStatusColor, getReservationStatusColor } from '@/lib/utils'

type ViewMode = 'all' | 'shifts' | 'reservations'

export default function CalendarPage() {
  const { user, isAdmin } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    setShifts(getShifts())
    setReservations(getReservations())
    setStaff(getStaff())
    setTemplates(getShiftTemplates())
  }, [])

  // 月の日数を取得
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // 月の最初の日の曜日を取得
  const getFirstDayOfWeek = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // 月曜日を0とする
  }

  // 日付範囲の生成
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfWeek = getFirstDayOfWeek(currentDate)
    const days = []

    // 前月の末尾日
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
      const day = prevMonth.getDate() - i
      days.push({
        day,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day),
        isCurrentMonth: false
      })
    }

    // 当月の日
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        isCurrentMonth: true
      })
    }

    // 次月の最初日（6週分にする）
    const totalCells = 42
    const remainingCells = totalCells - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
        isCurrentMonth: false
      })
    }

    return days
  }

  // 特定の日のシフトを取得
  const getShiftsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return shifts.filter(shift => shift.date === dateString)
  }

  // 特定の日の予約を取得
  const getReservationsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return reservations.filter(reservation => reservation.date === dateString)
  }

  // 表示するアイテムを取得
  const getItemsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const dayShifts = viewMode === 'reservations' ? [] : shifts.filter(shift => shift.date === dateString)
    const dayReservations = viewMode === 'shifts' ? [] : reservations.filter(reservation => reservation.date === dateString)
    
    return { shifts: dayShifts, reservations: dayReservations }
  }

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // シフトクリック時の処理（管理者のみ）
  const handleShiftClick = (shift: Shift) => {
    if (isAdmin()) {
      setSelectedShift(shift)
      setShowShiftModal(true)
    }
  }

  // シフト承認・否認処理
  const handleShiftApproval = async (shiftId: string, action: '承認済み' | '却下') => {
    try {
      const updatedShifts = shifts.map(shift => 
        shift.id === shiftId 
          ? { ...shift, status: action, updatedAt: new Date().toISOString() }
          : shift
      )
      saveShifts(updatedShifts)
      setShifts(updatedShifts)
      setMessage({ 
        type: 'success', 
        text: `シフトを${action === '承認済み' ? '承認' : '却下'}しました` 
      })
      
      // 選択されたシフトを更新
      if (selectedShift?.id === shiftId) {
        const updatedShift = updatedShifts.find(s => s.id === shiftId)
        if (updatedShift) {
          setSelectedShift(updatedShift)
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作に失敗しました' })
    }
  }

  // シフト削除処理
  const handleShiftDelete = async (shiftId: string) => {
    if (!confirm('このシフトを削除しますか？')) {
      return
    }

    try {
      const updatedShifts = shifts.filter(s => s.id !== shiftId)
      saveShifts(updatedShifts)
      setShifts(updatedShifts)
      setMessage({ type: 'success', text: 'シフトを削除しました' })
      setShowShiftModal(false)
      setSelectedShift(null)
    } catch (error) {
      setMessage({ type: 'error', text: '削除に失敗しました' })
    }
  }

  // シフトテンプレートの取得
  const getTemplateForShift = (shift: Shift) => {
    return templates.find(t => t.id === shift.templateId)
  }

  // スタッフ情報の取得
  const getStaffInfo = (staffId: string) => {
    return staff.find(s => s.id === staffId)
  }

  // 選択された日のシフトと予約
  const selectedDateShifts = selectedDate 
    ? shifts.filter(shift => shift.date === selectedDate)
    : []
  const selectedDateReservations = selectedDate 
    ? reservations.filter(reservation => reservation.date === selectedDate)
    : []

  const calendarDays = generateCalendarDays()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">カレンダー</h1>
          <p className="text-gray-600">
            {isAdmin() ? 'シフトをクリックして管理できます' : 'シフトと予約の確認ができます'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-sm rounded-md transition duration-200 ${
                viewMode === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setViewMode('shifts')}
              className={`px-3 py-1 text-sm rounded-md transition duration-200 ${
                viewMode === 'shifts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              シフト
            </button>
            <button
              onClick={() => setViewMode('reservations')}
              className={`px-3 py-1 text-sm rounded-md transition duration-200 ${
                viewMode === 'reservations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              予約
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            今日
          </button>
        </div>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => changeMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((calendarDay, index) => {
                  const items = getItemsForDate(calendarDay.date)
                  const dateString = calendarDay.date.toISOString().split('T')[0]
                  const isToday = dateString === today
                  const isSelected = selectedDate === dateString

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition duration-200 hover:bg-gray-50 ${
                        !calendarDay.isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                      } ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDate(isSelected ? null : dateString)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                        {calendarDay.day}
                      </div>
                      
                      {/* シフト表示 */}
                      <div className="space-y-1">
                        {items.shifts.slice(0, 3).map((shift) => {
                          const template = getTemplateForShift(shift)
                          return (
                            <div
                              key={shift.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer transition duration-200 ${
                                isAdmin() ? 'hover:opacity-80' : ''
                              }`}
                              style={{ 
                                backgroundColor: template?.color || '#6B7280',
                                color: 'white'
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShiftClick(shift)
                              }}
                              title={`${shift.staffName} (${shift.startTime}-${shift.endTime}) - ${shift.status}`}
                            >
                              {shift.staffName}
                            </div>
                          )
                        })}
                        
                        {/* 予約表示 */}
                        {items.reservations.slice(0, 2).map((reservation) => (
                          <div
                            key={reservation.id}
                            className="text-xs p-1 rounded truncate bg-purple-100 text-purple-800"
                            title={`${reservation.customerName} (${reservation.startTime}-${reservation.endTime})`}
                          >
                            📅 {reservation.customerName}
                          </div>
                        ))}

                        {/* 表示しきれないアイテムの数 */}
                        {(items.shifts.length + items.reservations.length) > 5 && (
                          <div className="text-xs text-gray-500">
                            +{(items.shifts.length + items.reservations.length) - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Selected Date Details */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {formatDate(selectedDate)}
              </h3>
              
              {/* Selected Date Shifts */}
              {selectedDateShifts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">シフト</h4>
                  <div className="space-y-2">
                    {selectedDateShifts.map((shift) => {
                      const template = getTemplateForShift(shift)
                      return (
                        <div
                          key={shift.id}
                          className={`p-3 rounded-lg border cursor-pointer transition duration-200 ${
                            isAdmin() ? 'hover:border-gray-400' : ''
                          }`}
                          onClick={() => handleShiftClick(shift)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{shift.staffName}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(shift.status)}`}>
                              {shift.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {shift.startTime} - {shift.endTime}
                          </div>
                          {template && (
                            <div className="flex items-center mt-1">
                              <span 
                                className="inline-block w-2 h-2 rounded-full mr-1" 
                                style={{ backgroundColor: template.color }}
                              ></span>
                              <span className="text-xs text-gray-500">{template.name}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Selected Date Reservations */}
              {selectedDateReservations.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">予約</h4>
                  <div className="space-y-2">
                    {selectedDateReservations.map((reservation) => (
                      <div key={reservation.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{reservation.customerName}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getReservationStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {reservation.startTime} - {reservation.endTime}
                        </div>
                        <div className="text-sm text-gray-600">
                          {reservation.service}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDateShifts.length === 0 && selectedDateReservations.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  この日の予定はありません
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カレンダーの使い方</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>• 日付をクリックで詳細表示</div>
                {isAdmin() && (
                  <>
                    <div>• シフトをクリックで管理</div>
                    <div>• 承認・否認・編集が可能</div>
                  </>
                )}
                <div>• 上部で表示項目を切り替え</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* シフト詳細・管理モーダル（管理者のみ） */}
      {showShiftModal && selectedShift && isAdmin() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">シフト管理</h3>
                <button
                  onClick={() => {
                    setShowShiftModal(false)
                    setSelectedShift(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* シフト情報 */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700">スタッフ</h4>
                  <p className="text-gray-900">{selectedShift.staffName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">日付</h4>
                  <p className="text-gray-900">{formatDate(selectedShift.date)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">勤務時間</h4>
                  <p className="text-gray-900">{selectedShift.startTime} - {selectedShift.endTime}</p>
                </div>
                {selectedShift.templateName && (
                  <div>
                    <h4 className="font-medium text-gray-700">シフトタイプ</h4>
                    <div className="flex items-center">
                      {(() => {
                        const template = getTemplateForShift(selectedShift)
                        return template ? (
                          <>
                            <span 
                              className="inline-block w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: template.color }}
                            ></span>
                            <span className="text-gray-900">{selectedShift.templateName}</span>
                          </>
                        ) : (
                          <span className="text-gray-900">{selectedShift.templateName}</span>
                        )
                      })()}
                    </div>
                  </div>
                )}
                {selectedShift.breakDuration && (
                  <div>
                    <h4 className="font-medium text-gray-700">休憩時間</h4>
                    <p className="text-gray-900">{selectedShift.breakDuration}分</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-700">ステータス</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedShift.status)}`}>
                    {selectedShift.status}
                  </span>
                </div>
                {selectedShift.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700">備考</h4>
                    <p className="text-gray-900">{selectedShift.notes}</p>
                  </div>
                )}
              </div>

              {/* 管理者アクション */}
              <div className="space-y-3">
                {selectedShift.status === '申請中' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleShiftApproval(selectedShift.id, '承認済み')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleShiftApproval(selectedShift.id, '却下')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      却下
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => handleShiftDelete(selectedShift.id)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 