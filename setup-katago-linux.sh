#!/usr/bin/env bash
# =================================================================
# 🐧 한게임 스타일 바둑 9단 카타고(KataGo) 리눅스 전용 원클릭 자동 구축기
# CentOS 7 (glibc 2.17 호환), RHEL, Ubuntu, Debian, AWS EC2, Oracle Cloud 지원
# =================================================================
set -e

echo "================================================================="
echo "🐧 한게임 바둑 마스터 클래스 - 프로 9단 KataGo 리눅스 서버 구축"
echo "================================================================="
echo ""

# 0. NodeSource의 glibc >= 2.28 요구 충돌 Repo 강제 제거 (스크린샷 에러 원천 차단)
if ls /etc/yum.repos.d/nodesource* 1> /dev/null 2>&1; then
  echo "🛠️ CentOS 7에서 glibc 에러를 일으키는 NodeSource 저장소 파일을 정리합니다..."
  sudo rm -f /etc/yum.repos.d/nodesource*.repo 2>/dev/null || true
fi

# CentOS 7 EOL(수명 종료) 미러 오류 해결 (vault.centos.org 자동 변환)
if [ -f /etc/redhat-release ] || [ -f /etc/centos-release ]; then
  sudo sed -i 's/mirror.centos.org/vault.centos.org/g' /etc/yum.repos.d/CentOS-*.repo 2>/dev/null || true
  sudo sed -i 's/^#.*baseurl=http/baseurl=http/g' /etc/yum.repos.d/CentOS-*.repo 2>/dev/null || true
  sudo sed -i 's/^mirrorlist=http/#mirrorlist=http/g' /etc/yum.repos.d/CentOS-*.repo 2>/dev/null || true
fi

# 1. Check Node.js & Install (CentOS 7 glibc 2.17 완벽 호환 단독 바이너리 설치)
NEED_NODE=true
if command -v node >/dev/null 2>&1; then
  if node -v >/dev/null 2>&1; then
    NEED_NODE=false
    echo "✅ 정상 작동하는 Node.js($(node -v))가 감지되었습니다."
  fi
fi

if [ "$NEED_NODE" = true ]; then
  echo "📥 Node.js 단독 호환 바이너리를 직접 설치합니다 (yum/glibc 에러 원천 차단)..."
  sudo mkdir -p /usr/local/lib/nodejs

  echo "⏳ Node.js 호환 패키지 다운로드 및 압축 해제 중..."
  # 1순위: unofficial-builds Node 20 (glibc 2.17 전용), 2순위: Node 16 LTS 공식 바이너리
  curl -fsSL "https://unofficial-builds.nodejs.org/download/release/v20.18.0/node-v20.18.0-linux-x64-glibc-217.tar.gz" -o /tmp/node-compat.tar.gz || \
  curl -fsSL "https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.gz" -o /tmp/node-compat.tar.gz

  sudo tar -xzf /tmp/node-compat.tar.gz -C /usr/local/lib/nodejs --strip-components=1
  sudo ln -sf /usr/local/lib/nodejs/bin/node /usr/bin/node
  sudo ln -sf /usr/local/lib/nodejs/bin/npm /usr/bin/npm
  sudo ln -sf /usr/local/lib/nodejs/bin/npx /usr/bin/npx
  sudo ln -sf /usr/local/lib/nodejs/bin/node /usr/local/bin/node
  sudo ln -sf /usr/local/lib/nodejs/bin/npm /usr/local/bin/npm
  sudo ln -sf /usr/local/lib/nodejs/bin/npx /usr/local/bin/npx
  rm -f /tmp/node-compat.tar.gz

  echo "✅ Node.js ($(node -v)) 설치 성공!"
fi

# 2. Check KataGo package installation (if Ubuntu/Debian)
if command -v apt-get >/dev/null 2>&1; then
  if ! command -v katago >/dev/null 2>&1; then
    sudo apt-get update || true
    sudo apt-get install -y katago || true
  fi
fi

# 3. Download setup-katago-auto.mjs
echo "📡 카타고 9단 자동 설치 및 중계 스크립트를 다운로드합니다..."
curl -sSL https://raw.githubusercontent.com/korbill73/baduk/main/setup-katago-auto.mjs -o setup-katago-auto.mjs

# 4. Install pm2 for 24/7 background execution
if ! command -v pm2 >/dev/null 2>&1 || ! pm2 -v >/dev/null 2>&1; then
  echo "⚙️ 24시간 백그라운드 무중단 실행을 위한 PM2 프로세스 관리자를 설치합니다..."
  sudo npm install -g pm2
  sudo ln -sf /usr/local/lib/nodejs/bin/pm2 /usr/bin/pm2 2>/dev/null || true
  sudo ln -sf /usr/local/lib/nodejs/bin/pm2 /usr/local/bin/pm2 2>/dev/null || true
fi

echo ""
echo "🚀 KataGo AI 9단 중계 서버를 PM2 백그라운드로 시작(또는 재시작)합니다..."
pm2 stop katago-server 2>/dev/null || true
pm2 start setup-katago-auto.mjs --name "katago-server"
pm2 save || true

SERVER_IP=$(curl -sSL https://api.ipify.org 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "서버-공인-IP")

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
