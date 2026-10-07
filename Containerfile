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
