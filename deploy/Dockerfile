FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV VITE_BASE_PATH=/xiangjian/
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV BASE_PATH=/xiangjian
ENV PORT=3000
# 运行时注入（勿写入镜像）：DASHSCOPE_API_KEY、QWEN_MODEL
# docker run -e DASHSCOPE_API_KEY=sk-xxx ...  或 deploy/docker-compose.yml + .env
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.mjs"]
