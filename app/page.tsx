// app/page.tsx
import Link from 'next/link'

export default function Home() {
  const shifts = [
    { date: '2025-01-20', name: '田中さん', position: 'スタイリスト', time: '09:00-18:00' },
    { date: '2025-01-20', name: '山田さん', position: 'アシスタント', time: '10:00-19:00' },
    { date: '2025-01-20', name: '佐藤さん', position: '受付', time: '09:30-18:30' },
    { date: '2025-01-21', name: '鈴木さん', position: 'スタイリスト', time: '10:00-19:00' },
    { date: '2025-01-21', name: '田中さん', position: 'スタイリスト', time: '09:00-17:00' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">美容室シフト管理システムへようこそ</h1>
            <p className="text-gray-600">
              美容室・サロン向けに特化したシフト管理システムです。スタイリスト、アシスタント、受付スタッフのシフト申請・承認・管理が簡単に行えます。
            </p>
          </div>
          <nav className="space-x-4">
            <Link href="/faq" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 font-semibold">
              よくある質問
            </Link>
          </nav>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">今週のシフト表</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">日付</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">スタッフ名</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">ポジション</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">勤務時間</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">{shift.date}</td>
                    <td className="border border-gray-300 px-4 py-3 font-medium">{shift.name}</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shift.position === 'スタイリスト' ? 'bg-purple-100 text-purple-800' :
                        shift.position === 'アシスタント' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {shift.position}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">{shift.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">シンプルな料金体系</h3>
            <p className="text-gray-600 mb-4">買い切り版49,800円または月額4,980円で全機能が利用可能です。</p>
            <Link href="/faq" className="text-blue-600 hover:text-blue-800 font-medium">詳細を見る →</Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">美容室特化機能</h3>
            <p className="text-gray-600 mb-4">指名予約対応、技術レベル管理、売上連動機能を搭載しています。</p>
            <Link href="/faq" className="text-blue-600 hover:text-blue-800 font-medium">機能一覧 →</Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">無料試用期間</h3>
            <p className="text-gray-600 mb-4">2週間の無料試用で全機能をお試しいただけます。</p>
            <div className="space-y-2">
              <Link href="/signup" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 inline-block text-center w-full">
                管理者向け無料トライアル
              </Link>
              <Link href="/signup/employee" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 inline-block text-center w-full">
                従業員アカウント作成
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              従業員の方は「従業員アカウント作成」からアカウントを作成してシフト申請が可能です
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
