// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10"></div>
      
      {/* ヘッダー */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center backdrop-blur-sm bg-white/70 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">✂</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">美容室シフト管理システム</h1>
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="text-slate-600 hover:text-purple-600 font-medium transition-colors duration-200">
            ログイン
          </Link>
          <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
            予約者登録
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-24">
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight tracking-tight">
              美容室の<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-gradient-x">
                シフト・予約管理を
              </span><br />
              <span className="text-slate-700">スマートに</span>
            </h2>
          </div>
          
          <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
            従業員のシフト申請から管理者の承認、お客様の予約申請まで、<br />
            美容室の運営を効率化する統合管理システムです。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link 
              href="/login" 
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 flex items-center space-x-2"
            >
              <span>ログインして開始</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              href="/signup" 
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-800 px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/50 hover:border-white/80 hover:scale-105"
            >
              予約者として登録
            </Link>
          </div>
        </div>

        {/* 主要機能セクション */}
        <section className="text-center mb-24">
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">主要機能</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">3つの権限で美容室運営を完全サポート</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 管理者機能 */}
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-white/40 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-4">管理者機能</h4>
              <ul className="text-slate-600 space-y-2 text-left">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mt-2"></div>
                  <span>スタッフ・予約の管理、スケジュール設定</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mt-2"></div>
                  <span>シフト全体の見える化と承認</span>
                </li>
              </ul>
            </div>

            {/* 従業員機能 */}
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-white/40 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-4">従業員機能</h4>
              <ul className="text-slate-600 space-y-2 text-left">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mt-2"></div>
                  <span>希望シフト申請、チーム全体のシフト確認</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mt-2"></div>
                  <span>通知の受信と共有</span>
                </li>
              </ul>
            </div>

            {/* 予約者機能 */}
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-white/40 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-4">予約者機能</h4>
              <ul className="text-slate-600 space-y-2 text-left">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mt-2"></div>
                  <span>サービス選択、日時者名などによる予約</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mt-2"></div>
                  <span>予約履歴の参照とキャンセル</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* デモアカウントセクション */}
        <section className="text-center mb-24">
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">デモアカウント</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">以下のアカウントでシステムをお試しいただけます</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 管理者アカウント */}
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-red-200 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">管理者アカウント</h4>
              <p className="text-slate-600 mb-6 font-mono text-xs bg-slate-100 px-3 py-2 rounded-lg">admin@demo.com</p>
              <Link 
                href="/login?demo=admin"
                className="inline-block bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                管理者でログイン
              </Link>
            </div>

            {/* 従業員アカウント */}
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-purple-200 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">従業員アカウント</h4>
              <p className="text-slate-600 mb-6 font-mono text-xs bg-slate-100 px-3 py-2 rounded-lg">staff@demo.com</p>
              <Link 
                href="/login?demo=employee"
                className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                従業員でログイン
              </Link>
            </div>

            {/* 予約者アカウント */}
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-emerald-200 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">予約者アカウント</h4>
              <p className="text-slate-600 mb-6 font-mono text-xs bg-slate-100 px-3 py-2 rounded-lg">customer@demo.com</p>
              <Link 
                href="/login?demo=customer"
                className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                予約者でログイン
              </Link>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="text-center">
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30">
            <h3 className="text-2xl font-bold text-slate-800 mb-8">なぜ選ばれるのか</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">効率化</h4>
                <p className="text-slate-600 leading-relaxed">AIによる自動シフト作成で管理時間を90%削減</p>
              </div>
              <div className="group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📱</div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">使いやすさ</h4>
                <p className="text-slate-600 leading-relaxed">直感的なUIでPC初心者でも簡単操作</p>
              </div>
              <div className="group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💰</div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">コスト削減</h4>
                <p className="text-slate-600 leading-relaxed">月額4,980円で全機能利用可能</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="relative z-10 bg-slate-900/90 backdrop-blur-lg text-white py-12 mt-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">✂</span>
            </div>
            <span className="text-xl font-bold">美容室シフト管理システム</span>
          </div>
          <p className="text-slate-400 mb-6">美容室の運営を効率化する統合管理システム</p>
          <div className="flex justify-center space-x-8">
            <Link href="/faq" className="text-slate-400 hover:text-white transition-colors duration-200">よくある質問</Link>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors duration-200">ログイン</Link>
            <Link href="/signup" className="text-slate-400 hover:text-white transition-colors duration-200">新規登録</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
