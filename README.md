<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 廿四香笺

融合中国传统二十四节气与香道的国风 Web 应用，智能对话由 **通义千问（阿里云百炼）** 驱动。

## 本地运行

**环境要求：** Node.js 18+

1. 安装依赖：

   ```bash
   npm install
   ```

2. 配置 API Key：复制 `.env.example` 为 `.env`，填入百炼 API Key：

   ```bash
   copy .env.example .env
   ```

   ```env
   DASHSCOPE_API_KEY=sk-你的密钥
   QWEN_MODEL=qwen-plus
   ```

   > 未配置 `DASHSCOPE_API_KEY` 时仍可启动，聊天会使用本地关键词演示回复。

3. 启动开发服务：

   ```bash
   npm run dev
   ```

4. 浏览器打开：**http://localhost:3000**

## 生产构建

```bash
npm run build
npm run start
```

**上线后 LLM 无效？** 多半是服务器未配置 `DASHSCOPE_API_KEY`（本地 `.env` 不会进 Docker）。  
自检：`https://你的域名/xiangjian/api/llm/status` 应返回 `"mode":"live"`。  
详见 [deploy/README.md](deploy/README.md)。

## 环境变量

| 变量 | 说明 |
|------|------|
| `DASHSCOPE_API_KEY` | 阿里云百炼 API Key（必填，否则为演示模式） |
| `QWEN_MODEL` | 模型名，默认 `qwen-plus` |
| `DASHSCOPE_BASE_URL` | 兼容接口地址，默认北京地域 |
| `PORT` | 端口，默认 `3000` |
