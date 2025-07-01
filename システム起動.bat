@echo off
echo ====================================
echo    美容室シフト管理システム
echo ====================================
echo.
echo システムを起動しています...
echo.

REM Node.jsがインストールされているかチェック
node --version >nul 2>&1
if errorlevel 1 (
    echo エラー: Node.jsがインストールされていません
    echo https://nodejs.org からダウンロードしてください
    echo.
    pause
    exit /b 1
)

REM 必要なパッケージがあるかチェック
if not exist "node_modules" (
    echo 初回起動: 必要なファイルをダウンロードしています...
    call npm install
    if errorlevel 1 (
        echo エラー: インストールに失敗しました
        pause
        exit /b 1
    )
)

echo システムを起動中...
echo.
echo ブラウザで以下のURLを開いてください:
echo http://localhost:3000
echo.
echo 停止するには Ctrl+C を押してください
echo.

REM システム起動
call npm run dev

pause 