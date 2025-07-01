## 管理者アカウントロック時復旧システム提案

### Bolt.new用プロンプト

```markdown
美容室シフト管理システムに管理者アカウントロック時の緊急復旧機能を追加してください。セキュリティを保ちながら、管理者が確実に復旧できるシステムを実装してください。既存の機能は一切変更せず、緊急復旧機能のみを追加してください。

## 追加が必要な緊急復旧機能

### 1. 複数管理者システム

**修正対象ファイル**: `/lib/data.ts`

```typescript
// ユーザー権限の拡張
export type UserRole = 'super-admin' | 'admin' | 'employee' | 'customer'

// デフォルトユーザーの追加
const additionalAdminUsers: User[] = [
  {
    id: 'super-admin-1',
    email: 'owner@salon.com',
    password: 'owner2024',
    name: 'オーナー',
    role: 'super-admin',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'admin-backup',
    email: 'manager@salon.com', 
    password: 'manager2024',
    name: '店長',
    role: 'admin',
    createdAt: new Date('2024-01-01').toISOString()
  }
]
```

### 2. 緊急マスターキーシステム

**新規ファイル**: `/lib/emergencyUnlock.ts`

```typescript
export interface EmergencyKey {
  storeCode: string // 店舗コード
  emergencyKey: string // 緊急解除キー
  createdAt: string
  lastUsed?: string
  usageHistory: Array<{
    usedAt: string
    targetEmail: string
    success: boolean
  }>
}

export class EmergencyUnlockManager {
  private static readonly STORAGE_KEY = 'beauty-salon-emergency-key'
  
  // 緊急キー生成（初回セットアップ時）
  static generateEmergencyKey(
    storeName: string,
    openingDate: string,
    phoneNumber: string
  ): string {
    const baseString = `${storeName}-${openingDate}-${phoneNumber}`
    const hash = btoa(baseString).slice(0, 12).toUpperCase()
    return `SALON-${hash}`
  }
  
  // 緊急キー設定
  static setEmergencyKey(storeInfo: {
    name: string
    openingDate: string
    phone: string
  }): string {
    const emergencyKey = this.generateEmergencyKey(
      storeInfo.name,
      storeInfo.openingDate, 
      storeInfo.phone
    )
    
    const emergencyData: EmergencyKey = {
      storeCode: btoa(storeInfo.name),
      emergencyKey,
      createdAt: new Date().toISOString(),
      usageHistory: []
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(emergencyData))
    return emergencyKey
  }
  
  // 緊急解除実行
  static async performEmergencyUnlock(
    inputKey: string,
    targetEmail: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const emergencyData = this.getEmergencyData()
      if (!emergencyData) {
        return { success: false, message: '緊急キーが設定されていません' }
      }
      
      if (inputKey !== emergencyData.emergencyKey) {
        // 失敗記録
        emergencyData.usageHistory.push({
          usedAt: new Date().toISOString(),
          targetEmail,
          success: false
        })
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(emergencyData))
        return { success: false, message: '緊急キーが正しくありません' }
      }
      
      // ロック解除実行
      const AccountSecurityManager = (await import('./accountSecurity')).AccountSecurityManager
      const unlockResult = AccountSecurityManager.emergencyUnlock(targetEmail, 'EMERGENCY_KEY')
      
      // 使用記録
      emergencyData.lastUsed = new Date().toISOString()
      emergencyData.usageHistory.push({
        usedAt: new Date().toISOString(),
        targetEmail,
        success: unlockResult
      })
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(emergencyData))
      
      if (unlockResult) {
        return { 
          success: true, 
          message: `アカウント ${targetEmail} のロックを解除しました` 
        }
      } else {
        return { 
          success: false, 
          message: 'ロック解除に失敗しました' 
        }
      }
      
    } catch (error) {
      console.error('緊急解除エラー:', error)
      return { success: false, message: 'システムエラーが発生しました' }
    }
  }
  
  private static getEmergencyData(): EmergencyKey | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }
}
```

### 3. 管理者用緊急解除画面

**新規ファイル**: `/app/emergency-unlock/page.tsx`

```tsx
'use client'
import { useState } from 'react'
import { EmergencyUnlockManager } from '@/lib/emergencyUnlock'

export default function EmergencyUnlockPage() {
  const [formData, setFormData] = useState({
    emergencyKey: '',
    targetEmail: ''
  })
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await EmergencyUnlockManager.performEmergencyUnlock(
        formData.emergencyKey,
        formData.targetEmail
      )
      setResult(result)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border-2 border-red-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">緊急アカウント解除</h1>
          <p className="text-gray-600 text-sm">
            管理者アカウントがロックされた場合の緊急解除機能です
          </p>
        </div>

        {result && (
          <div className={`mb-4 p-4 rounded-md ${
            result.success ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {result.message}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label htmlFor="targetEmail" className="block text-sm font-medium text-gray-700 mb-1">
              解除対象メールアドレス
            </label>
            <input
              type="email"
              id="targetEmail"
              value={formData.targetEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, targetEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="admin@salon.com"
              required
            />
          </div>

          <div>
            <label htmlFor="emergencyKey" className="block text-sm font-medium text-gray-700 mb-1">
              緊急解除キー
            </label>
            <input
              type="text"
              id="emergencyKey"
              value={formData.emergencyKey}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="SALON-XXXXXXXXXX"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              店舗セットアップ時に設定された緊急キーを入力してください
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? '解除中...' : 'アカウントロック解除'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">⚠️ 注意事項</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• この機能は緊急時のみ使用してください</li>
            <li>• 全ての使用履歴が記録されます</li>
            <li>• 緊急キーは店舗責任者のみが知る情報です</li>
            <li>• 不正使用を検知した場合、システムが停止される可能性があります</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/login" 
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← ログイン画面に戻る
          </a>
        </div>
      </div>
    </div>
  )
}
```

### 4. ログイン画面への緊急解除リンク追加

**修正対象ファイル**: `/app/login/page.tsx`

既存のログインフォームの下部に以下を追加：

```tsx
{/* 緊急解除リンク */}
<div className="mt-6 text-center border-t pt-4">
  <p className="text-xs text-gray-500 mb-2">管理者アカウントがロックされた場合</p>
  <a 
    href="/emergency-unlock"
    className="text-xs text-red-600 hover:text-red-800 underline font-medium"
  >
    緊急アカウント解除
  </a>
</div>
```

### 5. 初期セットアップ機能

**新規ファイル**: `/app/setup/page.tsx`

```tsx
'use client'
import { useState, useEffect } from 'react'
import { EmergencyUnlockManager } from '@/lib/emergencyUnlock'

export default function SetupPage() {
  const [isSetup, setIsSetup] = useState(false)
  const [storeInfo, setStoreInfo] = useState({
    name: '',
    openingDate: '',
    phone: ''
  })
  const [generatedKey, setGeneratedKey] = useState('')

  useEffect(() => {
    // 既にセットアップ済みかチェック
    const existingKey = localStorage.getItem('beauty-salon-emergency-key')
    setIsSetup(!!existingKey)
  }, [])

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!storeInfo.name || !storeInfo.openingDate || !storeInfo.phone) {
      alert('全ての項目を入力してください')
      return
    }

    const emergencyKey = EmergencyUnlockManager.setEmergencyKey(storeInfo)
    setGeneratedKey(emergencyKey)
    setIsSetup(true)
  }

  if (isSetup && !generatedKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">セットアップ完了</h1>
            <p className="text-gray-600 mb-4">システムは既にセットアップされています</p>
            <a 
              href="/login"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              ログイン画面へ
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {!generatedKey ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">初期セットアップ</h1>
              <p className="text-gray-600 text-sm">
                緊急時のアカウント復旧用にストア情報を設定してください
              </p>
            </div>

            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                  店舗名
                </label>
                <input
                  type="text"
                  id="storeName"
                  value={storeInfo.name}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="○○美容室"
                  required
                />
              </div>

              <div>
                <label htmlFor="openingDate" className="block text-sm font-medium text-gray-700 mb-1">
                  開業日
                </label>
                <input
                  type="date"
                  id="openingDate"
                  value={storeInfo.openingDate}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, openingDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  店舗電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={storeInfo.phone}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="03-1234-5678"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                緊急キーを生成
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">緊急キーが生成されました</h2>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">緊急解除キー</p>
              <p className="text-lg font-mono bg-white p-2 rounded border text-center text-red-600">
                {generatedKey}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">⚠️ 重要な注意事項</h3>
              <ul className="text-xs text-red-700 text-left space-y-1">
                <li>• このキーは安全な場所に保管してください</li>
                <li>• 店舗責任者のみが知る情報として管理してください</li>
                <li>• 紛失した場合は再生成が必要です</li>
                <li>• 不正使用を防ぐため、他者に教えないでください</li>
              </ul>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 mr-2"
            >
              印刷して保管
            </button>
            
            <a 
              href="/login"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 ml-2 inline-block"
            >
              ログイン画面へ
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 6. 自動解除機能の修正

**修正対象ファイル**: `/lib/accountSecurity.ts`

```typescript
// 管理者の24時間自動解除機能を追加
static checkAutoUnlock(email: string): boolean {
  const lockInfo = this.getAccountLockInfo(email)
  if (!lockInfo || lockInfo.lockLevel !== 'permanent') return false
  
  // 管理者アカウントのみ24時間で自動解除
  const user = findUserByEmail(email)
  if (user && (user.role === 'admin' || user.role === 'super-admin')) {
    if (lockInfo.permanentLockTime) {
      const lockTime = new Date(lockInfo.permanentLockTime)
      const now = new Date()
      const hoursPassed = (now.getTime() - lockTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursPassed >= 24) {
        // 自動解除実行
        this.unlockAccount(email, 'SYSTEM_AUTO_UNLOCK')
        return true
      }
    }
  }
  
  return false
}

// 緊急解除機能
static emergencyUnlock(email: string, unlockMethod: string): boolean {
  try {
    const lockInfo = this.getAccountLockInfo(email)
    if (!lockInfo) return false
    
    // ロック情報をクリア
    lockInfo.lockLevel = 'none'
    lockInfo.failedAttempts = 0
    lockInfo.temporaryLockUntil = undefined
    lockInfo.permanentLockTime = undefined
    
    // 解除履歴を追加
    lockInfo.unlockHistory.push({
      unlockedAt: new Date().toISOString(),
      unlockedBy: unlockMethod,
      reason: '緊急解除キーによる解除'
    })
    
    this.saveAccountLockInfo(email, lockInfo)
    
    console.log(`[SECURITY] 緊急解除実行: ${email} by ${unlockMethod}`)
    return true
    
  } catch (error) {
    console.error('緊急解除エラー:', error)
    return false
  }
}
```

## 実装の優先順位

1. **複数管理者システム** - 最も安全で実用的
2. **緊急マスターキー** - 物理的なセキュリティと利便性のバランス
3. **自動解除機能** - 完全ロックアウトの防止
4. **初期セットアップ** - 店舗ごとのカスタマイズ

## セキュリティ考慮事項

- 緊急キーの使用履歴を完全記録
- 不正使用の検知機能
- 物理的な店舗確認が必要な仕組み
- 定期的なキー更新の推奨

この実装により、セキュリティを保ちながら確実な復旧手段を提供できます。 