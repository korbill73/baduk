@echo off
chcp 65001 > nul
title 한게임 바둑 9단 카타고(KataGo) AI 원클릭 실행기
echo ========================================================
echo 🤖 한게임 바둑 9단 AI 로컬 엔진 자동 설치 및 구동을 시작합니다...
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [⚠️ 중요 안내] PC에 Node.js 프로그램이 설치되어 있지 않습니다!
  echo --------------------------------------------------------
  echo 1. 웹 브라우저를 열고 https://nodejs.org 사이트에 접속하세요.
  echo 2. 화면 중앙의 초록색 [LTS 버전 다운로드] 버튼을 눌러 설치해 주세요.
  echo 3. Node.js 설치가 완료된 후, 이 파일(run-katago-ai.bat)을 다시 더블클릭해 주시면 완료됩니다!
  echo --------------------------------------------------------
  pause
  exit /b
)

if not exist setup-katago-auto.mjs (
  echo 📡 카타고 9단 자동 설치 및 중계 스크립트를 안전하게 다운로드하고 있습니다...
  powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/korbill73/baduk/main/setup-katago-auto.mjs' -OutFile 'setup-katago-auto.mjs'"
)

echo 🚀 카타고(KataGo) 엔진 및 신경망 서버를 구동합니다...
echo 이 창을 열어두신 상태로 웹 바둑(https://baduk.vercel.app)에 접속하시면 자동으로 연동됩니다!
echo.
node setup-katago-auto.mjs
pause
