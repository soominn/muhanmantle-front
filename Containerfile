# 무한맨틀 프론트: Node로 빌드하고 Nginx로 정적 파일을 서빙한다.
# 호스트에는 127.0.0.1 한 포트만 연다. TLS와 /api 프록시는 호스트 Nginx가 맡는다.

FROM docker.io/library/node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM docker.io/library/nginx:1.28-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN nginx -t

EXPOSE 80

# nginx:alpine 의 busybox wget. 배포 워크플로는 호스트에서 curl 로 한 번 더 확인한다.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
