'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getStaff, saveStaff } from '@/lib/data'
import type { Staff } from '@/lib/data'

export default function SettingsPage() {
  const { user } = useAuth()
  const [staff, setStaff] = useState<Staff[]>([])
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    position: '' as 'スタイリスト' | 'アシスタント' | '受付' | 'マネージャー' | '',
    skillLevel: '' as '1' | '2' | '3' | '4' | '5' | '',
    hireDate: '',
    emergencyContact: '',
    address: ''
  })

  useEffect(() => {
    if (user) {
      const staffList = getStaff()
      setStaff(staffList)
      
      // 現在のユーザーに対応するスタッフ情報を取得
      const userStaff = staffList.find(s => s.email === user.email)
      if (userStaff) {
        setCurrentStaff(userStaff)
        setProfileData({
          name: userStaff.name,
          phone: userStaff.phone,
          position: userStaff.position,
          skillLevel: userStaff.skillLevel?.toString() as any || '',
          hireDate: userStaff.hireDate,
          emergencyContact: userStaff.emergencyContact || '',
          address: userStaff.address || ''
        })
      }
    }
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStaff) return

    setIsLoading(true)
    setMessage(null)

    try {
      const updatedStaff = staff.map(s => 
        s.id === currentStaff.id 
          ? {
              ...s,
              name: profileData.name,
              phone: profileData.phone,
              position: profileData.position as any,
              skillLevel: profileData.skillLevel ? parseInt(profileData.skillLevel) as any : undefined,
              hireDate: profileData.hireDate,
              emergencyContact: profileData.emergencyContact,
              address: profileData.address
            }
          : s
      )
      
      saveStaff(updatedStaff)
      setStaff(updatedStaff)
      setCurrentStaff(updatedStaff.find(s => s.id === currentStaff.id) || null)
      
      setMessage({ type: 'success', text: 'プロフィールを更新しました' })
    } catch (error) {
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'プロフィール', icon: '👤' },
    { id: 'account', name: 'アカウント', icon: '🔐' }
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600">プロフィール情報とアカウント設定を管理します</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      お名前
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      ポジション
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={profileData.position}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">選択してください</option>
                      <option value="スタイリスト">スタイリスト</option>
                      <option value="アシスタント">アシスタント</option>
                      <option value="受付">受付</option>
                      <option value="マネージャー">マネージャー</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">
                      スキルレベル
                    </label>
                    <select
                      id="skillLevel"
                      name="skillLevel"
                      value={profileData.skillLevel}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">選択してください</option>
                      <option value="1">レベル1（新人）</option>
                      <option value="2">レベル2（初級）</option>
                      <option value="3">レベル3（中級）</option>
                      <option value="4">レベル4（上級）</option>
                      <option value="5">レベル5（エキスパート）</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700">
                      入社日
                    </label>
                    <input
                      type="date"
                      id="hireDate"
                      name="hireDate"
                      value={profileData.hireDate}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                      緊急連絡先
                    </label>
                    <input
                      type="tel"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    住所
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  {isLoading ? '更新中...' : 'プロフィールを更新'}
                </button>
              </div>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">アカウント情報</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">メールアドレス:</span>
                      <span className="text-sm text-gray-900">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">ユーザー名:</span>
                      <span className="text-sm text-gray-900">{user?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">権限:</span>
                      <span className="text-sm text-gray-900">
                        {user?.role === 'admin' ? '管理者' : '従業員'}
                      </span>
                    </div>
                    {currentStaff && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">ポジション:</span>
                          <span className="text-sm text-gray-900">{currentStaff.position}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">入社日:</span>
                          <span className="text-sm text-gray-900">{currentStaff.hireDate}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">セキュリティ</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">パスワード変更</h4>
                        <p className="text-sm text-gray-500">アカウントのセキュリティを強化</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>

                  <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">ログイン履歴</h4>
                        <p className="text-sm text-gray-500">最近のアクセス記録を確認</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 