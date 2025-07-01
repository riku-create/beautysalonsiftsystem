'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { getStaff, saveStaff, type Staff } from '@/lib/data'
import { generateId, formatDate } from '@/lib/utils'

export default function StaffManagementPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '' as '' | 'スタイリスト' | 'アシスタント' | '受付' | 'マネージャー',
    hireDate: '',
    isActive: true,
    address: ''
  })

  // 権限チェック
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/dashboard')
      return
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = () => {
    try {
      const allStaff = getStaff()
      setStaff(allStaff)
    } catch (error) {
      setMessage({ type: 'error', text: 'スタッフデータの読み込みに失敗しました' })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      hireDate: '',
      isActive: true,
      address: ''
    })
    setEditingStaff(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // バリデーション
      if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) {
        setMessage({ type: 'error', text: '必須項目を全て入力してください' })
        return
      }

      // メールアドレスの重複チェック
      const existingStaff = staff.find(s => 
        s.email.toLowerCase() === formData.email.toLowerCase() && 
        s.id !== editingStaff?.id
      )

      if (existingStaff) {
        setMessage({ type: 'error', text: 'このメールアドレスは既に使用されています' })
        return
      }

      if (editingStaff) {
        // 編集の場合
        const updatedStaff = staff.map(s => 
          s.id === editingStaff.id 
            ? { 
                ...s, 
                ...formData,
                position: formData.position as 'スタイリスト' | 'アシスタント' | '受付' | 'マネージャー',
                updatedAt: new Date().toISOString() 
              }
            : s
        )
        saveStaff(updatedStaff)
        setStaff(updatedStaff)
        setMessage({ type: 'success', text: 'スタッフ情報を更新しました' })
      } else {
        // 新規作成の場合
        const newStaff: Staff = {
          id: generateId(),
          ...formData,
          position: formData.position as 'スタイリスト' | 'アシスタント' | '受付' | 'マネージャー',
          createdAt: new Date().toISOString()
        }
        const updatedStaff = [...staff, newStaff]
        saveStaff(updatedStaff)
        setStaff(updatedStaff)
        setMessage({ type: 'success', text: 'スタッフを追加しました' })
      }

      resetForm()
    } catch (error) {
      setMessage({ type: 'error', text: '操作に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone || '',
      position: staffMember.position,
      hireDate: staffMember.hireDate || '',
      isActive: staffMember.isActive,
      address: staffMember.address || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (staffId: string, staffName: string) => {
    if (!confirm(`${staffName}さんのデータを削除しますか？この操作は元に戻せません。`)) {
      return
    }

    try {
      const updatedStaff = staff.filter(s => s.id !== staffId)
      saveStaff(updatedStaff)
      setStaff(updatedStaff)
      setMessage({ type: 'success', text: 'スタッフを削除しました' })
    } catch (error) {
      setMessage({ type: 'error', text: '削除に失敗しました' })
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">スタッフ管理</h1>
          <p className="text-gray-600">スタッフの情報を管理します</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新規スタッフ追加
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

      {/* 追加/編集フォーム */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingStaff ? 'スタッフ編集' : '新規スタッフ追加'}
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
                  氏名 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  役職 *
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="スタイリスト">スタイリスト</option>
                  <option value="アシスタント">アシスタント</option>
                  <option value="受付">受付</option>
                  <option value="マネージャー">マネージャー</option>
                </select>
              </div>

              <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                  入社日
                </label>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
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
                  在籍中
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                住所
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
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
                {isLoading ? '保存中...' : editingStaff ? '更新' : '追加'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* スタッフ一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">スタッフ一覧</h2>
        </div>
        
        {staff.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">スタッフが登録されていません</h3>
            <p className="text-gray-600">新規スタッフを追加してください。</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    スタッフ情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    連絡先
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    役職
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                        <div className="text-sm text-gray-500">{staffMember.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staffMember.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {staffMember.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staffMember.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staffMember.isActive ? '在籍中' : '退職済み'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(staffMember)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(staffMember.id, staffMember.name)}
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