#!/bin/bash

echo "===================================="
echo "    美容室シフト管理システム"
echo "===================================="
echo ""
echo "システムを起動しています..."
echo ""

# Node.jsがインストールされているかチェック
if ! command -v node &> /dev/null; then
    echo "エラー: Node.jsがインストールされていません"
    echo "https://nodejs.org からダウンロードしてください"
    echo ""
    read -p "Enterキーで終了..."
    exit 1
fi

# 必要なパッケージがあるかチェック
if [ ! -d "node_modules" ]; then
    echo "初回起動: 必要なファイルをダウンロードしています..."
    npm install
    if [ $? -ne 0 ]; then
        echo "エラー: インストールに失敗しました"
        read -p "Enterキーで終了..."
        exit 1
    fi
fi

echo "システムを起動中..."
echo ""
echo "ブラウザで以下のURLを開いてください:"
echo "http://localhost:3000"
echo ""
echo "停止するには Ctrl+C を押してください"
echo ""

# システム起動
npm run dev

read -p "Enterキーで終了..." 