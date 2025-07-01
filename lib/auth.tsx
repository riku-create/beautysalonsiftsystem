'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUsers, findUserByEmail, createUser, type User as DataUser } from './data'

// 認証ユーザー型（パスワードを除いた型）
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'employee' | 'customer'
  phone?: string
}

// 権限チェック用のヘルパー関数
const isEmployeeRole = (role: string) => role === 'employee'
const isAdminRole = (role: string) => role === 'admin'
const isCustomerRole = (role: string) => role === 'customer'

// 認証コンテキスト型
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (email: string, password: string, name: string, phone?: string) => Promise<boolean>
  isLoading: boolean
  isEmployee: () => boolean
  isAdmin: () => boolean
  isCustomer: () => boolean
}

// コンテキスト作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider コンポーネント
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ページ読み込み時にローカルストレージから認証状態を復元
  useEffect(() => {
    console.log('[DEBUG] AuthProvider 初期化開始')
    
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('auth_user')
        console.log('[DEBUG] ストレージから取得したユーザー:', storedUser)
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log('[DEBUG] パースされたユーザー:', parsedUser)
          setUser(parsedUser)
        }
      } catch (e) {
        console.error('[DEBUG] ユーザー復元エラー:', e)
        localStorage.removeItem('auth_user')
      } finally {
        setIsLoading(false)
        console.log('[DEBUG] 認証初期化完了')
      }
    }

    // 少し遅延させてローカルストレージの初期化を確実にする
    const timer = setTimeout(initializeAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  // ログイン機能
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[DEBUG] ===== ログイン処理開始 =====')
    console.log('[DEBUG] ログイン試行:', { email, password })
    setIsLoading(true)
    
    try {
      // 少し待ってからユーザー検索（ローカルストレージの初期化を確実にする）
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // 登録済みユーザーを検索
      const foundUser = findUserByEmail(email)
      console.log('[DEBUG] 見つかったユーザー:', foundUser)
      
      if (foundUser) {
        console.log('[DEBUG] パスワード比較:', { 
          input: password, 
          stored: foundUser.password, 
          match: foundUser.password === password 
        })
        
        if (foundUser.password === password) {
          console.log('[DEBUG] 認証成功')
          
          // パスワードを除いたユーザー情報でログイン
          const authUser: User = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role,
            phone: foundUser.phone
          }
          
          console.log('[DEBUG] 認証ユーザー作成:', authUser)
          
          setUser(authUser)
          localStorage.setItem('auth_user', JSON.stringify(authUser))
          setIsLoading(false)
          console.log('[DEBUG] ===== ログイン成功 =====')
          return true
        } else {
          console.log('[DEBUG] パスワードが一致しません')
        }
      } else {
        console.log('[DEBUG] ユーザーが見つかりません')
      }
      
      console.log('[DEBUG] ===== ログイン失敗 =====')
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('[DEBUG] ログインエラー:', error)
      setIsLoading(false)
      return false
    }
  }

  // ログアウト機能
  const logout = () => {
    console.log('[DEBUG] ログアウト実行')
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  // サインアップ機能
  const signup = async (email: string, password: string, name: string, phone?: string): Promise<boolean> => {
    console.log('[DEBUG] サインアップ開始:', { email, name, phone })
    setIsLoading(true)
    
    try {
      // 新しいユーザーを作成
      const newDataUser = createUser({
        email,
        password,
        name,
        role: 'customer', // 基本サインアップは予約者権限
        phone
      })
      
      console.log('[DEBUG] 新規ユーザー作成:', newDataUser)
      
      // パスワードを除いたユーザー情報でログイン
      const authUser: User = {
        id: newDataUser.id,
        email: newDataUser.email,
        name: newDataUser.name,
        role: newDataUser.role,
        phone: newDataUser.phone
      }
      
      setUser(authUser)
      localStorage.setItem('auth_user', JSON.stringify(authUser))
      setIsLoading(false)
      console.log('[DEBUG] サインアップ成功')
      return true
    } catch (error) {
      console.error('[DEBUG] サインアップエラー:', error)
      setIsLoading(false)
      return false
    }
  }

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    signup,
    isLoading,
    isEmployee: () => user ? isEmployeeRole(user.role) : false,
    isAdmin: () => user ? isAdminRole(user.role) : false,
    isCustomer: () => user ? isCustomerRole(user.role) : false
  }

  console.log('[DEBUG] AuthProvider レンダリング - user:', user, 'isLoading:', isLoading)

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth フック
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 