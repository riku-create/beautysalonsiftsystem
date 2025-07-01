'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { 
  getShiftTemplates, 
  createShiftTemplate, 
  updateShiftTemplate, 
  deleteShiftTemplate,
  type ShiftTemplate 
} from '@/lib/data'

export default function ShiftTemplatesPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    description: '',
    color: '#3B82F6',
    isActive: true
  })

  // 権限チェック
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/dashboard')
      return
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    try {
      const allTemplates = getShiftTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      setMessage({ type: 'error', text: 'テンプレートの読み込みに失敗しました' })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '18:00',
      breakDuration: 60,
      description: '',
      color: '#3B82F6',
      isActive: true
    })
    setEditingTemplate(null)
    setShowCreateForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // バリデーション
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: 'テンプレート名を入力してください' })
        return
      }

      if (formData.startTime >= formData.endTime) {
        setMessage({ type: 'error', text: '終了時間は開始時間より後に設定してください' })
        return
      }

      if (editingTemplate) {
        // 編集の場合
        const success = updateShiftTemplate(editingTemplate.id, formData)
        if (success) {
          setMessage({ type: 'success', text: 'シフトテンプレートを更新しました' })
          loadTemplates()
          resetForm()
        } else {
          setMessage({ type: 'error', text: '更新に失敗しました' })
        }
      } else {
        // 新規作成の場合
        // 同名テンプレートのチェック
        const existingTemplate = templates.find(t => 
          t.name.toLowerCase() === formData.name.toLowerCase() && t.isActive
        )

        if (existingTemplate) {
          setMessage({ type: 'error', text: 'この名前のテンプレートは既に存在します' })
          return
        }

        createShiftTemplate(formData)
        setMessage({ type: 'success', text: 'シフトテンプレートを作成しました' })
        loadTemplates()
        resetForm()
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (template: ShiftTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      startTime: template.startTime,
      endTime: template.endTime,
      breakDuration: template.breakDuration,
      description: template.description || '',
      color: template.color,
      isActive: template.isActive
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`「${templateName}」を削除しますか？この操作は元に戻せません。`)) {
      return
    }

    try {
      const success = deleteShiftTemplate(templateId)
      if (success) {
        setMessage({ type: 'success', text: 'テンプレートを削除しました' })
        loadTemplates()
      } else {
        setMessage({ type: 'error', text: '削除に失敗しました' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '削除に失敗しました' })
    }
  }

  const toggleActive = async (templateId: string, currentStatus: boolean) => {
    try {
      const success = updateShiftTemplate(templateId, { isActive: !currentStatus })
      if (success) {
        setMessage({ 
          type: 'success', 
          text: `テンプレートを${!currentStatus ? '有効' : '無効'}にしました` 
        })
        loadTemplates()
      }
    } catch (error) {
      setMessage({ type: 'error', text: '状態の変更に失敗しました' })
    }
  }

  // 権限チェック
  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">アクセス権限がありません</h1>
        <p className="text-gray-600 mt-2">管理者のみアクセスできるページです。</p>
      </div>
    )
  }

  const calculateWorkingHours = (start: string, end: string, breakMinutes: number) => {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const workingMinutes = endMinutes - startMinutes - breakMinutes
    
    const hours = Math.floor(workingMinutes / 60)
    const minutes = workingMinutes % 60
    
    return `${hours}時間${minutes > 0 ? `${minutes}分` : ''}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シフトテンプレート管理</h1>
          <p className="text-gray-600">勤務パターンのテンプレートを管理します</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowCreateForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新規テンプレート
        </button>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 作成/編集フォーム */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingTemplate ? 'テンプレート編集' : '新規テンプレート作成'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  テンプレート名 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例：早番、遅番、フルタイム"
                  required
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  表示色
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">カレンダー表示用</span>
                </div>
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間 *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  終了時間 *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  休憩時間（分）
                </label>
                <input
                  type="number"
                  id="breakDuration"
                  name="breakDuration"
                  value={formData.breakDuration}
                  onChange={handleChange}
                  min="0"
                  max="480"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  有効なテンプレート
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="テンプレートの説明や注意事項"
              />
            </div>

            {/* プレビュー */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h4>
              <div className="flex items-center space-x-4 text-sm">
                <span 
                  className="inline-block w-4 h-4 rounded" 
                  style={{ backgroundColor: formData.color }}
                ></span>
                <span className="font-medium">{formData.name || '（未入力）'}</span>
                <span>{formData.startTime} - {formData.endTime}</span>
                <span>休憩: {formData.breakDuration}分</span>
                <span>実働: {calculateWorkingHours(formData.startTime, formData.endTime, formData.breakDuration)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '保存中...' : editingTemplate ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* テンプレート一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">登録済みテンプレート</h2>
        </div>
        
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">テンプレートがありません</h3>
            <p className="text-gray-600">新規テンプレートを作成してください。</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    テンプレート
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    勤務時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    休憩
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    実働時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: template.color }}
                        ></span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-gray-500">{template.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.startTime} - {template.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.breakDuration}分
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateWorkingHours(template.startTime, template.endTime, template.breakDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(template.id, template.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {template.isActive ? '有効' : '無効'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(template.id, template.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 