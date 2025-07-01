'use client'

import { AuthProvider } from '@/lib/auth'
import { ReactNode } from 'react'

interface ClientAuthProviderProps {
  children: ReactNode
}

export default function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
} 