// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* ヘッダー */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">✂</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">美容室シフト管理システム</h1>
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="text-gray-700 hover:text-purple-600 font-medium">
            ログイン
          </Link>
          <Link href="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
            予約者登録
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            美容室の<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              シフト・予約管理を
            </span><br />
            スマートに
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            従業員のシフト申請から管理者の承認、お客様の予約申請まで、<br />
            美容室の運営を効率化する統合管理システムです。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center"
            >
              ログインして開始 →
            </Link>
            <Link 
              href="/signup" 
              className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl border border-gray-200"
            >
              予約者として登録
            </Link>
          </div>
        </div>

        {/* 主要機能セクション */}
        <section className="text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">主要機能</h3>
          <p className="text-lg text-gray-600 mb-12">3つの権限で美容室運営を完全サポート</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* 管理者機能 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">👨‍💼</span>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">管理者</h4>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• スタッフシフト管理・承認</li>
                <li>• 予約管理・顧客対応</li>
                <li>• 売上分析・レポート</li>
                <li>• シフトテンプレート作成</li>
                <li>• AI自動シフト作成</li>
              </ul>
            </div>

            {/* スタッフ機能 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">✂️</span>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">スタッフ</h4>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• シフト希望申請</li>
                <li>• 有給休暇申請</li>
                <li>• シフト確認・変更</li>
                <li>• 売上実績確認</li>
                <li>• 通知・メッセージ</li>
              </ul>
            </div>

            {/* 顧客機能 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">顧客</h4>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• オンライン予約</li>
                <li>• スタイリスト指名</li>
                <li>• 予約履歴確認</li>
                <li>• メニュー・料金確認</li>
                <li>• キャンセル・変更</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="mt-20 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">なぜ選ばれるのか</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="font-bold text-gray-800 mb-2">効率化</h4>
                <p className="text-gray-600">AIによる自動シフト作成で管理時間を90%削減</p>
              </div>
              <div>
                <div className="text-4xl mb-4">📱</div>
                <h4 className="font-bold text-gray-800 mb-2">使いやすさ</h4>
                <p className="text-gray-600">直感的なUIでPC初心者でも簡単操作</p>
              </div>
              <div>
                <div className="text-4xl mb-4">💰</div>
                <h4 className="font-bold text-gray-800 mb-2">コスト削減</h4>
                <p className="text-gray-600">月額4,980円で全機能利用可能</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✂</span>
            </div>
            <span className="text-xl font-bold">美容室シフト管理システム</span>
          </div>
          <p className="text-gray-400 mb-6">美容室の運営を効率化する統合管理システム</p>
          <div className="flex justify-center space-x-8">
            <Link href="/faq" className="text-gray-400 hover:text-white">よくある質問</Link>
            <Link href="/login" className="text-gray-400 hover:text-white">ログイン</Link>
            <Link href="/signup" className="text-gray-400 hover:text-white">新規登録</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
