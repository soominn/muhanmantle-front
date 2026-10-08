# 🎮 무한맨틀 프론트엔드 (Muhanmantle Front)

**한국어 단어 유사도 기반 싱글 플레이 게임 - 프론트엔드 애플리케이션**

React 기반으로 구축된 SPA(Single Page Application)이며,  
FastText 기반 백엔드 API와 통신하여 게임 플레이 및 시각화를 제공합니다.  
브라우저 환경에서 유저 인터랙션을 처리합니다. 공개 입구는 호스트 Nginx(TLS)이고, 화면 파일은 Podman 컨테이너가 서빙합니다.

🔗 [서비스 바로가기](https://www.muhanmantle.com)  
🧠 [백엔드 GitHub](https://github.com/soominn/muhanmantle-back)

---

## 📌 프로젝트 개요

- 단어 유사도 게임의 UI와 인터랙션을 담당하는 React 기반 웹 프론트엔드
- REST API를 활용하여 게임 데이터 송수신
- 클라이언트 사이드 라우팅 및 상태 관리를 통한 SPA 구조 구현
- 호스트 Nginx가 TLS와 `/api` 프록시를 맡고, 프론트 컨테이너가 정적 파일을 서빙

---

## 🛠 기술 스택

| 분류        | 기술 |
|-------------|------|
| 언어        | TypeScript, HTML, CSS |
| 프레임워크  | React 19 + Vite 7 |
| 상태 관리   | React hooks (`useGameState`) |
| 스타일링    | Tailwind CSS 4 |
| 배포 방식   | Podman 정적 컨테이너 + 호스트 Nginx 리버스 프록시 |
| API 통신    | fetch (`/api/game`) |
| 테스트      | Vitest |

---

## 🚀 주요 기능

- ⌨️ **단어 입력 및 유사도 결과 시각화**
  - 사용자가 입력한 단어에 대해 백엔드 API로 유사도 계산 요청
  - 결과값을 퍼센트 및 그래프 형태로 시각화

- 📘 **게임 흐름 처리**
  - 게임 시작 → 입력 → 결과 출력 → 리셋 등의 UX 흐름을 React로 구성

- 🔄 **API 연동 및 에러 대응**
  - fetch 함수를 사용하여 백엔드 REST API 요청 처리
  - 응답 상태에 따른 조건 분기 및 에러 핸들링 로직 구현
  - 딩 중 상태 표시, 에러 발생 시 사용자 피드백 메시지 출력

- 📱 **반응형 설계**
  - 모바일 환경에서도 자연스럽게 플레이 가능하도록 CSS 설계

---

## 🖥️ 배포 환경

- **Podman으로 정적 파일을 서빙**
  - 이미지가 `npm run build`로 `dist/`를 만들고, 컨테이너 Nginx가 SPA로 서빙
  - 호스트에는 `127.0.0.1:8001`만 연다 (`FRONT_PORT`로 변경). 8090은 Beszel, 3000은 Umami가 이미 쓴다
- **호스트 Nginx**
  - TLS와 공개 입구. `location /`는 프론트 컨테이너(`127.0.0.1:8001`)로 프록시
  - `location /api/`는 게임 API(`127.0.0.1:8000`)로 프록시. `config.json`이 `{}`이면 앱은 같은 도메인의 `/api/game`을 호출
  - Umami location(`= /script.js`, `/api/send`)은 유지
- **도메인 연결**: `muhanmantle.com` 도메인 Route 53 연동
- **수동 배포**: 서버에서 Podman compose로 직접 갱신. 절차와 롤백은 [docs/podman-migration.md](docs/podman-migration.md)

CI가 없으므로 배포 전에 로컬에서 확인합니다.

```bash
npm test
npm run build
```

서버:

```bash
cd ~/projects/muhanmantle-front
git pull --ff-only
# 필요하면 .env 의 FRONT_PORT (기본 8001, 호스트 Nginx proxy_pass 와 같아야 함)
podman compose up -d --build --force-recreate
curl -fsS http://127.0.0.1:8001/healthz
```

`podman compose`가 없으면 `podman-compose up -d --build --force-recreate`를 씁니다. 실패하면 `podman logs muhanmantle-front`로 확인합니다.

---

## 로컬 실행

```bash
cd muhanmantle-front
npm install
npm run dev          # http://localhost:5173
npm test             # Vitest
npm run build        # dist/ 생성
```

백엔드를 `http://127.0.0.1:8000`에서 띄운 뒤, Vite가 `/api`를 프록시합니다 (`vite.config.ts`).

---

## 🧩 트러블슈팅

| 문제 | 해결 방법 |
|------|------------|
| CORS 오류 | 백엔드 `CORS_ORIGINS`에 프론트 origin 추가 |
| API 연결 실패 | 백엔드 기동 여부, `config.json`의 `BACKEND_URL` 확인 |

---

## 📂 디렉토리 구조

```bash
muhanmantle-front/
├── index.html               # Vite 엔트리 HTML
├── public/
│   ├── favicon.ico
│   ├── config.json          # (선택) BACKEND_URL
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── api/                 # config, gameSession
│   ├── components/
│   ├── hooks/               # useGameState
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── main.css
├── vite.config.ts
├── tsconfig.json
├── package.json
├── Containerfile            # Node 빌드 + Nginx 정적 스테이지
├── compose.yaml             # podman compose, 127.0.0.1 게시
├── nginx/default.conf       # SPA fallback, 해시 에셋 캐시
└── docs/podman-migration.md # 서버 1회 작업, Nginx, 롤백
```

---

## 📈 향후 개선 예정

- **로딩 애니메이션 및 UX 전환 개선**
- **입력 기록 히스토리 UI 추가**
- **모바일 터치 인터랙션 최적화**

---

## 🙋‍♀️ 개발자 정보

**🎨 프론트엔드 개발**: 조수민 (Soomin Cho)  
- GitHub: [@soominn](https://github.com/soominn)  
- Blog: [som-ethi-ng.tistory.com](https://som-ethi-ng.tistory.com)
