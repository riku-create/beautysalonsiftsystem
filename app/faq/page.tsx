'use client'

export default function FAQ() {
  const faqData = [
    {
      category: "基本機能について",
      items: [
        {
          question: "美容室向けのシフト管理システムにはどのような機能がありますか？",
          answer: "月間・週間・日別カレンダー表示、シフト申請・承認機能、ドラッグ&ドロップによるシフト移動、スタイリスト・アシスタント・受付スタッフ管理、指名予約対応、技術レベル管理、労働基準法チェック機能などを提供しています。"
        },
        {
          question: "スタイリスト、アシスタント、受付で管理を分けることはできますか？",
          answer: "はい。ポジション別の権限管理や、技術レベルに応じたシフト割り当て機能を搭載しています。指名予約にも対応しており、美容室運営に必要な機能を網羅しています。"
        },
        {
          question: "スマートフォンでも利用できますか？",
          answer: "はい。スマートフォンファーストデザインを採用しており、どのデバイスからでも快適にご利用いただけます。外出先からでもシフト確認・申請が可能です。"
        }
      ]
    },
    {
      category: "料金・プランについて",
      items: [
        {
          question: "料金プランはどのようになっていますか？",
          answer: "現在、買い切り版（49,800円税込）をご提供しています。月額プラン（月額4,980円）は準備中で、将来的に提供予定です。買い切り版では全機能が永続的にご利用いただけます。"
        },
        {
          question: "従業員数に制限はありますか？",
          answer: "どちらのプランも従業員数の制限はありません。小規模サロンから大型店舗まで対応可能です。追加料金は一切ありません。"
        },
        {
          question: "月額プランはいつから利用できますか？",
          answer: "月額プランは現在システム準備中です。ご希望の方は事前にお問い合わせいただければ、提供開始時にご連絡いたします。"
        },
        {
          question: "買い切り版のメリットは何ですか？",
          answer: "一度ご購入いただければ、追加料金なしで永続的に全機能をご利用いただけます。また、今後のアップデートも無料で提供いたします。"
        },
        {
          question: "無料試用期間はありますか？",
          answer: "はい、2週間の無料試用期間をご用意しています。全機能をお試しいただけます。"
        }
      ]
    },
    {
      category: "導入・設定について",
      items: [
        {
          question: "導入にはどのくらい時間がかかりますか？",
          answer: "基本設定であれば即日から利用開始可能です。スタイリスト・アシスタント・受付スタッフの情報登録や詳細設定を含めても1-2日程度で完了します。"
        },
        {
          question: "既存のシフト情報を移行できますか？",
          answer: "はい。Excel形式やCSV形式のデータから簡単にインポートできる機能をご用意しています。"
        },
        {
          question: "初期設定のサポートはありますか？",
          answer: "導入時には専任スタッフがリモートでサポートいたします。画面共有によるセットアップ支援も可能です。"
        }
      ]
    },
    {
      category: "美容室業界特化機能",
      items: [
        {
          question: "指名予約への対応はできますか？",
          answer: "はい。お客様の指名予約に合わせたシフト調整機能を搭載しています。スタイリスト別の予約状況とシフトを連動させることが可能です。"
        },
        {
          question: "技術レベルに応じた管理はできますか？",
          answer: "スタイリスト、アシスタント、受付のポジション別管理に加え、個人の技術レベルや経験年数に応じたシフト割り当て機能をご利用いただけます。"
        },
        {
          question: "売上との連動は可能ですか？",
          answer: "売上実績とシフトデータを連動させ、効率的な人員配置の分析が可能です。繁忙時間帯の把握と最適なスタッフ配置に活用できます。"
        },
        {
          question: "複数店舗での利用は可能ですか？",
          answer: "はい。店舗ごとの権限管理や、店舗間でのスタッフ移動にも対応しています。チェーン展開されている美容室様にもおすすめです。"
        }
      ]
    },
    {
      category: "セキュリティ・法規制について",
      items: [
        {
          question: "データのセキュリティは大丈夫ですか？",
          answer: "SSL暗号化通信、定期的なバックアップ、アクセス権限管理など、個人情報保護に配慮したセキュリティ対策を実施しています。"
        },
        {
          question: "労働基準法への対応はできますか？",
          answer: "はい。36協定チェック、連続勤務制限、休憩時間管理など、労働基準法に準拠したアラート機能を搭載しています。"
        },
        {
          question: "個人情報の管理は適切ですか？",
          answer: "スタッフの個人情報は適切に管理され、必要な権限を持つ管理者のみがアクセス可能です。プライバシー保護を徹底しています。"
        }
      ]
    },
    {
      category: "操作・使い方について",
      items: [
        {
          question: "管理者とスタッフで画面は分かれていますか？",
          answer: "はい。管理者用の承認ダッシュボードとスタッフ用の申請画面を分けており、それぞれの役割に最適化されています。"
        },
        {
          question: "シフト申請の承認フローはどうなっていますか？",
          answer: "スタッフがシフト申請→管理者が確認・承認→確定という流れです。承認待ち、承認済み、却下のステータス管理も可能です。"
        },
        {
          question: "一括でシフトを作成できますか？",
          answer: "はい。テンプレート機能や一括作成機能により、効率的なシフト作成が可能です。定期的なシフトパターンの設定も簡単です。"
        },
        {
          question: "通知機能はありますか？",
          answer: "シフト申請、承認、変更時にメール通知やシステム内通知でお知らせします。通知設定は個別にカスタマイズ可能です。"
        }
      ]
    },
    {
      category: "サポート・その他",
      items: [
        {
          question: "操作方法がわからない場合のサポートはありますか？",
          answer: "メール、電話、チャットでのサポートを提供しています。平日9:00-18:00の対応となります。"
        },
        {
          question: "システムの更新やバージョンアップはありますか？",
          answer: "定期的に機能追加やセキュリティアップデートを行っており、買い切り版・月額版どちらのご契約者様にも無料で提供いたします。"
        },
        {
          question: "契約の解約はいつでもできますか？",
          answer: "月額プランは1ヶ月前の事前通知で解約可能です。違約金等は一切ありません。買い切り版は永続ライセンスとなります。"
        },
        {
          question: "データのバックアップは取られていますか？",
          answer: "はい。定期的な自動バックアップを実施しており、万が一の際もデータ復旧が可能です。安心してご利用ください。"
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ナビゲーション */}
        <div className="mb-6">
          <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← ホームに戻る
          </a>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">よくある質問</h1>
          <p className="text-gray-600 text-lg">
            美容室シフト管理システムについて、お客様からよくいただくご質問をまとめました
          </p>
        </div>

        {/* FAQ セクション */}
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6 border-b-2 border-blue-100 pb-2">
              {category.category}
            </h2>
            
            <div className="space-y-6">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-start">
                    <span className="bg-blue-500 text-white rounded-full text-sm px-2 py-1 mr-3 mt-0.5 flex-shrink-0">
                      Q
                    </span>
                    {item.question}
                  </h3>
                  <div className="ml-8">
                    <p className="text-gray-700 leading-relaxed flex items-start">
                      <span className="bg-green-500 text-white rounded-full text-sm px-2 py-1 mr-3 mt-0.5 flex-shrink-0">
                        A
                      </span>
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* お問い合わせセクション */}
        <div className="bg-white rounded-lg p-8 text-center mt-12 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            その他のご質問がございましたら
          </h2>
          <p className="text-gray-600 mb-6">
            上記以外のご質問やご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="space-y-3 mb-6">
            <div className="text-gray-700">
              <strong>メール:</strong> support@beauty-shift.com
            </div>
            <div className="text-gray-700">
              <strong>電話:</strong> 03-XXXX-XXXX (平日 9:00-18:00)
            </div>
            <div className="text-gray-700">
              <strong>チャット:</strong> システム内チャット機能をご利用ください
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200">
              お問い合わせフォームへ
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200">
              無料試用を開始
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 