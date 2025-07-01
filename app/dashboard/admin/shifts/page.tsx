'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { 
  getShifts, 
  saveShifts, 
  getStaff, 
  updateShift,
  generateAutoShift,
  getGeneratedShifts,
  approveGeneratedShift,
  getActiveShiftConditions,
  checkLaborViolations,
  getShiftRequests,
  updateShiftRequestStatus,
  type Shift, 
  type Staff, 
  type GeneratedShift,
  type LaborViolation,
  type ShiftRequest
} from '@/lib/data'
import { generateId, formatDate, formatTime } from '@/lib/utils'

export default function AdminShiftsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [generatedShifts, setGeneratedShifts] = useState<GeneratedShift[]>([])
  const [shiftRequests, setShiftRequests] = useState<ShiftRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'generated' | 'requests'>('current')
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [laborViolations, setLaborViolations] = useState<LaborViolation[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toISOString().slice(0, 7)
  })

  const [formData, setFormData] = useState({
    staffId: '',
    date: '',
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    notes: ''
  })

  // 権限チェック
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/dashboard')
      return
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    refreshData()
  }, [selectedMonth])

  const refreshData = () => {
    setStaff(getStaff())
    setShifts(getShifts())
    setGeneratedShifts(getGeneratedShifts())
    setShiftRequests(getShiftRequests())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // AI自動シフト作成
  const handleGenerateAutoShift = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // 条件設定の確認
      const conditions = getActiveShiftConditions(selectedMonth)
      if (!conditions) {
        setMessage({ 
          type: 'error', 
          text: `${selectedMonth}のシフト条件が設定されていません。まず条件設定を行ってください。` 
        })
        return
      }

      // AI自動シフト生成
      const result = generateAutoShift(selectedMonth)
      
      if (result) {
        setGeneratedShifts(getGeneratedShifts())
        setMessage({ 
          type: 'success', 
          text: `AIシフトを生成しました。スコア: ${result.score}点 (違反警告: ${result.violationWarnings.length}件)` 
        })
        setActiveTab('generated')
      } else {
        setMessage({ type: 'error', text: 'AIシフトの生成に失敗しました' })
      }

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'AIシフトの生成に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  // 生成されたシフトを承認
  const handleApproveGeneratedShift = async (generatedShiftId: string) => {
    if (!confirm('このAI生成シフトを正式に承認しますか？既存のシフトは上書きされます。')) {
      return
    }

    try {
      const success = approveGeneratedShift(generatedShiftId, user!.id)
      
      if (success) {
        refreshData()
        setMessage({ type: 'success', text: 'AI生成シフトを承認しました' })
        setActiveTab('current')
      } else {
        setMessage({ type: 'error', text: 'シフトの承認に失敗しました' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'シフトの承認に失敗しました' })
    }
  }

  // 希望申請の承認・却下
  const handleRequestApproval = async (requestId: string, action: '承認済み' | '却下') => {
    try {
      const success = updateShiftRequestStatus(requestId, action)
      
      if (success) {
        setShiftRequests(getShiftRequests())
        setMessage({ 
          type: 'success', 
          text: `シフト希望を${action === '承認済み' ? '承認' : '却下'}しました` 
        })
      } else {
        setMessage({ type: 'error', text: '操作に失敗しました' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作に失敗しました' })
    }
  }

  // 労働基準法チェック
  const handleLaborCheck = () => {
    const conditions = getActiveShiftConditions(selectedMonth)
    if (!conditions) {
      setMessage({ type: 'error', text: 'シフト条件が設定されていません' })
      return
    }

    const monthShifts = shifts.filter(s => s.date.startsWith(selectedMonth))
    const violations = checkLaborViolations(monthShifts, conditions.laborStandards)
    setLaborViolations(violations)
    
    if (violations.length === 0) {
      setMessage({ type: 'success', text: '労働基準法違反は検出されませんでした' })
    } else {
      setMessage({ 
        type: 'warning', 
        text: `${violations.length}件の労働基準法違反が検出されました` 
      })
    }
  }

  // シフト編集時の労働基準法チェック付きの保存
  const handleEditShift = async (shift: Shift, updates: Partial<Shift>) => {
    try {
      // 更新後のシフトで労働基準法チェック
      const updatedShift = { ...shift, ...updates }
      const conditions = getActiveShiftConditions(selectedMonth)
      
      if (conditions) {
        const testShifts = shifts.map(s => s.id === shift.id ? updatedShift : s)
        const violations = checkLaborViolations(testShifts, conditions.laborStandards)
        const shiftViolations = violations.filter(v => v.staffId === shift.staffId)
        
        if (shiftViolations.length > 0) {
          const violationText = shiftViolations.map(v => v.details).join(', ')
          const proceed = confirm(
            `労働基準法違反が検出されました:\n${violationText}\n\nそれでも保存しますか？`
          )
          if (!proceed) return
        }
      }

      // シフトを更新
      const updatedShifts = shifts.map(s => 
        s.id === shift.id 
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      )
      saveShifts(updatedShifts)
      setShifts(updatedShifts)
      setEditingShift(null)
      setMessage({ type: 'success', text: 'シフトを更新しました' })

    } catch (error) {
      setMessage({ type: 'error', text: 'シフトの更新に失敗しました' })
    }
  }

  // 現在の月のシフト
  const currentMonthShifts = shifts.filter(s => s.date.startsWith(selectedMonth))
  
  // 現在の月の生成シフト
  const currentMonthGeneratedShifts = generatedShifts.filter(g => g.month === selectedMonth)
  
  // 現在の月の希望申請
  const currentMonthRequests = shiftRequests.filter(r => r.month === selectedMonth)

  if (!user || !isAdmin()) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シフト管理 (AI自動作成対応)</h1>
          <p className="text-gray-600">AI自動シフト作成と労働基準法チェック機能付き</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <a
            href="/dashboard/admin/shifts/conditions"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            条件設定
          </a>
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

      {/* AI自動シフト作成ボタン */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">🤖 AIシフト作成</h2>
            <p className="text-blue-100">従業員の希望と設定条件に基づいて最適なシフトを自動生成します</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateAutoShift}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
            >
              {isLoading ? '生成中...' : '🚀 AIシフト作成'}
            </button>
            <button
              onClick={handleLaborCheck}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
            >
              ⚖️ 労働基準法チェック
            </button>
          </div>
        </div>
      </div>

      {/* 労働基準法違反警告表示 */}
      {laborViolations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ 労働基準法違反警告</h3>
          <div className="space-y-2">
            {laborViolations.map((violation, index) => (
              <div key={index} className={`p-3 rounded ${
                violation.severity === 'critical' ? 'bg-red-100' :
                violation.severity === 'error' ? 'bg-orange-100' : 'bg-yellow-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{violation.staffName}</span>
                    {violation.date && <span className="text-sm text-gray-600 ml-2">({violation.date})</span>}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    violation.severity === 'critical' ? 'bg-red-200 text-red-800' :
                    violation.severity === 'error' ? 'bg-orange-200 text-orange-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {violation.severity === 'critical' ? '重大' : violation.severity === 'error' ? 'エラー' : '警告'}
                  </span>
                </div>
                <p className="text-sm mt-1">{violation.details}</p>
                {violation.suggestion && (
                  <p className="text-sm text-gray-600 mt-1">💡 {violation.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 py-3">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              現在のシフト ({currentMonthShifts.length})
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI生成シフト ({currentMonthGeneratedShifts.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              希望申請 ({currentMonthRequests.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 現在のシフトタブ */}
          {activeTab === 'current' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">現在のシフト一覧</h3>
              {currentMonthShifts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMonthShifts.map(shift => (
                    <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{shift.staffName}</h4>
                          <p className="text-sm text-gray-600">{formatDate(shift.date)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          shift.status === '承認済み' ? 'bg-green-100 text-green-800' :
                          shift.status === '申請中' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {shift.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>⏰ {shift.startTime} - {shift.endTime}</div>
                        {shift.position && <div>👤 {shift.position}</div>}
                        {shift.notes && <div>📝 {shift.notes}</div>}
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => setEditingShift(shift)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('このシフトを削除しますか？')) {
                              const updatedShifts = shifts.filter(s => s.id !== shift.id)
                              saveShifts(updatedShifts)
                              setShifts(updatedShifts)
                              setMessage({ type: 'success', text: 'シフトを削除しました' })
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📅</div>
                  <p className="text-gray-500">選択された月のシフトはありません</p>
                  <button
                    onClick={handleGenerateAutoShift}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    AIシフトを作成する
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI生成シフトタブ */}
          {activeTab === 'generated' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">AI生成シフト候補</h3>
              {currentMonthGeneratedShifts.length > 0 ? (
                <div className="space-y-6">
                  {currentMonthGeneratedShifts.map(generatedShift => (
                    <div key={generatedShift.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            生成日時: {formatDate(generatedShift.generatedAt)}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm">
                              📊 スコア: <span className="font-medium">{generatedShift.score}</span>/100
                            </span>
                            <span className="text-sm">
                              📋 シフト数: {generatedShift.shifts.length}件
                            </span>
                            <span className="text-sm">
                              ⚠️ 違反: {generatedShift.violationWarnings.length}件
                            </span>
                          </div>
                        </div>
                        {!generatedShift.isApproved && (
                          <button
                            onClick={() => handleApproveGeneratedShift(generatedShift.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                          >
                            承認
                          </button>
                        )}
                      </div>

                      {/* 違反警告 */}
                      {generatedShift.violationWarnings.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <h5 className="font-medium text-yellow-800 mb-2">違反警告</h5>
                          <div className="space-y-1">
                            {generatedShift.violationWarnings.slice(0, 3).map((violation, index) => (
                              <p key={index} className="text-sm text-yellow-700">
                                • {violation.staffName}: {violation.details}
                              </p>
                            ))}
                            {generatedShift.violationWarnings.length > 3 && (
                              <p className="text-sm text-yellow-600">
                                ...他{generatedShift.violationWarnings.length - 3}件
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* シフト一覧（サンプル表示） */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {generatedShift.shifts.slice(0, 6).map(shift => (
                          <div key={shift.id} className="text-sm border border-gray-100 rounded p-2">
                            <div className="font-medium">{shift.staffName}</div>
                            <div className="text-gray-600">
                              {formatDate(shift.date)} {shift.startTime}-{shift.endTime}
                            </div>
                          </div>
                        ))}
                        {generatedShift.shifts.length > 6 && (
                          <div className="text-sm text-gray-500 flex items-center justify-center border border-gray-100 rounded p-2">
                            ...他{generatedShift.shifts.length - 6}件
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">🤖</div>
                  <p className="text-gray-500">AI生成シフトはありません</p>
                  <button
                    onClick={handleGenerateAutoShift}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    AIシフトを作成する
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 希望申請タブ */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">従業員のシフト希望申請</h3>
              {currentMonthRequests.length > 0 ? (
                <div className="space-y-4">
                  {currentMonthRequests.map(request => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{request.staffName}</h4>
                          <p className="text-sm text-gray-600">提出日: {formatDate(request.submittedAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            request.status === '承認済み' 
                              ? 'bg-green-100 text-green-800' 
                              : request.status === '却下'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                          {request.status === '申請中' && (
                            <>
                              <button
                                onClick={() => handleRequestApproval(request.id, '承認済み')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              >
                                承認
                              </button>
                              <button
                                onClick={() => handleRequestApproval(request.id, '却下')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                却下
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            休日希望: {request.dayOffRequests.length}日
                          </p>
                          {request.dayOffRequests.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {request.dayOffRequests.slice(0, 5).map(date => (
                                <span key={date} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {new Date(date).getDate()}日
                                </span>
                              ))}
                              {request.dayOffRequests.length > 5 && (
                                <span className="text-xs text-gray-500">...他{request.dayOffRequests.length - 5}日</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            有休希望: {request.paidLeaveRequests.length}日
                          </p>
                          {request.paidLeaveRequests.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {request.paidLeaveRequests.slice(0, 5).map(date => (
                                <span key={date} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  {new Date(date).getDate()}日
                                </span>
                              ))}
                              {request.paidLeaveRequests.length > 5 && (
                                <span className="text-xs text-gray-500">...他{request.paidLeaveRequests.length - 5}日</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {request.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">📝 {request.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <p className="text-gray-500">シフト希望申請はありません</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* シフト編集モーダル */}
      {editingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">シフト編集</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
                <input
                  type="time"
                  value={editingShift.startTime}
                  onChange={(e) => setEditingShift({...editingShift, startTime: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了時間</label>
                <input
                  type="time"
                  value={editingShift.endTime}
                  onChange={(e) => setEditingShift({...editingShift, endTime: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea
                  value={editingShift.notes || ''}
                  onChange={(e) => setEditingShift({...editingShift, notes: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingShift(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleEditShift(editingShift, {
                    startTime: editingShift.startTime,
                    endTime: editingShift.endTime,
                    notes: editingShift.notes
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 