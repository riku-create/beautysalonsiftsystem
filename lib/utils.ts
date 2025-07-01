import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}

export function formatTime(timeString: string): string {
  return timeString
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP')
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export function getWeekDates(date: Date = new Date()): Date[] {
  const startOfWeek = new Date(date)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day
  startOfWeek.setDate(diff)
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek)
    currentDate.setDate(startOfWeek.getDate() + i)
    weekDates.push(currentDate)
  }
  
  return weekDates
}

export function getMonthDates(date: Date = new Date()): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const dates = []
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i))
  }
  
  return dates
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function getStatusColor(status: '申請中' | '承認済み' | '却下'): string {
  switch (status) {
    case '申請中':
      return 'bg-yellow-100 text-yellow-800'
    case '承認済み':
      return 'bg-green-100 text-green-800'
    case '却下':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPositionColor(position: string): string {
  switch (position) {
    case 'スタイリスト':
      return 'bg-blue-100 text-blue-800'
    case 'アシスタント':
      return 'bg-purple-100 text-purple-800'
    case '受付':
      return 'bg-pink-100 text-pink-800'
    case 'マネージャー':
      return 'bg-indigo-100 text-indigo-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getReservationStatusColor(status: '確認済み' | '未確認' | 'キャンセル' | '完了'): string {
  switch (status) {
    case '確認済み':
      return 'bg-blue-100 text-blue-800'
    case '未確認':
      return 'bg-yellow-100 text-yellow-800'
    case 'キャンセル':
      return 'bg-red-100 text-red-800'
    case '完了':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

export function getWeekStart(date: Date): Date {
  const result = new Date(date)
  const dayOfWeek = result.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
} 