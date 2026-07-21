#!/usr/bin/env bash
# =================================================================
# 🐧 한게임 스타일 바둑 9단 카타고(KataGo) 리눅스 서버 24/7 자동 구축기
# Ubuntu / Debian / CentOS / AWS EC2 / Oracle Cloud / VPS 전용
# =================================================================
set -e

echo "================================================================="
echo "🐧 한게임 바둑 마스터 클래스 - 프로 9단 KataGo 리눅스 서버 구축을 시작합니다"
echo "================================================================="
echo ""

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "📥 Node.js가 설치되어 있지 않습니다. Node.js LTS 버전을 자동 설치합니다..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo -E bash -
    sudo yum install -y nodejs
  fi
fi

# 2. Check KataGo package installation (if Ubuntu/Debian)
if ! command -v katago >/dev/null 2>&1; then
  echo "🤖 KataGo 엔진 패키지 확인 중..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update || true
    sudo apt-get install -y katago || echo "⚠️ 패키지 매니저에 katago가 없어 중계 스크립트가 자동 바이너리를 다운로드합니다."
  fi
fi

# 3. Download setup-katago-auto.mjs if not exists
if [ ! -f "setup-katago-auto.mjs" ]; then
  echo "📡 카타고 9단 자동 설치 및 중계 스크립트를 다운로드합니다..."
  curl -sSL https://raw.githubusercontent.com/korbill73/baduk/main/setup-katago-auto.mjs -o setup-katago-auto.mjs
fi

# 4. Install pm2 for 24/7 background execution
if ! command -v pm2 >/dev/null 2>&1; then
  echo "⚙️ 24시간 백그라운드 무중단 실행을 위한 PM2 프로세스 관리자를 설치합니다..."
  sudo npm install -g pm2
fi

echo ""
echo "🚀 KataGo AI 9단 중계 서버를 PM2 백그라운드로 시작(또는 재시작)합니다..."
pm2 stop katago-server 2>/dev/null || true
pm2 start setup-katago-auto.mjs --name "katago-server"
pm2 save || true

SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "서버-공인-IP")

echo ""
echo "================================================================="
echo "🎉 [구축 완료!] 리눅스 서버에서 KataGo 9단 AI 중계기가 24시간 작동 중입니다!"
echo "-----------------------------------------------------------------"
echo "🌐 Vercel 웹사이트 (baduk-lac.vercel.app)에 접속하신 뒤,"
echo "👉 상단 [🤖 전문 바둑 AI 연동] 팝업의 '서버 연결 주소' 란에:"
echo "   http://${SERVER_IP}:63333"
echo "   (또는 설정하신 리눅스 공인 도메인/외부 IP 주소)를 입력하시고"
echo "   [연동 테스트 & 저장]을 누르시면 전 세계 어디서나 프로 9단 연동 대국이 진행됩니다!"
echo "================================================================="
