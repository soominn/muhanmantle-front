# 🎮 무한맨틀 프론트엔드 (Muhanmantle Front)

**한국어 단어 유사도 기반 싱글 플레이 게임 - 프론트엔드 애플리케이션**

React 기반으로 구축된 SPA(Single Page Application)이며,  
FastText 기반 백엔드 API와 통신하여 게임 플레이 및 시각화를 제공합니다.  
브라우저 환경에서 유저 인터랙션을 처리하며, 직접 구축한 Nginx 서버를 통해 정적 파일을 서빙하고 있습니다.

🔗 [서비스 바로가기](https://www.muhanmantle.com)  
🧠 [백엔드 GitHub](https://github.com/soominn/muhanmantle-back)

---

## 📌 프로젝트 개요

- 단어 유사도 게임의 UI와 인터랙션을 담당하는 React 기반 웹 프론트엔드
- REST API를 활용하여 게임 데이터 송수신
- 클라이언트 사이드 라우팅 및 상태 관리를 통한 SPA 구조 구현
- 자체 Nginx 서버를 이용해 정적 파일 배포 및 API 요청 프록시 처리

---

## 🛠 기술 스택

| 분류        | 기술 |
|-------------|------|
| 언어        | TypeScript, HTML, CSS |
| 프레임워크  | React |
| 상태 관리   | useState, useEffect, Context API |
| 스타일링    | Emotion, styled-components |
| 배포 방식   | Nginx + 정적 파일 서빙 |
| API 통신    | fetch (Native Web API) |
| 기타        | GitHub |

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

- **로컬 빌드 후 Nginx로 정적 파일 서빙**
  - `npm run build` 명령으로 `dist/` 폴더 생성 후, Nginx에서 서빙
- **프론트와 백엔드 통합 배포 구성**
  - 정적 파일은 Nginx의 `location /` 설정을 통해 배포됨
  - API 요청은 `location /api` 설정을 통해 백엔드 서버로 프록시 처리
- **도메인 연결**: `muhanmantle.com` 도메인 Route 53 연동
- **환경 변수 관리**: `.env` 파일을 통해 API 주소 분리

---

## 🧩 트러블슈팅 & 개선 사항

| 문제 | 해결 방법 |
|------|------------|
| CORS 오류 발생 | 백엔드에 `django-cors-headers` 설정 적용 |
| 반응형 깨짐 문제 | styled-components와 미디어쿼리로 해결 |

---

## 📂 디렉토리 구조

```bash
muhanmantle-front/
├── public/                  # 정적 파일 (HTML, 파비콘 등)
│   ├── favicon.ico
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
│
├── src/                     # 실제 프론트엔드 소스 코드
│   ├── components/          # 공통 UI 컴포넌트
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Table.tsx
│   ├── App.tsx              # 루트 컴포넌트
│   ├── index.tsx            # 엔트리 포인트
│   ├── main.css             # 전역 스타일
│   ├── reportWebVitals.js   # 성능 측정 설정
│   └── setupTests.js        # 테스트 환경 설정
│
├── .gitignore               # Git 추적 제외 파일 설정
├── README.md                # 프로젝트 설명 파일
├── package-lock.json        # 의존성 잠금 파일
└── package.json             # 프로젝트 메타 및 의존성 정보
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
