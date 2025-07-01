'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { 
  getStaff, 
  getShifts,
  getActiveShiftConditions,
  createShiftRequest,
  getStaffShiftRequest,
  calculateDeadlineDate,
  isAfterDeadline,
  type Staff,
  type ShiftRequest,
  type ShiftConditions 
} from '@/lib/data'
import { formatDate } from '@/lib/utils'

export default function EmployeeShiftRequestPage() {
  const { user, isEmployee } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null)
  const [currentShiftRequest, setCurrentShiftRequest] = useState<ShiftRequest | null>(null)
  const [shiftConditions, setShiftConditions] = useState<ShiftConditions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toISOString().slice(0, 7) // YYYY-MM
  })

  const [dayOffRequests, setDayOffRequests] = useState<string[]>([])
  const [paidLeaveRequests, setPaidLeaveRequests] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  // 権限チェック
  useEffect(() => {
    if (user && !isEmployee()) {
      router.push('/dashboard')
      return
    }
  }, [user, isEmployee, router])

  useEffect(() => {
    if (user) {
      const staffList = getStaff()
      setStaff(staffList)
      
      // 現在のユーザーに対応するスタッフ情報を取得
      const userStaff = staffList.find(s => s.email === user.email)
      setCurrentStaff(userStaff || null)
    }
  }, [user])

  useEffect(() => {
    if (currentStaff && selectedMonth) {
      // 既存の希望申請を取得
      const existingRequest = getStaffShiftRequest(currentStaff.id, selectedMonth)
      setCurrentShiftRequest(existingRequest)
      
      if (existingRequest) {
        setDayOffRequests(existingRequest.dayOffRequests)
        setPaidLeaveRequests(existingRequest.paidLeaveRequests)
        setNotes(existingRequest.notes || '')
      } else {
        setDayOffRequests([])
        setPaidLeaveRequests([])
        setNotes('')
      }

      // シフト条件を取得
      const conditions = getActiveShiftConditions(selectedMonth)
      setShiftConditions(conditions)
    }
  }, [currentStaff, selectedMonth])

  // 月の日付リストを生成
  const generateMonthDates = (month: string) => {
    const [year, monthNum] = month.split('-').map(Number)
    const dates: { date: string, dayOfWeek: string, isHoliday: boolean }[] = []
    const lastDay = new Date(year, monthNum, 0).getDate()
    
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, monthNum - 1, day)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
      
      // 定休日・特別休業日チェック
      const isRegularHoliday = shiftConditions?.regularHolidays.includes(date.getDay().toString()) ?? false
      const isSpecialHoliday = shiftConditions?.specialHolidays.includes(dateStr) ?? false
      const isHoliday = isRegularHoliday || isSpecialHoliday
      
      dates.push({ date: dateStr, dayOfWeek, isHoliday })
    }
    
    return dates
  }

  const monthDates = generateMonthDates(selectedMonth)

  // 締切日チェック
  const isDeadlinePassed = shiftConditions ? 
    isAfterDeadline(selectedMonth, shiftConditions.deadlineDaysBefore) : false
  
  const deadlineDate = shiftConditions ? 
    calculateDeadlineDate(selectedMonth, shiftConditions.deadlineDaysBefore) : null

  const handleDateClick = (date: string, type: 'dayOff' | 'paidLeave') => {
    if (isDeadlinePassed) return

    if (type === 'dayOff') {
      setDayOffRequests(prev => 
        prev.includes(date) 
          ? prev.filter(d => d !== date)
          : [...prev, date]
      )
      // 有休希望から除外
      setPaidLeaveRequests(prev => prev.filter(d => d !== date))
    } else {
      setPaidLeaveRequests(prev => 
        prev.includes(date) 
          ? prev.filter(d => d !== date)
          : [...prev, date]
      )
      // 休日希望から除外
      setDayOffRequests(prev => prev.filter(d => d !== date))
    }
  }

  const handleSubmit = async () => {
    if (!currentStaff) {
      setMessage({ type: 'error', text: 'スタッフ情報が見つかりません' })
      return
    }

    if (isDeadlinePassed) {
      setMessage({ type: 'error', text: '希望提出の締切が過ぎています' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const requestData = {
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        month: selectedMonth,
        dayOffRequests,
        paidLeaveRequests,
        notes,
        status: '申請中' as const
      }

      const newRequest = createShiftRequest(requestData)
      setCurrentShiftRequest(newRequest)
      setMessage({ type: 'success', text: 'シフト希望を提出しました' })

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'シフト希望の提出に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !isEmployee()) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シフト希望提出</h1>
          <p className="text-gray-600">休日希望・有休希望を提出してください</p>
        </div>
        <div className="text-sm text-gray-600">
          {deadlineDate && (
            <div className={`p-2 rounded-lg ${isDeadlinePassed ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              締切: {formatDate(deadlineDate)}
              {isDeadlinePassed && ' (締切済み)'}
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : message.type === 'warning'
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 月選択 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">対象月選択</h2>
        <div className="flex items-center space-x-4">
          <label htmlFor="month" className="text-sm font-medium text-gray-700">
            希望提出月:
          </label>
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isDeadlinePassed}
          />
        </div>
      </div>

      {/* 現在の希望状況 */}
      {currentShiftRequest && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">現在の希望状況</h2>
            <span className={`px-3 py-1 rounded-full text-sm ${
              currentShiftRequest.status === '承認済み' 
                ? 'bg-green-100 text-green-800' 
                : currentShiftRequest.status === '却下'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {currentShiftRequest.status}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">休日希望: {dayOffRequests.length}日</p>
              <p className="text-sm font-medium text-gray-700">有休希望: {paidLeaveRequests.length}日</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">提出日: {formatDate(currentShiftRequest.submittedAt)}</p>
              {currentShiftRequest.updatedAt && (
                <p className="text-sm text-gray-600">更新日: {formatDate(currentShiftRequest.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* カレンダー形式の希望入力 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">希望日選択</h2>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
              <span>休日希望</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
              <span>有休希望</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthDates.map(({ date, dayOfWeek, isHoliday }) => {
            const isDayOff = dayOffRequests.includes(date)
            const isPaidLeave = paidLeaveRequests.includes(date)
            const day = new Date(date).getDate()
            
            return (
              <div
                key={date}
                className={`relative border rounded-lg p-2 min-h-[60px] ${
                  isHoliday 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : isDeadlinePassed
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-400 cursor-pointer'
                } ${
                  isDayOff ? 'bg-blue-100 border-blue-400' : 
                  isPaidLeave ? 'bg-green-100 border-green-400' : ''
                }`}
              >
                <div className="text-sm font-medium">{day}</div>
                <div className="text-xs text-gray-600">{dayOfWeek}</div>
                
                {!isHoliday && !isDeadlinePassed && (
                  <div className="absolute bottom-1 right-1 flex space-x-1">
                    <button
                      onClick={() => handleDateClick(date, 'dayOff')}
                      className={`w-4 h-4 rounded text-xs ${
                        isDayOff ? 'bg-blue-500 text-white' : 'bg-blue-200 hover:bg-blue-300'
                      }`}
                      title="休日希望"
                    >
                      休
                    </button>
                    <button
                      onClick={() => handleDateClick(date, 'paidLeave')}
                      className={`w-4 h-4 rounded text-xs ${
                        isPaidLeave ? 'bg-green-500 text-white' : 'bg-green-200 hover:bg-green-300'
                      }`}
                      title="有休希望"
                    >
                      有
                    </button>
                  </div>
                )}
                
                {isHoliday && (
                  <div className="absolute bottom-1 right-1 text-xs text-gray-500">
                    定休
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 備考欄 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">備考</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="特別な要望やご事情があればお書きください"
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isDeadlinePassed}
        />
      </div>

      {/* 提出ボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isLoading || isDeadlinePassed}
          className={`px-8 py-3 rounded-lg font-semibold transition duration-200 ${
            isLoading || isDeadlinePassed
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? '提出中...' : '希望を提出する'}
        </button>
      </div>

      {/* 説明文 */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">注意事項</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 希望は確約ではありません。管理者が最終的なシフトを決定します。</li>
          <li>• 締切日を過ぎた後の変更はできません。</li>
          <li>• 有休希望は年次有給休暇から消化されます。</li>
          <li>• 定休日は自動的に休日となるため選択できません。</li>
        </ul>
      </div>
    </div>
  )
} 