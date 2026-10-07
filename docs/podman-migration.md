# 프론트엔드 Podman 이전

정적 파일을 서버에서 `npm run build` 한 뒤 `/var/www/muhanmantle-front`에 복사하던 배포를, Podman 컨테이너가 같은 파일을 서빙하는 방식으로 바꿉니다. TLS와 공개 포트는 지금처럼 호스트 Nginx가 맡습니다. 게임 API도 호스트 Nginx가 `127.0.0.1:8000`으로 계속 프록시합니다.

브라우저의 `public/config.json`은 `{}`입니다. 앱은 같은 출처의 `/api/game`을 호출하고, 그 요청은 컨테이너로 가지 않습니다.

## 포트

컨테이너는 **127.0.0.1:8090** 만 엽니다. 밖에서 이 포트로 접속할 수 없습니다.

| 포트 | 용도 |
|------|------|
| 80, 443 | 호스트 Nginx (그대로) |
| 8000 | 게임 API. 백엔드 컨테이너가 루프백에 유지 |
| 3306 | 백엔드 compose의 MariaDB |
| 8090 | 이 프론트 컨테이너. `FRONT_PORT`로 변경 가능 |

`soomin-hub`, `url-link-cards` 저장소는 이 문서를 쓸 때 공개 조회가 되지 않아 compose 파일을 읽지 못했습니다. 첫 기동 전에 서버에서 8090이 비어 있는지 확인하세요.

```bash
ss -ltn | grep -E ':8090|:8000|:3306' || true
```

이미 쓰는 중이면 저장소 루트에 `.env`를 만듭니다. `.env`는 커밋하지 않습니다.

```bash
cp .env.example .env
# FRONT_PORT=다른포트
```

호스트 Nginx의 `proxy_pass` 숫자와 `FRONT_PORT`는 같아야 합니다.

## 서버에서 한 번만

SSH 사용자(Actions의 `SSH_USERNAME`)로 진행합니다. 배포 워크플로는 그 사용자의 rootless Podman을 호출하고, sudo로 컨테이너를 띄우지 않습니다.

Ubuntu 24.04 기준입니다. 서버 Nginx가 1.24인 것과 같습니다.

```bash
sudo apt-get update
sudo apt-get install -y podman podman-compose curl
podman --version
podman compose version
```

`podman compose`가 없으면 `podman-compose version`으로 확인해도 됩니다. 워크플로는 둘 중 되는 쪽을 씁니다. Ubuntu 24.04의 `podman-compose` 1.0.6은 `${FRONT_PORT:-8090}` 기본값을 이해합니다.

rootless 컨테이너는 로그아웃 뒤에 사용자 세션이 없으면 같이 내려갑니다. linger와 재시작 유닛을 켭니다.

```bash
sudo loginctl enable-linger "$USER"
systemctl --user enable --now podman-restart.service
```

SSH를 한 번 끊었다가 다시 들어온 다음, 런타임 디렉터리가 있는지 봅니다.

```bash
echo "${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
ls "/run/user/$(id -u)"
```

## 첫 기동

호스트 Nginx를 바꾸기 **전에** 컨테이너만 띄웁니다. 공개 사이트는 그동안 기존 `/var/www/muhanmantle-front`를 계속 씁니다.

main에 이 변경이 들어간 뒤:

```bash
cd ~/projects/muhanmantle-front
git pull --ff-only origin main
podman compose up -d --build
curl -fsS http://127.0.0.1:8090/healthz
curl -fsS http://127.0.0.1:8090/ | grep -q 'id="root"' && echo "index ok"
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8090/play/not-a-file
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8090/assets/__missing__.js
```

기대값: healthz 본문 `ok`, index에 `id="root"`, 없는 경로 `/play/not-a-file`은 **200** (index.html), `/assets/__missing__.js`는 **404**. `FRONT_PORT`를 바꿨으면 8090 자리에 그 값을 넣습니다.

## 호스트 Nginx

`location /`만 정적 파일 루트에서 컨테이너 프록시로 바꿉니다. `sudo nginx -t`가 통과한 뒤에만 reload 합니다.

게임 API 블록은 유지합니다. `proxy_pass`에 경로를 붙이면 (`http://127.0.0.1:8000/`처럼 끝 슬래시) `/api`가 잘리므로, 아래처럼 호스트와 포트만 씁니다.

Umami는 지우지 않습니다. 지금 공개 사이트에서 `/script.js`와 `POST /api/send`는 정적 파일이 아니라 Umami 응답입니다. `location /`가 컨테이너로 가면, 더 구체적인 Umami location이 없을 때 `/script.js`가 index.html이 됩니다. 서버에 있는 그 블록은 그대로 두고, 이 문서에는 포트를 추측해 적지 않습니다. `/api/send`는 `/api/`보다 긴 접두사라 위에 있어도 먼저 잡힙니다.

```nginx
# 기존 Umami location (= /script.js, /api/send) 은 삭제하지 않는다.

# 게임 API. 백엔드는 127.0.0.1:8000. 이미 있는 블록이면 내용을 유지해도 된다.
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
}

# 예전: root /var/www/muhanmantle-front; try_files ...
# FRONT_PORT 를 바꿨으면 8090 도 같이 바꾼다.
location / {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

확인:

- `https://www.muhanmantle.com/` 가 열리고, 새로고침 후에도 게임 화면이 나온다.
- 개발자 도구에서 `GET /api/game/session` 이 JSON이다. HTML이면 `/api/`가 프론트 컨테이너로 가고 있는 것이다.
- `GET /script.js` 가 자바스크립트이다. HTML이면 Umami location이 `location /`에 먹힌 것이다.
- 세션 쿠키 `mm_session` (`Path=/`, `SameSite=None`, `Secure`) 이 API 응답에 그대로 있다. 컨테이너는 이 쿠키를 보지 않는다.

`/var/www/muhanmantle-front`는 롤백용으로 남겨 둡니다. 워크플로는 더 이상 그 디렉터리를 덮어쓰지 않고, Nginx reload도 하지 않습니다.

## 이후 배포

main에 push하면 GitHub Actions가 테스트를 통과한 다음 SSH로 `git pull`, `podman compose up -d --build --force-recreate`, `curl` 확인을 합니다. healthz가 실패하거나, 없는 화면 경로가 index.html이 아니거나, 없는 `/assets/` 파일이 404가 아니면 잡이 실패합니다.

시크릿 이름은 이전과 같습니다. `SERVER_IP`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`.

Actions가 성공하려면 위의 1회 설치가 **merge 전에** 끝나 있어야 합니다. Podman이 없으면 첫 배포 잡이 실패하고, 공개 사이트는 Nginx를 바꾸기 전까지 기존 정적 파일을 유지합니다.

## 롤백

호스트 Nginx의 `location /`를 정적 파일로 되돌리고 reload 합니다. API와 Umami 블록은 그대로 둡니다.

```nginx
location / {
    root /var/www/muhanmantle-front;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
cd ~/projects/muhanmantle-front
podman compose down
```

`/var/www/muhanmantle-front`에는 컨테이너로 바꾸기 직전의 빌드가 남아 있습니다. 그 이후에 나온 화면 변경은 정적 디렉터리에 없습니다. 그 빌드가 필요하면 서버에 남아 있는 Node 22로 만든 뒤 다시 복사합니다.

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 22
cd ~/projects/muhanmantle-front
git pull --ff-only origin main
npm ci
npm run build
sudo rm -rf /var/www/muhanmantle-front/*
sudo cp -r dist/* /var/www/muhanmantle-front/
sudo nginx -t && sudo systemctl reload nginx
```

워크플로 자체를 정적 배포로 되돌리려면 이 변경을 revert 한 커밋을 main에 올립니다. revert 전에 Nginx를 정적 파일로 되돌려 두지 않으면, 잡이 컨테이너만 갱신하는 동안 사이트는 이미 컨테이너를 보고 있습니다.

## 로컬에서 이미지 확인

```bash
cp .env.example .env   # 선택
podman compose up -d --build
curl -fsS http://127.0.0.1:8090/healthz
podman compose down
```

`docker compose -f compose.yaml up -d --build`도 같은 파일을 사용합니다. Dockerfile 이름은 `Containerfile`입니다.
