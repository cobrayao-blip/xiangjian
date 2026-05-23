# 生产环境部署说明

## 为什么上线后 LLM 不工作？

`.env` **不会**打进 Docker 镜像（见 `.dockerignore`），也**不应**提交到 Git。

若服务器进程里没有环境变量 `DASHSCOPE_API_KEY`，接口会返回 `mode: "demo"`，聊天走本地关键词模板（以 `【香灵寄语】` 开头），**不是**通义千问。

### 常见坑：`.env` 放在项目根目录却不生效

生产环境入口是 `node dist/server.mjs`，旧版只在 **`dist/.env`** 查找配置。  
若你把 `.env` 放在 **`/opt/xiangjian/.env`**（与 `dist` 同级），需要**更新代码后重启**，新版本会依次读取：

1. `dist/.env`
2. **`/opt/xiangjian/.env`**（项目根，与 `dist` 同级）← 推荐
3. 进程当前工作目录下的 `.env`

也可显式指定：`ENV_FILE=/opt/xiangjian/.env node dist/server.mjs`

### 为何 status 显示 `qwen-plus` 而不是 `.env` 里的模型名？

`getQwenModel()` 读不到 `QWEN_MODEL` 时会**默认 `qwen-plus`**。  
说明 `.env` 未被加载（与 `configured: false` 是同一原因）。修复加载路径并重启后，应显示你配置的 `qwen3.5-35b-a3b`。

### 自检

浏览器打开（将域名换成你的）：

```
https://tp.textengine.cn/xiangjian/api/llm/status
```

- 正常：`{"configured":true,"mode":"live","model":"qwen-plus",...}`
- 异常：`{"configured":false,"mode":"demo",...}` → 需要在**运行容器/进程的环境**里配置 Key

## Docker Compose 示例

在服务器项目目录放置 `.env`（勿提交 Git），内容参考根目录 `.env.example`：

```env
DASHSCOPE_API_KEY=sk-你的百炼密钥
QWEN_MODEL=qwen-plus
BASE_PATH=/xiangjian
PORT=3000
```

然后：

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

## 仅 Docker 运行

```bash
docker build -f deploy/Dockerfile -t xiangjian .
docker run -d --name xiangjian -p 3000:3000 \
  -e DASHSCOPE_API_KEY=sk-你的密钥 \
  -e QWEN_MODEL=qwen-plus \
  -e BASE_PATH=/xiangjian \
  xiangjian
```

修改环境变量后**必须重启容器**。

## 反向代理（Nginx）

需把 `/xiangjian/api/` 转发到 Node 服务（端口 3000），静态资源走同一服务或 `dist/`。

示例：

```nginx
location /xiangjian/ {
  proxy_pass http://127.0.0.1:3000/xiangjian/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

## 面板 / 平台部署

在「环境变量」中添加：

| 变量 | 必填 | 说明 |
|------|------|------|
| `DASHSCOPE_API_KEY` | 是 | 阿里云百炼 API Key |
| `QWEN_MODEL` | 否 | 默认 `qwen-plus` |
| `BASE_PATH` | 是（子路径部署） | 如 `/xiangjian` |
| `NODE_ENV` | 否 | 生产设为 `production` |

保存后重新发布/重启应用。

## 与 quatangshi 一起部署（tp.textengine.cn 常见）

廿四香笺容器由 **`/opt/quatangshi/deploy/docker-compose.prod.yml`** 启动（服务名多为 `xiangjian`，容器名 `quatangshi-xiangjian-1`）。

宿主机 `/opt/xiangjian/.env` **不会自动进容器**，需在 compose 里显式注入：

```yaml
  xiangjian:   # 以 compose 中实际 service 名为准
    env_file:
      - /opt/xiangjian/.env
    environment:
      BASE_PATH: /xiangjian
      NODE_ENV: production
```

应用并重建：

```bash
cd /opt/quatangshi/deploy
docker compose -f docker-compose.prod.yml up -d --force-recreate xiangjian
```

验证：

```bash
docker exec quatangshi-xiangjian-1 printenv QWEN_MODEL
curl -s https://tp.textengine.cn/xiangjian/api/llm/status
```

应看到 `configured:true`、`model` 与 `.env` 中 `QWEN_MODEL` 一致（如 `qwen3.5-35b-a3b`）。
