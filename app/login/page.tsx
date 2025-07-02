'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { resetAllData } from '@/lib/data'

// ローディングコンポーネント
function LoginPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">✂</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">美容室シフト管理システム</h1>
        </Link>
        
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ログインページを読み込み中...</p>
        </div>
      </div>
    </div>
  )
}

// メインのログインコンポーネント
function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // デモアカウント情報
  const demoAccounts = {
    admin: { email: 'admin@salon.com', password: 'admin123', role: '管理者' },
    employee: { email: 'employee@salon.com', password: 'employee123', role: '従業員' },
    customer: { email: 'customer@example.com', password: 'customer123', role: '予約者' }
  }

  // URL パラメータでデモアカウントを処理
  useEffect(() => {
    const demo = searchParams.get('demo')
    if (demo && demoAccounts[demo as keyof typeof demoAccounts]) {
      const account = demoAccounts[demo as keyof typeof demoAccounts]
      setEmail(account.email)
      setPassword(account.password)
      
      // 自動ログインを実行
      handleAutoLogin(account.email, account.password, account.role)
    }
  }, [searchParams])

  const handleAutoLogin = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    setError('')

    try {
      console.log(`[DEBUG] ${role}デモアカウントで自動ログイン:`, { email })
      const success = await login(email, password)
      
      if (success) {
        console.log(`[DEBUG] ${role}ログイン成功 - ダッシュボードへリダイレクト`)
        router.push('/dashboard')
      } else {
        setError(`${role}アカウントでのログインに失敗しました。`)
      }
    } catch (err) {
      console.error(`[DEBUG] ${role}ログインエラー:`, err)
      setError(`${role}アカウントでのログインに失敗しました。`)
    } finally {
      setIsLoading(false)
    }
  }

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

  // デモアカウントかどうかを判定
  const currentDemo = searchParams.get('demo')
  const isDemoMode = Boolean(currentDemo && demoAccounts[currentDemo as keyof typeof demoAccounts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">✂</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">美容室シフト管理システム</h1>
        </Link>
        
        {isDemoMode ? (
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {demoAccounts[currentDemo as keyof typeof demoAccounts].role}アカウントでログイン
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              デモアカウントで自動ログインしています...
            </p>
          </div>
        ) : (
          <>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              ログイン
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
                無料トライアルを開始
              </Link>
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {isLoading && isDemoMode && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-purple-700 font-medium">
                {demoAccounts[currentDemo as keyof typeof demoAccounts].role}アカウントでログイン中...
              </p>
            </div>
          )}

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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="your@email.com"
                  disabled={isLoading && isDemoMode}
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="パスワードを入力"
                  disabled={isLoading && isDemoMode}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          {/* デバッグ用テストアカウント */}
          {!isDemoMode && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-sm font-medium text-gray-800 mb-3">🧪 テストアカウント</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleTestLogin('admin@salon.com', 'admin123')}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded"
                >
                  管理者 (admin@salon.com)
                </button>
                <button
                  onClick={() => handleTestLogin('employee@salon.com', 'employee123')}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded"
                >
                  従業員 (employee@salon.com)
                </button>
                <button
                  onClick={() => handleTestLogin('customer@example.com', 'customer123')}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded"
                >
                  予約者 (customer@example.com)
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">またはこちらから</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                href="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                トップページに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// エクスポートするメインコンポーネント
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  )
} 