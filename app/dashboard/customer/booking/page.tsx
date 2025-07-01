'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { 
  getActiveServices, 
  getStaff, 
  getShifts, 
  createReservation, 
  isReservationAvailable,
  type Service, 
  type Staff, 
  type Shift 
} from '@/lib/data'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BookingStep {
  step: 1 | 2 | 3 | 4
  service?: Service
  staff?: Staff
  date?: string
  time?: string
  notes?: string
}

export default function BookingPage() {
  const { user, isCustomer } = useAuth()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingStep>({ step: 1 })
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const servicesData = getActiveServices()
        const staffData = getStaff().filter(s => s.isActive)
        setServices(servicesData)
        setStaff(staffData)
      } catch (error) {
        console.error('初期データ読み込みエラー:', error)
        setError('データの読み込みに失敗しました')
      }
    }
    
    loadInitialData()
  }, [])

  // 日付が選択されたときに利用可能なスタッフを取得
  useEffect(() => {
    if (booking.date && booking.service) {
      const shifts = getShifts()
      const availableOnDate = staff.filter(s => {
        const staffShift = shifts.find(shift => 
          shift.staffId === s.id && 
          shift.date === booking.date && 
          shift.status === '承認済み'
        )
        return !!staffShift
      })
      setAvailableStaff(availableOnDate)
    }
  }, [booking.date, booking.service, staff])

  // スタッフと日付が選択されたときに利用可能な時間を取得
  useEffect(() => {
    if (booking.date && booking.staff && booking.service) {
      generateAvailableTimes()
    }
  }, [booking.date, booking.staff, booking.service])

  const generateAvailableTimes = () => {
    if (!booking.date || !booking.staff || !booking.service) return

    const shifts = getShifts()
    const staffShift = shifts.find(s => 
      s.staffId === booking.staff!.id && 
      s.date === booking.date && 
      s.status === '承認済み'
    )

    if (!staffShift) {
      setAvailableTimes([])
      return
    }

    const times: string[] = []
    const serviceDuration = booking.service.duration
    const startTime = new Date(`${booking.date}T${staffShift.startTime}:00`)
    const endTime = new Date(`${booking.date}T${staffShift.endTime}:00`)

    // 30分刻みで時間を生成
    for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 30)) {
      const timeStr = time.toTimeString().slice(0, 5)
      const endTimeStr = new Date(time.getTime() + serviceDuration * 60000).toTimeString().slice(0, 5)
      
      // サービス終了時間がシフト終了時間を超えないかチェック
      if (new Date(`${booking.date}T${endTimeStr}:00`) <= endTime) {
        // 予約可能かチェック
        if (isReservationAvailable(booking.staff.id, booking.date, timeStr, endTimeStr)) {
          times.push(timeStr)
        }
      }
    }

    setAvailableTimes(times)
  }

  const handleServiceSelect = (service: Service) => {
    setBooking({ step: 2, service })
    setError('')
  }

  const handleDateSelect = (date: string) => {
    setBooking(prev => ({ ...prev, step: 3, date }))
    setError('')
  }

  const handleStaffSelect = (selectedStaff: Staff) => {
    setBooking(prev => ({ ...prev, staff: selectedStaff }))
    setError('')
  }

  const handleTimeSelect = (time: string) => {
    setBooking(prev => ({ ...prev, step: 4, time }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!user || !booking.service || !booking.staff || !booking.date || !booking.time) {
      setError('必要な情報が不足しています')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createReservation({
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone || '',
        customerEmail: user.email,
        serviceId: booking.service.id,
        staffId: booking.staff.id,
        date: booking.date,
        startTime: booking.time,
        notes: booking.notes
      })

      router.push('/dashboard/customer?success=booking')
    } catch (error: any) {
      console.error('予約作成エラー:', error)
      setError(error.message || '予約の作成に失敗しました')
    } finally {
      setLoading(false)
    }
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

  // 今日以降の日付を生成（14日間）
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const availableDates = generateDates()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <Link href="/dashboard/customer" className="hover:text-blue-600">
            ダッシュボード
          </Link>
          <span>›</span>
          <span>新規予約</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">新規予約</h1>
        <p className="text-gray-600">サービスと日時を選択して予約申請を行います</p>
      </div>

      {/* ステップインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                booking.step >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  booking.step > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>サービス選択</span>
          <span>日時選択</span>
          <span>担当者選択</span>
          <span>確認</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* ステップ1: サービス選択 */}
      {booking.step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">ステップ1: サービスを選択</h2>
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all"
                onClick={() => handleServiceSelect(service)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">
                        所要時間: {service.duration}分
                      </span>
                      <span className="text-lg font-semibold text-blue-600">
                        ¥{service.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ステップ2: 日時選択 */}
      {booking.step === 2 && booking.service && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">ステップ2: 日付を選択</h2>
            <button
              onClick={() => setBooking({ step: 1 })}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← サービスを変更
            </button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">選択中のサービス</h3>
            <p className="text-blue-800">{booking.service.name} - ¥{booking.service.price.toLocaleString()}</p>
            <p className="text-sm text-blue-700">所要時間: {booking.service.duration}分</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableDates.map((date) => {
              const dateObj = new Date(date)
              const dayNames = ['日', '月', '火', '水', '木', '金', '土']
              const dayName = dayNames[dateObj.getDay()]
              
              return (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className="p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-sm text-gray-600">
                    {dateObj.getMonth() + 1}/{dateObj.getDate()}
                  </div>
                  <div className="font-medium">({dayName})</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ステップ3: 担当者・時間選択 */}
      {booking.step === 3 && booking.date && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">ステップ3: 担当者と時間を選択</h2>
            <button
              onClick={() => setBooking(prev => ({ ...prev, step: 2, staff: undefined, time: undefined }))}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← 日付を変更
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              {new Date(booking.date).toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })}
            </p>
          </div>

          {/* 担当者選択 */}
          <div>
            <h3 className="font-medium mb-3">担当者を選択</h3>
            {availableStaff.length > 0 ? (
              <div className="grid gap-3">
                {availableStaff.map((staffMember) => (
                  <button
                    key={staffMember.id}
                    onClick={() => handleStaffSelect(staffMember)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      booking.staff?.id === staffMember.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{staffMember.name}</p>
                        <p className="text-sm text-gray-600">{staffMember.position}</p>
                      </div>
                      {staffMember.skillLevel && (
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < staffMember.skillLevel! ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">この日は利用可能なスタッフがいません</p>
            )}
          </div>

          {/* 時間選択 */}
          {booking.staff && (
            <div>
              <h3 className="font-medium mb-3">時間を選択</h3>
              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="p-2 border rounded hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">利用可能な時間がありません</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ステップ4: 確認 */}
      {booking.step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">ステップ4: 予約内容の確認</h2>
            <button
              onClick={() => setBooking(prev => ({ ...prev, step: 3 }))}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← 時間を変更
            </button>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">予約内容</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">サービス</span>
                <span className="font-medium">{booking.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">日付</span>
                <span className="font-medium">
                  {booking.date && new Date(booking.date).toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    weekday: 'long' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">時間</span>
                <span className="font-medium">
                  {booking.time} - {booking.service && booking.time && 
                    new Date(`2000-01-01T${booking.time}:00`).getTime() + booking.service.duration * 60000 > 0 &&
                    new Date(new Date(`2000-01-01T${booking.time}:00`).getTime() + booking.service.duration * 60000).toTimeString().slice(0, 5)
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">担当者</span>
                <span className="font-medium">{booking.staff?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">所要時間</span>
                <span className="font-medium">{booking.service?.duration}分</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-3">
                <span>料金</span>
                <span className="text-blue-600">¥{booking.service?.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考（任意）
            </label>
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              rows={3}
              placeholder="ご要望やご質問があればお書きください"
              value={booking.notes || ''}
              onChange={(e) => setBooking(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium"
            >
              {loading ? '申請中...' : '予約申請を送信'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 