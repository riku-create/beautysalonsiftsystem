'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { 
  getStaff,
  getShiftConditions,
  createShiftConditions,
  getDefaultLaborStandards,
  calculateDeadlineDate,
  type Staff,
  type ShiftConditions,
  type StaffSpecialCondition,
  type LaborStandards
} from '@/lib/data'
import { formatDate } from '@/lib/utils'

export default function ShiftConditionsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toISOString().slice(0, 7)
  })

  // フォームデータ
  const [regularHolidays, setRegularHolidays] = useState<string[]>([])
  const [specialHolidays, setSpecialHolidays] = useState<string[]>([])
  const [minimumStaffMode, setMinimumStaffMode] = useState<'minimum_required' | 'maximum_absent'>('minimum_required')
  const [minimumStaffCount, setMinimumStaffCount] = useState(2)
  const [maximumAbsentCount, setMaximumAbsentCount] = useState(1)
  const [deadlineDaysBefore, setDeadlineDaysBefore] = useState(10)
  const [staffSpecialConditions, setStaffSpecialConditions] = useState<StaffSpecialCondition[]>([])
  const [laborStandards, setLaborStandards] = useState<LaborStandards>(getDefaultLaborStandards())

  // 権限チェック
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/dashboard')
      return
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    const staffList = getStaff()
    setStaff(staffList)
    
    // 既存の条件設定を読み込み
    const existingConditions = getShiftConditions().find(c => c.month === selectedMonth && c.isActive)
    if (existingConditions) {
      setRegularHolidays(existingConditions.regularHolidays)
      setSpecialHolidays(existingConditions.specialHolidays)
      setMinimumStaffMode(existingConditions.minimumStaffMode)
      setMinimumStaffCount(existingConditions.minimumStaffCount || 2)
      setMaximumAbsentCount(existingConditions.maximumAbsentCount || 1)
      setDeadlineDaysBefore(existingConditions.deadlineDaysBefore)
      setStaffSpecialConditions(existingConditions.staffSpecialConditions)
      setLaborStandards(existingConditions.laborStandards)
    } else {
      // スタッフごとの初期条件を設定
      setStaffSpecialConditions(staffList.map(s => ({
        staffId: s.id,
        staffName: s.name,
        maxWorkDaysPerMonth: 22,
        minWorkDaysPerMonth: 8,
        fixedWorkDays: [],
        fixedOffDays: [],
        preferredShiftTemplateIds: [],
        notes: ''
      })))
    }
  }, [selectedMonth])

  const handleRegularHolidayToggle = (dayIndex: string) => {
    setRegularHolidays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    )
  }

  const handleSpecialHolidayAdd = (date: string) => {
    if (date && !specialHolidays.includes(date)) {
      setSpecialHolidays(prev => [...prev, date])
    }
  }

  const handleSpecialHolidayRemove = (date: string) => {
    setSpecialHolidays(prev => prev.filter(d => d !== date))
  }

  const updateStaffCondition = (staffId: string, updates: Partial<StaffSpecialCondition>) => {
    setStaffSpecialConditions(prev => 
      prev.map(condition => 
        condition.staffId === staffId 
          ? { ...condition, ...updates }
          : condition
      )
    )
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const conditionsData = {
        month: selectedMonth,
        regularHolidays,
        specialHolidays,
        minimumStaffMode,
        minimumStaffCount: minimumStaffMode === 'minimum_required' ? minimumStaffCount : undefined,
        maximumAbsentCount: minimumStaffMode === 'maximum_absent' ? maximumAbsentCount : undefined,
        staffSpecialConditions,
        deadlineDaysBefore,
        laborStandards,
        isActive: true
      }

      createShiftConditions(conditionsData)
      setMessage({ type: 'success', text: 'シフト条件を保存しました' })

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'シフト条件の保存に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  const deadlineDate = calculateDeadlineDate(selectedMonth, deadlineDaysBefore)

  const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">シフト条件設定</h1>
        <p className="text-gray-600">AI自動シフト作成のための条件を設定します</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 基本設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象月
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              希望締切日
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">月終わりの</span>
              <input
                type="number"
                min="1"
                max="30"
                value={deadlineDaysBefore}
                onChange={(e) => setDeadlineDaysBefore(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">日前</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              締切日: {formatDate(deadlineDate)}
            </p>
          </div>
        </div>
      </div>

      {/* 定休日設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">定休日設定</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {dayNames.map((day, index) => (
            <label key={index} className="flex items-center">
              <input
                type="checkbox"
                checked={regularHolidays.includes(index.toString())}
                onChange={() => handleRegularHolidayToggle(index.toString())}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 特別休業日設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">特別休業日設定</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="date"
              onChange={(e) => handleSpecialHolidayAdd(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">特別休業日を追加</span>
          </div>
          
          {specialHolidays.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specialHolidays.map(date => (
                <div key={date} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                  <span className="text-sm text-gray-700">{formatDate(date)}</span>
                  <button
                    onClick={() => handleSpecialHolidayRemove(date)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 人数設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">人数設定</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="staffMode"
                value="minimum_required"
                checked={minimumStaffMode === 'minimum_required'}
                onChange={(e) => setMinimumStaffMode(e.target.value as any)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">最低出勤者数を指定</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="staffMode"
                value="maximum_absent"
                checked={minimumStaffMode === 'maximum_absent'}
                onChange={(e) => setMinimumStaffMode(e.target.value as any)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">最大休暇者数を指定</span>
            </label>
          </div>

          {minimumStaffMode === 'minimum_required' ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">1日最低</span>
              <input
                type="number"
                min="1"
                value={minimumStaffCount}
                onChange={(e) => setMinimumStaffCount(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">人出勤</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">1日最大</span>
              <input
                type="number"
                min="0"
                value={maximumAbsentCount}
                onChange={(e) => setMaximumAbsentCount(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">人まで休み</span>
            </div>
          )}
        </div>
      </div>

      {/* 労働基準法設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">労働基準法設定</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大連続勤務日数
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={laborStandards.maxConsecutiveWorkDays}
              onChange={(e) => setLaborStandards(prev => ({
                ...prev,
                maxConsecutiveWorkDays: Number(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1日最大労働時間
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={laborStandards.maxWorkHoursPerDay}
              onChange={(e) => setLaborStandards(prev => ({
                ...prev,
                maxWorkHoursPerDay: Number(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              週最大労働時間
            </label>
            <input
              type="number"
              min="1"
              value={laborStandards.maxWorkHoursPerWeek}
              onChange={(e) => setLaborStandards(prev => ({
                ...prev,
                maxWorkHoursPerWeek: Number(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              月最大労働時間
            </label>
            <input
              type="number"
              min="1"
              value={laborStandards.maxWorkHoursPerMonth}
              onChange={(e) => setLaborStandards(prev => ({
                ...prev,
                maxWorkHoursPerMonth: Number(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              深夜労働開始時間
            </label>
            <input
              type="time"
              value={laborStandards.nightWorkStartTime}
              onChange={(e) => setLaborStandards(prev => ({
                ...prev,
                nightWorkStartTime: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              深夜労働終了時間
            </label>
            <input
              type="time"
              value={laborStandards.nightWorkEndTime}
              onChange={(e) => setLaborStandards(prev => ({
                ...prev,
                nightWorkEndTime: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* スタッフ個別条件 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">スタッフ個別条件</h2>
        
        <div className="space-y-6">
          {staffSpecialConditions.map(condition => (
            <div key={condition.staffId} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{condition.staffName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    月最大勤務日数
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={condition.maxWorkDaysPerMonth || ''}
                    onChange={(e) => updateStaffCondition(condition.staffId, {
                      maxWorkDaysPerMonth: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    月最小勤務日数
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={condition.minWorkDaysPerMonth || ''}
                    onChange={(e) => updateStaffCondition(condition.staffId, {
                      minWorkDaysPerMonth: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    最大連続勤務日数
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={condition.maxConsecutiveWorkDays || ''}
                    onChange={(e) => updateStaffCondition(condition.staffId, {
                      maxConsecutiveWorkDays: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={condition.notes || ''}
                  onChange={(e) => updateStaffCondition(condition.staffId, {
                    notes: e.target.value
                  })}
                  placeholder="特別な条件や要望があれば記入してください"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : 'シフト条件を保存'}
        </button>
      </div>
    </div>
  )
}