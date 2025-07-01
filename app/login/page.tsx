'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { resetAllData } from '@/lib/data'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('[DEBUG] ログインフォーム送信:', { email, password })

    try {
      const success = await login(email, password)
      console.log('[DEBUG] ログイン結果:', success)
      if (success) {
        console.log('[DEBUG] ダッシュボードへリダイレクト')
        router.push('/dashboard')
      } else {
        setError('メールアドレスまたはパスワードが正しくありません。デバッグ情報はコンソールをご確認ください。')
      }
    } catch (err) {
      console.error('[DEBUG] ログインエラー:', err)
      setError('ログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  // デバッグ用：データリセット
  const handleResetData = () => {
    if (confirm('全てのデータをリセットしますか？この操作は元に戻せません。')) {
      resetAllData()
      alert('データをリセットしました。ページを再読み込みしてください。')
      window.location.reload()
    }
  }

  // デバッグ用：テストログイン
  const handleTestLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail)
    setPassword(testPassword)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-blue-600">美容室シフト管理</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          ログイン
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            無料トライアルを開始
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* デバッグ用リセットボタン */}
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800 mb-2">🔧 デバッグ機能</h3>
            <button
              onClick={handleResetData}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mr-2"
            >
              全データリセット
            </button>
            <p className="text-xs text-red-600 mt-1">
              ログインできない場合は「全データリセット」を試してください
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="パスワードを入力"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">デモ用アカウント</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p className="font-medium">デフォルトアカウント:</p>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p><strong>管理者:</strong> admin@salon.com / admin123</p>
                  </div>
                  <button
                    onClick={() => handleTestLogin('admin@salon.com', 'admin123')}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    入力
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p><strong>従業員:</strong> employee@salon.com / employee123</p>
                  </div>
                  <button
                    onClick={() => handleTestLogin('employee@salon.com', 'employee123')}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                  >
                    入力
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p><strong>予約者:</strong> customer@example.com / customer123</p>
                  </div>
                  <button
                    onClick={() => handleTestLogin('customer@example.com', 'customer123')}
                    className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded"
                  >
                    入力
                  </button>
                </div>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                ※ 新規従業員は<Link href="/signup/employee" className="text-blue-600 hover:text-blue-500">こちら</Link>からアカウント作成、予約者は<Link href="/signup" className="text-purple-600 hover:text-purple-500">こちら</Link>からアカウント作成できます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 