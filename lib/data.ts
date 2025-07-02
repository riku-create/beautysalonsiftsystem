import { generateId } from './utils'

export interface Staff {
  id: string
  name: string
  position: 'スタイリスト' | 'アシスタント' | '受付' | 'マネージャー'
  email: string
  phone: string
  skillLevel?: 1 | 2 | 3 | 4 | 5
  hireDate: string
  isActive: boolean
  createdAt: string
  emergencyContact?: string
  address?: string
}

// シフトテンプレート（管理者が作成する勤務パターン）
export interface ShiftTemplate {
  id: string
  name: string // 例：「早番」「遅番」「フルタイム」など
  startTime: string
  endTime: string
  breakDuration: number // 休憩時間（分）
  description?: string
  color: string // カレンダー表示用の色
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Shift {
  id: string
  staffId: string
  staffName: string
  date: string
  startTime: string
  endTime: string
  position?: string
  breakStart?: string
  breakEnd?: string
  breakDuration?: number // 休憩時間（分）
  templateId?: string // 使用したシフトテンプレートのID
  templateName?: string // テンプレート名
  status: '申請中' | '承認済み' | '却下'
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface Reservation {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  date: string
  startTime: string
  endTime: string
  service: string
  staffId: string
  staffName: string
  status: '確認済み' | '未確認' | 'キャンセル' | '完了'
  price: number
  notes?: string
  createdAt: string
}

export interface Service {
  id: string
  name: string
  duration: number // 分
  price: number
  description: string
  isActive: boolean
  createdAt: string
}

// AI自動シフト作成システム用の新しいデータ構造

// 従業員の希望提出
export interface ShiftRequest {
  id: string
  staffId: string
  staffName: string
  month: string // YYYY-MM形式
  dayOffRequests: string[] // 休日希望日（日付配列）
  paidLeaveRequests: string[] // 有休希望日（日付配列）
  notes?: string
  status: '申請中' | '承認済み' | '却下'
  submittedAt: string
  updatedAt?: string
}

// 管理者の条件設定
export interface ShiftConditions {
  id: string
  month: string // YYYY-MM形式
  regularHolidays: string[] // 定休日（曜日番号配列: 0=日曜日, 1=月曜日...）
  specialHolidays: string[] // 特別休業日（日付配列）
  minimumStaffMode: 'minimum_required' | 'maximum_absent' // 最低出勤者数 or 最大休暇者数
  minimumStaffCount?: number // 最低出勤者数
  maximumAbsentCount?: number // 最大休暇者数
  staffSpecialConditions: StaffSpecialCondition[]
  deadlineDaysBefore: number // 希望締切日（月末の何日前）
  laborStandards: LaborStandards
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

// 従業員個別条件
export interface StaffSpecialCondition {
  staffId: string
  staffName: string
  maxWorkDaysPerMonth?: number // 月最大勤務日数
  minWorkDaysPerMonth?: number // 月最小勤務日数
  fixedWorkDays: string[] // 確実に出勤が必要な日（日付配列）
  fixedOffDays: string[] // 確実に休みが必要な日（日付配列）
  preferredShiftTemplateIds: string[] // 優先シフトテンプレート
  maxConsecutiveWorkDays?: number // 最大連続勤務日数
  notes?: string
}

// 労働基準法関連設定
export interface LaborStandards {
  maxConsecutiveWorkDays: number // 最大連続勤務日数（デフォルト6日）
  maxWorkHoursPerDay: number // 1日最大労働時間（デフォルト8時間）
  maxWorkHoursPerWeek: number // 週最大労働時間（デフォルト40時間）
  maxWorkHoursPerMonth: number // 月最大労働時間（デフォルト160時間）
  minimumRestDaysPerWeek: number // 週最低休日数（デフォルト1日）
  nightWorkStartTime: string // 深夜労働開始時間（デフォルト22:00）
  nightWorkEndTime: string // 深夜労働終了時間（デフォルト5:00）
  overtimeThresholdHours: number // 残業時間の基準（デフォルト8時間）
}

// AI生成されたシフト
export interface GeneratedShift {
  id: string
  month: string // YYYY-MM形式
  shifts: Shift[]
  conditionsId: string // 使用された条件設定のID
  generatedAt: string
  isApproved: boolean
  approvedAt?: string
  approvedBy?: string
  violationWarnings: LaborViolation[] // 労働基準法違反警告
  score: number // シフトの最適化スコア（0-100）
}

// 労働基準法違反警告
export interface LaborViolation {
  type: 'consecutive_work_days' | 'daily_hours' | 'weekly_hours' | 'monthly_hours' | 'insufficient_rest' | 'night_work'
  severity: 'warning' | 'error' | 'critical'
  staffId: string
  staffName: string
  date?: string
  details: string
  suggestion?: string
}

export interface Salon {
  id: string
  name: string
  email: string
  phone: string
  address: string
  openHours: string
  closeHours: string
}

// サンプルデータ
export const sampleStaff: Staff[] = [
  {
    id: '1',
    name: '田中 美咲',
    position: 'スタイリスト',
    email: 'tanaka@salon.com',
    phone: '090-1234-5678',
    skillLevel: 5,
    hireDate: '2020-04-01',
    isActive: true,
    createdAt: '2020-04-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: '山田 花子',
    position: 'スタイリスト',
    email: 'yamada@salon.com',
    phone: '090-2345-6789',
    skillLevel: 4,
    hireDate: '2021-06-15',
    isActive: true,
    createdAt: '2021-06-15T00:00:00.000Z'
  },
  {
    id: '3',
    name: '鈴木 太郎',
    position: 'アシスタント',
    email: 'suzuki@salon.com',
    phone: '090-3456-7890',
    skillLevel: 2,
    hireDate: '2023-03-01',
    isActive: true,
    createdAt: '2023-03-01T00:00:00.000Z'
  },
  {
    id: '4',
    name: '佐藤 恵子',
    position: '受付',
    email: 'sato@salon.com',
    phone: '090-4567-8901',
    skillLevel: 3,
    hireDate: '2022-09-10',
    isActive: true,
    createdAt: '2022-09-10T00:00:00.000Z'
  },
  {
    id: '5',
    name: '高橋 一郎',
    position: 'マネージャー',
    email: 'takahashi@salon.com',
    phone: '090-5678-9012',
    skillLevel: 5,
    hireDate: '2022-01-20',
    isActive: true,
    createdAt: '2022-01-20T00:00:00.000Z'
  },
  {
    id: 'employee-sample',
    name: 'サンプル従業員',
    position: 'アシスタント',
    email: 'employee@salon.com',
    phone: '090-9999-1111',
    skillLevel: 2,
    hireDate: '2024-01-01',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

// サンプルシフトテンプレート
export const sampleShiftTemplates: ShiftTemplate[] = [
  {
    id: 'template-1',
    name: '早番',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    description: '朝の開店準備から夕方まで',
    color: '#3B82F6', // 青色
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'template-2',
    name: '遅番',
    startTime: '12:00',
    endTime: '20:00',
    breakDuration: 60,
    description: '昼から閉店まで',
    color: '#EF4444', // 赤色
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'template-3',
    name: 'フルタイム',
    startTime: '10:00',
    endTime: '19:00',
    breakDuration: 90,
    description: '1日フルタイム勤務',
    color: '#10B981', // 緑色
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'template-4',
    name: '短時間',
    startTime: '14:00',
    endTime: '18:00',
    breakDuration: 0,
    description: '午後の短時間勤務',
    color: '#F59E0B', // オレンジ色
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  }
]

export const sampleShifts: Shift[] = [
  {
    id: '1',
    staffId: '1',
    staffName: '田中 美咲',
    date: '2025-01-20',
    startTime: '09:00',
    endTime: '17:00',
    position: 'スタイリスト',
    breakDuration: 60,
    templateId: 'template-1',
    templateName: '早番',
    status: '承認済み',
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    staffId: '2',
    staffName: '山田 花子',
    date: '2025-01-20',
    startTime: '12:00',
    endTime: '20:00',
    position: 'スタイリスト',
    breakDuration: 60,
    templateId: 'template-2',
    templateName: '遅番',
    status: '承認済み',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '3',
    staffId: '3',
    staffName: '鈴木 太郎',
    date: '2025-01-20',
    startTime: '10:00',
    endTime: '19:00',
    position: 'アシスタント',
    breakDuration: 90,
    templateId: 'template-3',
    templateName: 'フルタイム',
    status: '承認済み',
    createdAt: '2025-01-15T11:00:00Z'
  },
  {
    id: '4',
    staffId: '4',
    staffName: '佐藤 恵子',
    date: '2025-01-20',
    startTime: '14:00',
    endTime: '18:00',
    position: '受付',
    breakDuration: 0,
    templateId: 'template-4',
    templateName: '短時間',
    status: '承認済み',
    createdAt: '2025-01-15T11:30:00Z'
  },
  {
    id: '5',
    staffId: '1',
    staffName: '田中 美咲',
    date: '2025-01-21',
    startTime: '09:00',
    endTime: '17:00',
    position: 'スタイリスト',
    breakDuration: 60,
    templateId: 'template-1',
    templateName: '早番',
    status: '申請中',
    createdAt: '2025-01-16T09:00:00Z'
  }
]

export const sampleReservations: Reservation[] = [
  {
    id: '1',
    customerName: '鈴木 花子',
    customerPhone: '090-1111-2222',
    customerEmail: 'suzuki.hanako@email.com',
    date: '2025-01-20',
    startTime: '10:00',
    endTime: '12:00',
    service: 'カット + カラー',
    staffId: '1',
    staffName: '田中 美咲',
    status: '確認済み',
    price: 8000,
    notes: '前回と同じカラーで',
    createdAt: '2025-01-18T14:00:00Z'
  },
  {
    id: '2',
    customerName: '佐藤 太郎',
    customerPhone: '090-3333-4444',
    date: '2025-01-20',
    startTime: '14:00',
    endTime: '15:30',
    service: 'カット',
    staffId: '2',
    staffName: '山田 花子',
    status: '確認済み',
    price: 4000,
    createdAt: '2025-01-19T10:00:00Z'
  },
  {
    id: '3',
    customerName: '田中 恵子',
    customerPhone: '090-5555-6666',
    customerEmail: 'tanaka.keiko@email.com',
    date: '2025-01-21',
    startTime: '11:00',
    endTime: '14:00',
    service: 'パーマ + カット',
    staffId: '1',
    staffName: '田中 美咲',
    status: '確認済み',
    price: 12000,
    notes: 'ゆるふわパーマ希望',
    createdAt: '2025-01-19T16:30:00Z'
  },
  {
    id: '4',
    customerName: '高橋 美里',
    customerPhone: '090-7777-8888',
    date: '2025-01-21',
    startTime: '15:00',
    endTime: '17:00',
    service: 'ヘッドスパ + トリートメント',
    staffId: '2',
    staffName: '山田 花子',
    status: '未確認',
    price: 6000,
    createdAt: '2025-01-20T12:00:00Z'
  },
  {
    id: '5',
    customerName: '山田 次郎',
    customerPhone: '090-9999-0000',
    date: '2025-01-22',
    startTime: '16:00',
    endTime: '17:00',
    service: 'カット',
    staffId: '1',
    staffName: '田中 美咲',
    status: '確認済み',
    price: 4000,
    createdAt: '2025-01-21T08:00:00Z'
  }
]

export const sampleSalon: Salon = {
  id: '1',
  name: 'サロン・ド・ビューティー',
  email: 'info@salon-beauty.com',
  phone: '03-1234-5678',
  address: '東京都渋谷区〇〇 1-2-3',
  openHours: '09:00',
  closeHours: '20:00'
}

// サンプルシフト条件（テスト用）
export const sampleShiftConditions: ShiftConditions[] = [
  {
    id: 'conditions-sample-1',
    month: '2025-02', // 来月
    regularHolidays: ['0', '6'], // 日曜日と土曜日（デモ用・通常は営業している）
    specialHolidays: [], // 特別休業日なし
    minimumStaffMode: 'minimum_required',
    minimumStaffCount: 2,
    maximumAbsentCount: undefined,
    deadlineDaysBefore: 10,
    staffSpecialConditions: [
      {
        staffId: '1', // 田中 美咲
        staffName: '田中 美咲',
        maxWorkDaysPerMonth: 22,
        minWorkDaysPerMonth: 18,
        fixedWorkDays: [],
        fixedOffDays: [],
        preferredShiftTemplateIds: ['template-1', 'template-3'],
        notes: 'ベテランスタイリストのため、忙しい日は優先配置'
      },
      {
        staffId: '2', // 山田 花子
        staffName: '山田 花子',
        maxWorkDaysPerMonth: 20,
        minWorkDaysPerMonth: 16,
        fixedWorkDays: [],
        fixedOffDays: [],
        preferredShiftTemplateIds: ['template-2', 'template-3'],
        notes: '夕方からの勤務を希望'
      }
    ],
    laborStandards: {
      maxConsecutiveWorkDays: 6,
      maxWorkHoursPerDay: 8,
      maxWorkHoursPerWeek: 40,
      maxWorkHoursPerMonth: 160,
      minimumRestDaysPerWeek: 1,
      nightWorkStartTime: '22:00',
      nightWorkEndTime: '05:00',
      overtimeThresholdHours: 8
    },
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  }
]

// サンプル希望申請データ
export const sampleShiftRequests: ShiftRequest[] = [
  {
    id: 'request-sample-1',
    staffId: '1',
    staffName: '田中 美咲',
    month: '2025-02',
    dayOffRequests: ['2025-02-10', '2025-02-17', '2025-02-24'], // 月の中の3日間
    paidLeaveRequests: ['2025-02-14'], // バレンタインデーに有休
    notes: '家族の用事があるため、できれば連休をいただければと思います。',
    status: '承認済み',
    submittedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'request-sample-2',
    staffId: '2',
    staffName: '山田 花子',
    month: '2025-02',
    dayOffRequests: ['2025-02-03', '2025-02-11', '2025-02-18', '2025-02-25'],
    paidLeaveRequests: [],
    notes: 'よろしくお願いします。',
    status: '申請中',
    submittedAt: '2025-01-20T14:30:00Z'
  }
]

// データ管理関数
export function getStaff(): Staff[] {
  const saved = localStorage.getItem('beauty-salon-staff')
  return saved ? JSON.parse(saved) : sampleStaff
}

export function saveStaff(staff: Staff[]): void {
  localStorage.setItem('beauty-salon-staff', JSON.stringify(staff))
}

export function getShifts(): Shift[] {
  const saved = localStorage.getItem('beauty-salon-shifts')
  return saved ? JSON.parse(saved) : sampleShifts
}

export function saveShifts(shifts: Shift[]): void {
  localStorage.setItem('beauty-salon-shifts', JSON.stringify(shifts))
}

export function getSalon(): Salon {
  const saved = localStorage.getItem('beauty-salon-settings')
  return saved ? JSON.parse(saved) : sampleSalon
}

export function saveSalon(salon: Salon): void {
  localStorage.setItem('beauty-salon-settings', JSON.stringify(salon))
}

export function getReservations(): Reservation[] {
  const saved = localStorage.getItem('beauty-salon-reservations')
  return saved ? JSON.parse(saved) : sampleReservations
}

export function saveReservations(reservations: Reservation[]): void {
  localStorage.setItem('beauty-salon-reservations', JSON.stringify(reservations))
}

// ユーザー管理機能
export interface User {
  id: string
  email: string
  password: string // 本番環境では暗号化が必要
  name: string
  role: 'admin' | 'employee' | 'customer'
  phone?: string // 予約者用
  createdAt: string
}

// 通知システム
export interface Notification {
  id: string
  userId: string // 通知を受け取るユーザーID
  type: 'shift_edit' | 'shift_approval' | 'shift_rejection' | 'reservation_confirmed' | 'reservation_rejected' | 'general'
  title: string
  message: string
  shiftId?: string // シフト関連の通知の場合
  reservationId?: string // 予約関連の通知の場合
  isRead: boolean
  createdAt: string
}

// デフォルトユーザー
const defaultUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@salon.com',
    password: 'admin123',
    name: '管理者',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'employee-1',
    email: 'employee@salon.com',
    password: 'employee123',
    name: 'サンプル従業員',
    role: 'employee',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'customer-1',
    email: 'customer@example.com',
    password: 'customer123',
    name: '田中花子',
    role: 'customer',
    phone: '090-1234-5678',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

export function getUsers(): User[] {
  try {
    const users = localStorage.getItem('beauty-salon-users')
    console.log('[DEBUG] localStorage からのユーザーデータ:', users)
    
    if (users) {
      const parsedUsers = JSON.parse(users)
      console.log('[DEBUG] パースされたユーザー:', parsedUsers)
      
      // データが空の場合はデフォルトユーザーを返す
      if (parsedUsers.length === 0) {
        console.log('[DEBUG] ユーザーデータが空のため、デフォルトを設定')
        localStorage.setItem('beauty-salon-users', JSON.stringify(defaultUsers))
        return defaultUsers
      }
      
      return parsedUsers
    }
    
    // 初回アクセス時はデフォルトユーザーを設定
    console.log('[DEBUG] 初回アクセス - デフォルトユーザーを設定')
    localStorage.setItem('beauty-salon-users', JSON.stringify(defaultUsers))
    return defaultUsers
  } catch (error) {
    console.error('[DEBUG] getUsers エラー:', error)
    // エラーが発生した場合もデフォルトユーザーを返す
    localStorage.setItem('beauty-salon-users', JSON.stringify(defaultUsers))
    return defaultUsers
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem('beauty-salon-users', JSON.stringify(users))
    console.log('[DEBUG] ユーザーデータ保存完了:', users)
  } catch (error) {
    console.error('[DEBUG] saveUsers エラー:', error)
  }
}

export function findUserByEmail(email: string): User | null {
  try {
    const users = getUsers()
    console.log('[DEBUG] 全ユーザー数:', users.length)
    console.log('[DEBUG] 検索メール:', email)
    
    // デバッグ: 各ユーザーのメールアドレスを表示
    users.forEach((user, index) => {
      console.log(`[DEBUG] ユーザー${index + 1}: ${user.email} (${user.name})`)
    })
    
    const foundUser = users.find(user => {
      const isMatch = user.email.toLowerCase() === email.toLowerCase()
      console.log(`[DEBUG] ${user.email} === ${email} : ${isMatch}`)
      return isMatch
    }) || null
    
    console.log('[DEBUG] 検索結果:', foundUser)
    return foundUser
  } catch (error) {
    console.error('[DEBUG] findUserByEmail エラー:', error)
    return null
  }
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers()
  
  // メール重複チェック
  if (users.some(user => user.email === userData.email)) {
    throw new Error('このメールアドレスは既に使用されています')
  }
  
  const newUser: User = {
    ...userData,
    id: generateId(),
    role: userData.role || 'employee', // デフォルトは従業員
    createdAt: new Date().toISOString()
  }
  
  const updatedUsers = [...users, newUser]
  saveUsers(updatedUsers)
  
  return newUser
}

// 通知機能
export function getNotifications(): Notification[] {
  try {
    const notifications = localStorage.getItem('beauty-salon-notifications')
    return notifications ? JSON.parse(notifications) : []
  } catch (error) {
    console.error('[DEBUG] getNotifications エラー:', error)
    return []
  }
}

export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem('beauty-salon-notifications', JSON.stringify(notifications))
  } catch (error) {
    console.error('[DEBUG] saveNotifications エラー:', error)
  }
}

export function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const notification: Notification = {
    id: generateId(),
    ...notificationData,
    createdAt: new Date().toISOString()
  }

  const notifications = getNotifications()
  notifications.unshift(notification) // 最新を先頭に
  saveNotifications(notifications)

  console.log('[DEBUG] 通知作成:', notification)
  return notification
}

export function getUserNotifications(userId: string): Notification[] {
  const notifications = getNotifications()
  return notifications.filter(n => n.userId === userId)
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const notification = notifications.find(n => n.id === notificationId)
  if (notification) {
    notification.isRead = true
    saveNotifications(notifications)
    console.log('[DEBUG] 通知を既読にしました:', notificationId)
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getNotifications()
  let updated = false
  
  notifications.forEach(notification => {
    if (notification.userId === userId && !notification.isRead) {
      notification.isRead = true
      updated = true
    }
  })
  
  if (updated) {
    saveNotifications(notifications)
    console.log('[DEBUG] 全通知を既読にしました:', userId)
  }
}

// シフト編集時の通知作成
export function notifyShiftEdit(shiftId: string, staffId: string, adminName: string): void {
  const shift = getShifts().find(s => s.id === shiftId)
  if (!shift) return

  createNotification({
    userId: staffId,
    type: 'shift_edit',
    title: 'シフトが編集されました',
    message: `${adminName}により、${shift.date}のシフトが編集されました。詳細をご確認ください。`,
    shiftId: shiftId,
    isRead: false
  })
}

// シフト編集機能
export function updateShift(shiftId: string, updates: Partial<Shift>, adminUser: User): boolean {
  const shifts = getShifts()
  const shiftIndex = shifts.findIndex(s => s.id === shiftId)
  
  if (shiftIndex === -1) {
    console.error('[DEBUG] シフトが見つかりません:', shiftId)
    return false
  }

  const originalShift = shifts[shiftIndex]
  const updatedShift = {
    ...originalShift,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  shifts[shiftIndex] = updatedShift
  saveShifts(shifts)

  // 編集通知を送信（管理者が編集した場合のみ）
  if (adminUser.role === 'admin' && originalShift.staffId !== adminUser.id) {
    notifyShiftEdit(shiftId, originalShift.staffId, adminUser.name)
  }

  console.log('[DEBUG] シフト更新完了:', updatedShift)
  return true
}

// デバッグ用：データをリセットする関数
// シフトテンプレート管理機能
export function getShiftTemplates(): ShiftTemplate[] {
  try {
    const templates = localStorage.getItem('beauty-salon-shift-templates')
    return templates ? JSON.parse(templates) : sampleShiftTemplates
  } catch (error) {
    console.error('[DEBUG] getShiftTemplates エラー:', error)
    return sampleShiftTemplates
  }
}

export function saveShiftTemplates(templates: ShiftTemplate[]): void {
  try {
    localStorage.setItem('beauty-salon-shift-templates', JSON.stringify(templates))
    console.log('[DEBUG] シフトテンプレート保存完了:', templates)
  } catch (error) {
    console.error('[DEBUG] saveShiftTemplates エラー:', error)
  }
}

export function createShiftTemplate(templateData: Omit<ShiftTemplate, 'id' | 'createdAt' | 'updatedAt'>): ShiftTemplate {
  const template: ShiftTemplate = {
    id: generateId(),
    ...templateData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const templates = getShiftTemplates()
  templates.push(template)
  saveShiftTemplates(templates)

  console.log('[DEBUG] シフトテンプレート作成:', template)
  return template
}

export function updateShiftTemplate(templateId: string, updates: Partial<ShiftTemplate>): boolean {
  const templates = getShiftTemplates()
  const templateIndex = templates.findIndex(t => t.id === templateId)
  
  if (templateIndex === -1) {
    console.error('[DEBUG] シフトテンプレートが見つかりません:', templateId)
    return false
  }

  templates[templateIndex] = {
    ...templates[templateIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  saveShiftTemplates(templates)
  console.log('[DEBUG] シフトテンプレート更新完了:', templates[templateIndex])
  return true
}

export function deleteShiftTemplate(templateId: string): boolean {
  const templates = getShiftTemplates()
  const updatedTemplates = templates.filter(t => t.id !== templateId)
  
  if (templates.length === updatedTemplates.length) {
    console.error('[DEBUG] 削除するシフトテンプレートが見つかりません:', templateId)
    return false
  }

  saveShiftTemplates(updatedTemplates)
  console.log('[DEBUG] シフトテンプレート削除完了:', templateId)
  return true
}

export function getActiveShiftTemplates(): ShiftTemplate[] {
  return getShiftTemplates().filter(t => t.isActive)
}

// 従業員用：シフトテンプレートを使ったシフト申請
export function createShiftFromTemplate(
  templateId: string, 
  staffId: string, 
  staffName: string, 
  date: string, 
  notes?: string
): Shift {
  const template = getShiftTemplates().find(t => t.id === templateId)
  if (!template) {
    throw new Error('シフトテンプレートが見つかりません')
  }

  // 重複チェック
  const existingShifts = getShifts()
  const duplicateShift = existingShifts.find(s => 
    s.staffId === staffId && s.date === date
  )
  
  if (duplicateShift) {
    throw new Error('この日は既にシフトが申請されています')
  }

  const newShift: Shift = {
    id: generateId(),
    staffId,
    staffName,
    date,
    startTime: template.startTime,
    endTime: template.endTime,
    breakDuration: template.breakDuration,
    templateId: template.id,
    templateName: template.name,
    status: '申請中',
    notes,
    createdAt: new Date().toISOString()
  }

  const shifts = getShifts()
  shifts.push(newShift)
  saveShifts(shifts)

  console.log('[DEBUG] テンプレートからシフト作成:', newShift)
  return newShift
}

// サンプルサービス
export const sampleServices: Service[] = [
  {
    id: 'service-1',
    name: 'カット',
    duration: 60,
    price: 3000,
    description: '基本のカット',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'service-2',
    name: 'カット + カラー',
    duration: 120,
    price: 8000,
    description: 'カット + カラーリング',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'service-3',
    name: 'カット + パーマ',
    duration: 150,
    price: 10000,
    description: 'カット + パーマ',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'service-4',
    name: 'カラーのみ',
    duration: 90,
    price: 5000,
    description: 'カラーリングのみ',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

// サービス管理機能
export function getServices(): Service[] {
  try {
    const services = localStorage.getItem('beauty-salon-services')
    return services ? JSON.parse(services) : sampleServices
  } catch (error) {
    console.error('[DEBUG] getServices エラー:', error)
    return sampleServices
  }
}

export function saveServices(services: Service[]): void {
  try {
    localStorage.setItem('beauty-salon-services', JSON.stringify(services))
    console.log('[DEBUG] サービスデータ保存完了:', services)
  } catch (error) {
    console.error('[DEBUG] saveServices エラー:', error)
  }
}

export function getActiveServices(): Service[] {
  return getServices().filter(s => s.isActive)
}

// 予約可能性チェック機能
export function isReservationAvailable(
  staffId: string, 
  date: string, 
  startTime: string, 
  endTime: string
): boolean {
  // 1. スタッフのシフト確認
  const shifts = getShifts()
  const staffShift = shifts.find(s => 
    s.staffId === staffId && 
    s.date === date && 
    s.status === '承認済み'
  )
  
  if (!staffShift) {
    console.log('[DEBUG] スタッフのシフトが見つからないか未承認です')
    return false
  }
  
  // 2. 時間帯がシフト時間内かチェック
  const shiftStart = new Date(`${date}T${staffShift.startTime}:00`)
  const shiftEnd = new Date(`${date}T${staffShift.endTime}:00`)
  const reservationStart = new Date(`${date}T${startTime}:00`)
  const reservationEnd = new Date(`${date}T${endTime}:00`)
  
  if (reservationStart < shiftStart || reservationEnd > shiftEnd) {
    console.log('[DEBUG] 予約時間がシフト時間外です')
    return false
  }
  
  // 3. 既存予約との重複チェック
  const reservations = getReservations()
  const conflictingReservation = reservations.find(r => 
    r.staffId === staffId && 
    r.date === date && 
    r.status !== 'キャンセル' &&
    (
      (reservationStart >= new Date(`${date}T${r.startTime}:00`) && 
       reservationStart < new Date(`${date}T${r.endTime}:00`)) ||
      (reservationEnd > new Date(`${date}T${r.startTime}:00`) && 
       reservationEnd <= new Date(`${date}T${r.endTime}:00`)) ||
      (reservationStart <= new Date(`${date}T${r.startTime}:00`) && 
       reservationEnd >= new Date(`${date}T${r.endTime}:00`))
    )
  )
  
  if (conflictingReservation) {
    console.log('[DEBUG] 既存の予約と重複しています')
    return false
  }
  
  return true
}

// 予約申請機能
export function createReservation(reservationData: {
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceId: string
  staffId: string
  date: string
  startTime: string
  notes?: string
}): Reservation {
  const service = getServices().find(s => s.id === reservationData.serviceId)
  if (!service) {
    throw new Error('指定されたサービスが見つかりません')
  }
  
  const staff = getStaff().find(s => s.id === reservationData.staffId)
  if (!staff) {
    throw new Error('指定されたスタッフが見つかりません')
  }
  
  // 終了時間を計算
  const startDate = new Date(`${reservationData.date}T${reservationData.startTime}:00`)
  const endDate = new Date(startDate.getTime() + service.duration * 60000)
  const endTime = endDate.toTimeString().slice(0, 5)
  
  // 予約可能性チェック
  if (!isReservationAvailable(reservationData.staffId, reservationData.date, reservationData.startTime, endTime)) {
    throw new Error('この時間帯は予約できません')
  }
  
  const newReservation: Reservation = {
    id: generateId(),
    customerName: reservationData.customerName,
    customerPhone: reservationData.customerPhone,
    customerEmail: reservationData.customerEmail,
    date: reservationData.date,
    startTime: reservationData.startTime,
    endTime: endTime,
    service: service.name,
    staffId: reservationData.staffId,
    staffName: staff.name,
    status: '未確認',
    price: service.price,
    notes: reservationData.notes,
    createdAt: new Date().toISOString()
  }
  
  const reservations = getReservations()
  reservations.push(newReservation)
  saveReservations(reservations)
  
  console.log('[DEBUG] 予約作成完了:', newReservation)
  return newReservation
}

// 予約者の予約一覧取得
export function getCustomerReservations(customerId: string): Reservation[] {
  const reservations = getReservations()
  const users = getUsers()
  const customer = users.find(u => u.id === customerId)
  
  if (!customer) return []
  
  return reservations.filter(r => 
    r.customerEmail === customer.email || 
    r.customerPhone === customer.phone
  )
}

// 予約承認・否認機能
export function updateReservationStatus(
  reservationId: string, 
  status: 'confirmed' | 'rejected' | 'completed' | 'cancelled',
  adminUser: User
): boolean {
  const reservations = getReservations()
  const reservationIndex = reservations.findIndex(r => r.id === reservationId)
  
  if (reservationIndex === -1) {
    console.error('[DEBUG] 予約が見つかりません:', reservationId)
    return false
  }
  
  const reservation = reservations[reservationIndex]
  const oldStatus = reservation.status
  
  // ステータス変換
  const statusMap = {
    'confirmed': '確認済み',
    'rejected': 'キャンセル',
    'completed': '完了',
    'cancelled': 'キャンセル'
  }
  
  reservations[reservationIndex].status = statusMap[status] as any
  saveReservations(reservations)
  
  // 予約者に通知
  const users = getUsers()
  const customer = users.find(u => 
    u.email === reservation.customerEmail || 
    u.phone === reservation.customerPhone
  )
  
  if (customer) {
    const message = status === 'confirmed' 
      ? `${reservation.date} ${reservation.startTime}からの予約が承認されました。`
      : `${reservation.date} ${reservation.startTime}からの予約がキャンセルされました。`
    
    createNotification({
      userId: customer.id,
      type: 'general',
      title: '予約の状況が更新されました',
      message: message,
      isRead: false
    })
  }
  
  console.log('[DEBUG] 予約ステータス更新:', { reservationId, oldStatus, newStatus: statusMap[status] })
  return true
}

// =================
// AI自動シフト作成システム関連関数
// =================

// 従業員の希望提出関連
export function getShiftRequests(): ShiftRequest[] {
  try {
    const data = localStorage.getItem('beauty-salon-shift-requests')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[DEBUG] getShiftRequests エラー:', error)
    return []
  }
}

export function saveShiftRequests(requests: ShiftRequest[]): void {
  try {
    localStorage.setItem('beauty-salon-shift-requests', JSON.stringify(requests))
    console.log('[DEBUG] シフト希望保存:', requests.length, '件')
  } catch (error) {
    console.error('[DEBUG] saveShiftRequests エラー:', error)
  }
}

export function createShiftRequest(requestData: Omit<ShiftRequest, 'id' | 'submittedAt'>): ShiftRequest {
  const newRequest: ShiftRequest = {
    id: generateId(),
    ...requestData,
    submittedAt: new Date().toISOString()
  }
  
  const requests = getShiftRequests()
  
  // 同じスタッフ・同じ月の既存申請があれば上書き
  const existingIndex = requests.findIndex(r => 
    r.staffId === requestData.staffId && r.month === requestData.month
  )
  
  if (existingIndex !== -1) {
    requests[existingIndex] = newRequest
  } else {
    requests.push(newRequest)
  }
  
  saveShiftRequests(requests)
  return newRequest
}

export function getStaffShiftRequest(staffId: string, month: string): ShiftRequest | null {
  const requests = getShiftRequests()
  return requests.find(r => r.staffId === staffId && r.month === month) || null
}

export function updateShiftRequestStatus(requestId: string, status: '承認済み' | '却下'): boolean {
  const requests = getShiftRequests()
  const requestIndex = requests.findIndex(r => r.id === requestId)
  
  if (requestIndex === -1) return false
  
  requests[requestIndex].status = status
  requests[requestIndex].updatedAt = new Date().toISOString()
  saveShiftRequests(requests)
  
  return true
}

// シフト条件設定関連
export function getShiftConditions(): ShiftConditions[] {
  try {
    const data = localStorage.getItem('beauty-salon-shift-conditions')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[DEBUG] getShiftConditions エラー:', error)
    return []
  }
}

export function saveShiftConditions(conditions: ShiftConditions[]): void {
  try {
    localStorage.setItem('beauty-salon-shift-conditions', JSON.stringify(conditions))
    console.log('[DEBUG] シフト条件保存:', conditions.length, '件')
  } catch (error) {
    console.error('[DEBUG] saveShiftConditions エラー:', error)
  }
}

export function createShiftConditions(conditionsData: Omit<ShiftConditions, 'id' | 'createdAt'>): ShiftConditions {
  const newConditions: ShiftConditions = {
    id: generateId(),
    ...conditionsData,
    createdAt: new Date().toISOString()
  }
  
  const conditions = getShiftConditions()
  
  // 同じ月の既存条件があれば上書き
  const existingIndex = conditions.findIndex(c => c.month === conditionsData.month && c.isActive)
  
  if (existingIndex !== -1) {
    conditions[existingIndex].isActive = false // 既存を無効化
  }
  
  conditions.push(newConditions)
  saveShiftConditions(conditions)
  return newConditions
}

export function getActiveShiftConditions(month: string): ShiftConditions | null {
  const conditions = getShiftConditions()
  return conditions.find(c => c.month === month && c.isActive) || null
}

// デフォルトの労働基準法設定
export function getDefaultLaborStandards(): LaborStandards {
  return {
    maxConsecutiveWorkDays: 6,
    maxWorkHoursPerDay: 8,
    maxWorkHoursPerWeek: 40,
    maxWorkHoursPerMonth: 160,
    minimumRestDaysPerWeek: 1,
    nightWorkStartTime: '22:00',
    nightWorkEndTime: '05:00',
    overtimeThresholdHours: 8
  }
}

// AI生成シフト関連
export function getGeneratedShifts(): GeneratedShift[] {
  try {
    const data = localStorage.getItem('beauty-salon-generated-shifts')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[DEBUG] getGeneratedShifts エラー:', error)
    return []
  }
}

export function saveGeneratedShifts(generatedShifts: GeneratedShift[]): void {
  try {
    localStorage.setItem('beauty-salon-generated-shifts', JSON.stringify(generatedShifts))
    console.log('[DEBUG] 生成シフト保存:', generatedShifts.length, '件')
  } catch (error) {
    console.error('[DEBUG] saveGeneratedShifts エラー:', error)
  }
}

// 労働基準法チェック関数
export function checkLaborViolations(shifts: Shift[], laborStandards: LaborStandards): LaborViolation[] {
  const violations: LaborViolation[] = []
  const staff = getStaff()
  
  // スタッフごとにチェック
  staff.forEach(staffMember => {
    const staffShifts = shifts
      .filter(s => s.staffId === staffMember.id && s.status === '承認済み')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // 連続勤務日数チェック
    let consecutiveDays = 0
    let lastDate = ''
    
    staffShifts.forEach(shift => {
      const currentDate = new Date(shift.date)
      const lastDateTime = lastDate ? new Date(lastDate).getTime() : 0
      const currentDateTime = currentDate.getTime()
      
      // 連続日かチェック
      if (lastDateTime && currentDateTime - lastDateTime === 24 * 60 * 60 * 1000) {
        consecutiveDays++
      } else {
        consecutiveDays = 1
      }
      
      // 最大連続勤務日数超過チェック
      if (consecutiveDays > laborStandards.maxConsecutiveWorkDays) {
        violations.push({
          type: 'consecutive_work_days',
          severity: 'error',
          staffId: staffMember.id,
          staffName: staffMember.name,
          date: shift.date,
          details: `連続勤務${consecutiveDays}日目（上限${laborStandards.maxConsecutiveWorkDays}日）`,
          suggestion: '休日を設けることをお勧めします'
        })
      }
      
      // 1日の労働時間チェック
      const workHours = calculateDailyWorkHours(shift)
      if (workHours > laborStandards.maxWorkHoursPerDay) {
        violations.push({
          type: 'daily_hours',
          severity: workHours > laborStandards.maxWorkHoursPerDay + 2 ? 'critical' : 'warning',
          staffId: staffMember.id,
          staffName: staffMember.name,
          date: shift.date,
          details: `1日労働時間${workHours}時間（上限${laborStandards.maxWorkHoursPerDay}時間）`,
          suggestion: '労働時間を短縮するか、別日に調整してください'
        })
      }
      
      // 深夜労働チェック
      if (isNightWork(shift, laborStandards)) {
        violations.push({
          type: 'night_work',
          severity: 'warning',
          staffId: staffMember.id,
          staffName: staffMember.name,
          date: shift.date,
          details: `深夜労働時間帯（${laborStandards.nightWorkStartTime}-${laborStandards.nightWorkEndTime}）`,
          suggestion: '深夜労働には特別な配慮が必要です'
        })
      }
      
      lastDate = shift.date
    })
    
    // 月間労働時間チェック
    const monthlyHours = staffShifts.reduce((total, shift) => total + calculateDailyWorkHours(shift), 0)
    if (monthlyHours > laborStandards.maxWorkHoursPerMonth) {
      violations.push({
        type: 'monthly_hours',
        severity: 'error',
        staffId: staffMember.id,
        staffName: staffMember.name,
        details: `月間労働時間${monthlyHours}時間（上限${laborStandards.maxWorkHoursPerMonth}時間）`,
        suggestion: '月間労働時間を調整してください'
      })
    }
  })
  
  return violations
}

// 1日の労働時間計算
function calculateDailyWorkHours(shift: Shift): number {
  const startTime = new Date(`2000-01-01T${shift.startTime}:00`)
  const endTime = new Date(`2000-01-01T${shift.endTime}:00`)
  const breakDuration = shift.breakDuration || 60 // デフォルト60分
  
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  const workMinutes = totalMinutes - breakDuration
  
  return workMinutes / 60
}

// 深夜労働チェック
function isNightWork(shift: Shift, laborStandards: LaborStandards): boolean {
  const nightStart = new Date(`2000-01-01T${laborStandards.nightWorkStartTime}:00`)
  const nightEnd = new Date(`2000-01-02T${laborStandards.nightWorkEndTime}:00`) // 翌日
  const shiftStart = new Date(`2000-01-01T${shift.startTime}:00`)
  const shiftEnd = new Date(`2000-01-01T${shift.endTime}:00`)
  
  // シフトが深夜時間帯と重複するかチェック
  return (shiftStart <= nightEnd && shiftEnd >= nightStart) ||
         (shiftStart >= nightStart || shiftEnd <= nightEnd)
}

// 希望締切日計算
export function calculateDeadlineDate(month: string, deadlineDaysBefore: number): string {
  const [year, monthNum] = month.split('-').map(Number)
  const lastDayOfMonth = new Date(year, monthNum, 0).getDate()
  const deadlineDate = new Date(year, monthNum - 1, lastDayOfMonth - deadlineDaysBefore)
  
  return deadlineDate.toISOString().split('T')[0]
}

// 希望締切チェック
export function isAfterDeadline(month: string, deadlineDaysBefore: number): boolean {
  const deadlineDate = calculateDeadlineDate(month, deadlineDaysBefore)
  const today = new Date().toISOString().split('T')[0]
  
  return today > deadlineDate
}

// =================
// AI自動シフト作成アルゴリズム
// =================

export function generateAutoShift(month: string): GeneratedShift | null {
  console.log('[DEBUG] AI自動シフト作成開始:', month)
  
  // 1. 条件設定の取得
  const conditions = getActiveShiftConditions(month)
  if (!conditions) {
    console.error('[DEBUG] シフト条件が設定されていません')
    return null
  }
  
  // 2. スタッフ情報と希望の取得
  const staff = getStaff().filter(s => s.isActive)
  const shiftRequests = getShiftRequests().filter(r => r.month === month && r.status === '承認済み')
  const shiftTemplates = getActiveShiftTemplates()
  
  // 3. 月の日付リストを作成
  const dates = generateMonthDates(month)
  
  // 4. 各日付にシフトを割り当て
  const generatedShifts: Shift[] = []
  let score = 100 // 初期スコア
  
  for (const date of dates) {
    const dayOfWeek = new Date(date).getDay()
    
    // 定休日・特別休業日チェック
    if (conditions.regularHolidays.includes(dayOfWeek.toString()) ||
        conditions.specialHolidays.includes(date)) {
      continue
    }
    
    // その日に出勤可能なスタッフを選出
    const availableStaff = getAvailableStaff(staff, date, shiftRequests, conditions, generatedShifts)
    
    // 必要人数チェック
    const requiredStaff = calculateRequiredStaff(conditions, availableStaff.length)
    
    if (availableStaff.length < requiredStaff) {
      console.warn(`[DEBUG] ${date}: 必要人数${requiredStaff}人に対し、出勤可能${availableStaff.length}人`)
      score -= 10 // スコア減点
    }
    
    // スタッフを選出して配置
    const selectedStaff = selectOptimalStaff(availableStaff, requiredStaff, date, generatedShifts, conditions)
    
    // シフトを生成
    for (const staffMember of selectedStaff) {
      const shift = createShiftForStaff(staffMember, date, conditions, shiftTemplates)
      if (shift) {
        generatedShifts.push(shift)
      }
    }
  }
  
  // 5. 労働基準法チェック
  const violations = checkLaborViolations(generatedShifts, conditions.laborStandards)
  
  // 6. 最終スコア計算
  const finalScore = calculateFinalScore(score, violations, shiftRequests, generatedShifts)
  
  // 7. 生成結果を保存
  const result: GeneratedShift = {
    id: generateId(),
    month,
    shifts: generatedShifts,
    conditionsId: conditions.id,
    generatedAt: new Date().toISOString(),
    isApproved: false,
    violationWarnings: violations,
    score: finalScore
  }
  
  const existingShifts = getGeneratedShifts()
  existingShifts.push(result)
  saveGeneratedShifts(existingShifts)
  
  console.log('[DEBUG] AI自動シフト作成完了:', {
    月: month,
    シフト数: generatedShifts.length,
    スコア: finalScore,
    違反警告数: violations.length
  })
  
  return result
}

// 月の日付リスト生成
function generateMonthDates(month: string): string[] {
  const [year, monthNum] = month.split('-').map(Number)
  const dates: string[] = []
  const lastDay = new Date(year, monthNum, 0).getDate()
  
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, monthNum - 1, day)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

// その日に出勤可能なスタッフを選出
function getAvailableStaff(
  staff: Staff[], 
  date: string, 
  shiftRequests: ShiftRequest[], 
  conditions: ShiftConditions,
  existingShifts: Shift[]
): Staff[] {
  return staff.filter(staffMember => {
    // 1. 休日希望チェック
    const request = shiftRequests.find(r => r.staffId === staffMember.id)
    if (request?.dayOffRequests.includes(date) || request?.paidLeaveRequests.includes(date)) {
      return false
    }
    
    // 2. 個別条件の固定休日チェック
    const specialCondition = conditions.staffSpecialConditions.find(c => c.staffId === staffMember.id)
    if (specialCondition?.fixedOffDays.includes(date)) {
      return false
    }
    
    // 3. 連続勤務日数チェック
    if (isExceedingConsecutiveWorkDays(staffMember.id, date, existingShifts, conditions.laborStandards)) {
      return false
    }
    
    // 4. 月間最大勤務日数チェック
    if (isExceedingMonthlyWorkDays(staffMember.id, date, existingShifts, specialCondition)) {
      return false
    }
    
    return true
  })
}

// 必要人数計算
function calculateRequiredStaff(conditions: ShiftConditions, availableCount: number): number {
  if (conditions.minimumStaffMode === 'minimum_required') {
    return Math.min(conditions.minimumStaffCount || 2, availableCount)
  } else {
    const totalStaff = getStaff().filter(s => s.isActive).length
    const maxAbsent = conditions.maximumAbsentCount || 1
    return Math.max(totalStaff - maxAbsent, 1)
  }
}

// 最適なスタッフ選出
function selectOptimalStaff(
  availableStaff: Staff[], 
  requiredCount: number, 
  date: string, 
  existingShifts: Shift[],
  conditions: ShiftConditions
): Staff[] {
  // スタッフに優先度スコアを付与
  const staffWithScores = availableStaff.map(staff => {
    let priority = 0
    
    // 1. 固定出勤日の場合は最優先
    const specialCondition = conditions.staffSpecialConditions.find(c => c.staffId === staff.id)
    if (specialCondition?.fixedWorkDays.includes(date)) {
      priority += 1000
    }
    
    // 2. 今月の勤務日数が少ない人を優先
    const monthlyWorkDays = getMonthlyWorkDays(staff.id, date, existingShifts)
    priority += (20 - monthlyWorkDays) * 10
    
    // 3. スキルレベルの高い人を優先
    priority += (staff.skillLevel || 1) * 5
    
    // 4. ポジションバランスを考慮
    const dayOfWeek = new Date(date).getDay()
    if (isWeekend(dayOfWeek) && staff.position === 'スタイリスト') {
      priority += 15 // 土日はスタイリスト優先
    }
    
    // 5. 連続勤務を避ける
    if (hasWorkedYesterday(staff.id, date, existingShifts)) {
      priority -= 5
    }
    
    return { staff, priority }
  })
  
  // 優先度順でソートして必要人数分選出
  staffWithScores.sort((a, b) => b.priority - a.priority)
  return staffWithScores.slice(0, requiredCount).map(item => item.staff)
}

// スタッフのシフト作成
function createShiftForStaff(
  staff: Staff, 
  date: string, 
  conditions: ShiftConditions, 
  templates: ShiftTemplate[]
): Shift | null {
  // 個別条件から優先テンプレートを取得
  const specialCondition = conditions.staffSpecialConditions.find(c => c.staffId === staff.id)
  let preferredTemplate: ShiftTemplate | undefined
  
  if (specialCondition?.preferredShiftTemplateIds.length) {
    preferredTemplate = templates.find(t => 
      specialCondition.preferredShiftTemplateIds.includes(t.id)
    )
  }
  
  // デフォルトテンプレート選択
  const template = preferredTemplate || getDefaultTemplateForStaff(staff, templates, date)
  
  if (!template) return null
  
  return {
    id: generateId(),
    staffId: staff.id,
    staffName: staff.name,
    date,
    startTime: template.startTime,
    endTime: template.endTime,
    position: staff.position,
    breakDuration: template.breakDuration,
    templateId: template.id,
    templateName: template.name,
    status: '承認済み',
    createdAt: new Date().toISOString()
  }
}

// ヘルパー関数群
function isExceedingConsecutiveWorkDays(
  staffId: string, 
  date: string, 
  existingShifts: Shift[], 
  laborStandards: LaborStandards
): boolean {
  const staffShifts = existingShifts
    .filter(s => s.staffId === staffId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  let consecutiveDays = 0
  let checkDate = new Date(date)
  checkDate.setDate(checkDate.getDate() - 1)
  
  // 過去に遡って連続勤務日数をカウント
  while (consecutiveDays < laborStandards.maxConsecutiveWorkDays) {
    const checkDateStr = checkDate.toISOString().split('T')[0]
    const hasShift = staffShifts.some(s => s.date === checkDateStr)
    
    if (!hasShift) break
    
    consecutiveDays++
    checkDate.setDate(checkDate.getDate() - 1)
  }
  
  return consecutiveDays >= laborStandards.maxConsecutiveWorkDays
}

function isExceedingMonthlyWorkDays(
  staffId: string, 
  date: string, 
  existingShifts: Shift[], 
  specialCondition?: StaffSpecialCondition
): boolean {
  if (!specialCondition?.maxWorkDaysPerMonth) return false
  
  const monthlyWorkDays = getMonthlyWorkDays(staffId, date, existingShifts)
  return monthlyWorkDays >= specialCondition.maxWorkDaysPerMonth
}

function getMonthlyWorkDays(staffId: string, date: string, existingShifts: Shift[]): number {
  const month = date.substring(0, 7) // YYYY-MM
  return existingShifts.filter(s => 
    s.staffId === staffId && s.date.startsWith(month)
  ).length
}

function hasWorkedYesterday(staffId: string, date: string, existingShifts: Shift[]): boolean {
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  return existingShifts.some(s => s.staffId === staffId && s.date === yesterdayStr)
}

function isWeekend(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6 // 日曜日または土曜日
}

function getDefaultTemplateForStaff(staff: Staff, templates: ShiftTemplate[], date: string): ShiftTemplate | undefined {
  const dayOfWeek = new Date(date).getDay()
  
  // 土日は長時間テンプレート優先
  if (isWeekend(dayOfWeek)) {
    return templates.find(t => t.name.includes('フルタイム')) || templates[0]
  }
  
  // 平日はポジションに応じて
  if (staff.position === 'スタイリスト' || staff.position === 'マネージャー') {
    return templates.find(t => t.name.includes('早番') || t.name.includes('フルタイム')) || templates[0]
  }
  
  return templates[0]
}

function calculateFinalScore(
  baseScore: number, 
  violations: LaborViolation[], 
  requests: ShiftRequest[], 
  generatedShifts: Shift[]
): number {
  let score = baseScore
  
  // 違反に応じて減点
  violations.forEach(violation => {
    switch (violation.severity) {
      case 'critical': score -= 20; break
      case 'error': score -= 10; break
      case 'warning': score -= 5; break
    }
  })
  
  // 希望の実現率でボーナス
  const fulfillmentRate = calculateRequestFulfillmentRate(requests, generatedShifts)
  score += fulfillmentRate * 20
  
  return Math.max(0, Math.min(100, score))
}

function calculateRequestFulfillmentRate(requests: ShiftRequest[], generatedShifts: Shift[]): number {
  let totalRequests = 0
  let fulfilledRequests = 0
  
  requests.forEach(request => {
    const allRequests = [...request.dayOffRequests, ...request.paidLeaveRequests]
    totalRequests += allRequests.length
    
    allRequests.forEach(requestDate => {
      const hasShift = generatedShifts.some(s => 
        s.staffId === request.staffId && s.date === requestDate
      )
      if (!hasShift) {
        fulfilledRequests++
      }
    })
  })
  
  return totalRequests > 0 ? fulfilledRequests / totalRequests : 1
}

// 生成されたシフトを本シフトとして承認
export function approveGeneratedShift(generatedShiftId: string, adminUserId: string): boolean {
  const generatedShifts = getGeneratedShifts()
  const generatedShift = generatedShifts.find(g => g.id === generatedShiftId)
  
  if (!generatedShift) return false
  
  // 既存のシフトをクリア（同月分）
  const existingShifts = getShifts()
  const otherShifts = existingShifts.filter(s => !s.date.startsWith(generatedShift.month))
  
  // 生成されたシフトを追加
  const newShifts = [...otherShifts, ...generatedShift.shifts]
  saveShifts(newShifts)
  
  // 承認フラグを更新
  generatedShift.isApproved = true
  generatedShift.approvedAt = new Date().toISOString()
  generatedShift.approvedBy = adminUserId
  
  saveGeneratedShifts(generatedShifts)
  
  return true
}

export function resetAllData(): void {
  console.log('[DEBUG] 全データをリセット中...')
  localStorage.removeItem('beauty-salon-users')
  localStorage.removeItem('beauty-salon-staff')
  localStorage.removeItem('beauty-salon-shifts')
  localStorage.removeItem('beauty-salon-shift-templates')
  localStorage.removeItem('beauty-salon-reservations')
  localStorage.removeItem('beauty-salon-services')
  localStorage.removeItem('beauty-salon-settings')
  localStorage.removeItem('beauty-salon-notifications')
  // AI自動シフト作成システム関連のデータ
  localStorage.removeItem('beauty-salon-shift-requests')
  localStorage.removeItem('beauty-salon-shift-conditions')
  localStorage.removeItem('beauty-salon-generated-shifts')
  localStorage.removeItem('auth_user')
  console.log('[DEBUG] データリセット完了')
}


// ================================================
// ダッシュボード統計機能
// ================================================

export function getShiftStats() {
  try {
    const shifts = getShifts()
    const today = new Date().toISOString().split('T')[0]
    
    return {
      total: shifts.length,
      approved: shifts.filter(s => s.status === '承認済み').length,
      pending: shifts.filter(s => s.status === '申請中').length,
      rejected: shifts.filter(s => s.status === '却下').length,
      today: shifts.filter(s => s.date === today && s.status === '承認済み').length
    }
  } catch (error) {
    console.error('getShiftStats error:', error)
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      today: 0
    }
  }
}

export function getReservationStats() {
  try {
    const reservations = getReservations()
    const today = new Date().toISOString().split('T')[0]
    
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === '確認済み').length,
      pending: reservations.filter(r => r.status === '未確認').length,
      cancelled: reservations.filter(r => r.status === 'キャンセル').length,
      completed: reservations.filter(r => r.status === '完了').length,
      today: reservations.filter(r => r.date === today).length
    }
  } catch (error) {
    console.error('getReservationStats error:', error)
    return {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      completed: 0,
      today: 0
    }
  }
}

export function getTodayShifts() {
  try {
    const shifts = getShifts()
    const today = new Date().toISOString().split('T')[0]
    return shifts.filter(s => s.date === today && s.status === '承認済み')
  } catch (error) {
    console.error('getTodayShifts error:', error)
    return []
  }
}

export function getTodayReservations() {
  try {
    const reservations = getReservations()
    const today = new Date().toISOString().split('T')[0]
    return reservations.filter(r => r.date === today)
  } catch (error) {
    console.error('getTodayReservations error:', error)
    return []
  }
}