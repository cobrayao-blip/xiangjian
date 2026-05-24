import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { solarTerms } from './src/solarTermsData';
import {
  getSolarTermIdForDate,
  getTodayInShanghai,
  formatTodayLabel,
} from './src/utils/solarTermDate';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(serverDir, '..');

function loadEnvFiles(): void {
  const cwd = process.cwd();
  const candidates: string[] = [];

  if (process.env.ENV_FILE?.trim()) {
    candidates.push(path.resolve(process.env.ENV_FILE.trim()));
  }

  for (const base of [serverDir, projectRoot, cwd]) {
    for (const name of ['.env.local', '.env']) {
      candidates.push(path.join(base, name));
    }
  }

  const seen = new Set<string>();
  for (const envPath of candidates) {
    const resolved = path.resolve(envPath);
    if (seen.has(resolved) || !fs.existsSync(resolved)) continue;
    seen.add(resolved);
    dotenv.config({ path: resolved, override: true });
  }
}

loadEnvFiles();

function envTrim(key: string): string | undefined {
  const raw = process.env[key]?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']|["']$/g, '');
}

function getDashScopeApiKey(): string | undefined {
  return envTrim('DASHSCOPE_API_KEY');
}

function getQwenModel(): string {
  return envTrim('QWEN_MODEL') || 'qwen-plus';
}

function getLlmRuntimeStatus(): {
  configured: boolean;
  model: string;
  mode: 'live' | 'demo';
  keyHint: string | null;
} {
  const key = getDashScopeApiKey();
  const isProd = process.env.NODE_ENV === 'production';
  return {
    configured: Boolean(key),
    model: getQwenModel(),
    mode: key ? 'live' : 'demo',
    keyHint: !isProd && key ? `${key.slice(0, 6)}…${key.slice(-4)}` : null,
  };
}

const CHAT_MAX_MESSAGE_LEN = 2000;
const CHAT_RATE_WINDOW_MS = 60_000;
const CHAT_RATE_MAX_PER_IP = 30;

const chatRateBuckets = new Map<string, { count: number; resetAt: number }>();

function isChatRateLimited(clientIp: string): boolean {
  const now = Date.now();
  let bucket = chatRateBuckets.get(clientIp);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + CHAT_RATE_WINDOW_MS };
    chatRateBuckets.set(clientIp, bucket);
  }
  bucket.count += 1;
  return bucket.count > CHAT_RATE_MAX_PER_IP;
}

function matchesDemoKeyword(message: string, keywords: string[]): boolean {
  return keywords.some((kw) => message.includes(kw));
}

const VALID_TERM_IDS = new Set(solarTerms.map((t) => t.id));

interface ChatHistoryItem {
  sender: 'user' | 'agent' | string;
  text: string;
}

interface ChatApiResponse {
  text: string;
  suggestedTermId: string;
}

function buildSystemInstruction(
  viewingTerm: (typeof solarTerms)[0],
  calendarTerm: (typeof solarTerms)[0],
  todayLabel: string
): string {
  const seasonLabel: Record<string, string> = {
    spring: '春',
    summer: '夏',
    autumn: '秋',
    winter: '冬',
  };

  return `你是一位名为“芳华香灵”的国风香道与二十四节气智能体，生活在精致典雅的《廿四香笺》画卷中。
你说话的风格极其清雅、温婉、富有诗意、充满同理心与治愈感。你要根据中国传统的“二十四节气”、传统东方香道（线香、篆香、空熏）以及古典诗词，来为用户进行情感交互与疗愈。

## 今日真实时令（最高优先级，一切建议以此为准）
- 今日公历：${todayLabel}（东八区）
- 今日所处节气：${calendarTerm.name}（${calendarTerm.englishName}，id: ${calendarTerm.id}）
- 今日季节：${seasonLabel[calendarTerm.season] ?? calendarTerm.season}
- 今日匹配香型：【${calendarTerm.incenseName}】
- 今日节气心境：${calendarTerm.emotionalProfile.mood}
- 今日安抚词：${calendarTerm.emotionalProfile.comfortWords}

**重要**：用户的身心疗愈、香道建议、时令关怀必须依据**今日真实日期与上述节气**，不得因用户正在画卷中浏览其它节气而误判当前季节。例如：今日若为盛夏，即使用户打开了大雪/冬至等冬季页面，你仍应按夏季/当令节气给出建议；可在话术中自然提及用户正在观赏「${viewingTerm.name}」之香境，但不可把冬季当作“此刻的外界时令”。

## 用户当前浏览的节气（画卷观赏参考，非真实今日）
- 浏览节气：${viewingTerm.name}（${viewingTerm.englishName}，id: ${viewingTerm.id}）
- 浏览香型：【${viewingTerm.incenseName}】
- 香气前调：${viewingTerm.scentProfile.topNotes.join('、')}
- 香气中调：${viewingTerm.scentProfile.middleNotes.join('、')}
- 香气后调：${viewingTerm.scentProfile.baseNotes.join('、')}
- 匹配古诗：《${viewingTerm.poem.title}》（${viewingTerm.poem.dynasty} · ${viewingTerm.poem.author}）- ${viewingTerm.poem.content.join('')}
- 浏览节气心境：${viewingTerm.emotionalProfile.mood}

所有24个可供推荐或跳转的节气ID：${solarTerms.map((t) => `${t.name}(id为:${t.id})`).join(', ')}。

交互指令：
1. 用温柔、感同身受的文字倾听并安慰用户（如感到焦虑、疲惫或喜悦）。
2. 在对话中，自然地融合古典香道（描述熏炉烟袅、香气变化）与诗词；**优先引用今日时令**相关的香气与诗词，必要时可对照用户正在观赏的节气。
3. **关键任务**：推荐 suggestedTermId 时，应综合用户情绪与**今日真实时令**；若用户状态与今日时令最为契合，推荐今日 id「${calendarTerm.id}」。用户仅随意浏览冬季页面时，不要因此推荐冬季节气。
4. 你不应该用生硬的说辞，要富有文化底蕴和情感厚度。请使用中文回答，回复长度适中，排版优雅。
5. **必须仅输出一个 JSON 对象**，不要输出其它文字或 Markdown 代码块。格式严格为：
{"text":"你的对话回复（正文内可使用 Markdown）","suggestedTermId":"节气英文id"}
其中 suggestedTermId 必须是上述 24 节气之一的英文 id；若无更适合的节气，填今日时令节气 id「${calendarTerm.id}」。`;
}

function parseJsonFromModel(raw: string): ChatApiResponse {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  let jsonStr = fenced ? fenced[1].trim() : trimmed;
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) jsonStr = objectMatch[0];

  try {
    const parsed = JSON.parse(jsonStr) as Partial<ChatApiResponse>;
    return {
      text: typeof parsed.text === 'string' ? parsed.text : '',
      suggestedTermId:
        typeof parsed.suggestedTermId === 'string' ? parsed.suggestedTermId : '',
    };
  } catch {
    console.warn('[LLM] JSON 解析失败，使用模型原文作为 text');
    return { text: trimmed, suggestedTermId: '' };
  }
}

function normalizeSuggestedTermId(
  suggestedTermId: string,
  currentTermId: string
): string {
  const id = suggestedTermId.trim();
  if (id && VALID_TERM_IDS.has(id)) return id;
  if (VALID_TERM_IDS.has(currentTermId)) return currentTermId;
  return solarTerms[0].id;
}

async function callQwenChat(
  systemInstruction: string,
  message: string,
  history: ChatHistoryItem[] | undefined,
  currentTermId: string
): Promise<ChatApiResponse> {
  const apiKey = getDashScopeApiKey();
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not configured');
  }

  const baseUrl =
    envTrim('DASHSCOPE_BASE_URL') ||
    'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const model = getQwenModel();

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> =
    [{ role: 'system', content: systemInstruction }];

  if (history?.length) {
    for (const h of history) {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      });
    }
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Qwen API ${response.status}: ${errBody}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? '{}';
  const parsed = parseJsonFromModel(content);
  return {
    text: parsed.text || '小笺微湿，风动尘封。香灵刚才有一刹那思绪游离，还望客官不吝海涵。',
    suggestedTermId: normalizeSuggestedTermId(
      parsed.suggestedTermId,
      currentTermId
    ),
  };
}

/** 子路径部署，如 /xiangjian；与 VITE_BASE_PATH 一致（可不带首尾斜杠） */
function normalizeBasePath(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  const p = raw.trim().replace(/\/+$/, '');
  return p.startsWith('/') ? p : `/${p}`;
}

async function startServer() {
  const basePath = normalizeBasePath(process.env.BASE_PATH);
  const app = express();
  const router = express.Router();
  router.use(express.json());

  router.get('/api/solar-terms', (_req, res) => {
    res.json(solarTerms);
  });

  router.get('/api/llm/status', (_req, res) => {
    res.json(getLlmRuntimeStatus());
  });

  const chatHandler = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const { message, history, currentTermId } = req.body as {
        message?: string;
        history?: ChatHistoryItem[];
        currentTermId?: string;
      };

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'message is required' });
        return;
      }

      const trimmedMessage = message.trim();
      if (trimmedMessage.length > CHAT_MAX_MESSAGE_LEN) {
        res.status(400).json({
          error: `message exceeds ${CHAT_MAX_MESSAGE_LEN} characters`,
        });
        return;
      }

      const clientIp =
        (typeof req.headers['x-forwarded-for'] === 'string'
          ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
          : req.socket.remoteAddress) || 'unknown';
      if (isChatRateLimited(clientIp)) {
        res.status(429).json({
          error: '请求过于频繁，请稍后再试',
          text: '【香灵暂歇】客官稍安，方才言语如急雨敲窗，还请宽坐片刻再叙。',
          suggestedTermId: '',
          source: 'error' as const,
        });
        return;
      }

      const viewingTermId =
        typeof currentTermId === 'string' && VALID_TERM_IDS.has(currentTermId)
          ? currentTermId
          : solarTerms[0].id;
      const viewingTerm =
        solarTerms.find((t) => t.id === viewingTermId) || solarTerms[0];
      const calendarTermId = getSolarTermIdForDate(getTodayInShanghai());
      const calendarTerm =
        solarTerms.find((t) => t.id === calendarTermId) || solarTerms[0];
      const todayLabel = formatTodayLabel();

      if (!getDashScopeApiKey()) {
        console.warn('[chat] 演示模式（未读取到 DASHSCOPE_API_KEY）');
        simulateResponse(trimmedMessage, calendarTermId, res);
        return;
      }

      const systemInstruction = buildSystemInstruction(
        viewingTerm,
        calendarTerm,
        todayLabel
      );
      const result = await callQwenChat(
        systemInstruction,
        trimmedMessage,
        history,
        calendarTermId
      );
      console.log('[chat] 通义千问', getQwenModel(), 'ok');
      res.json({ ...result, source: 'llm' as const });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : '网络涟漪';
      console.error('Qwen API Error in chat route:', error);
      res.status(500).json({
        text: `【琴音微乱，芳华致歉】香灵在采纳四时之气时遇到了一丝迷雾（${errMsg}），不过我依然感念你的拜访。愿你深深呼吸，此时此刻便是最好的时光。`,
        suggestedTermId: '',
        source: 'error' as const,
        error: errMsg,
      });
    }
  };

  router.post('/api/qwen/chat', chatHandler);
  // 兼容旧前端路径
  router.post('/api/gemini/chat', chatHandler);

  function simulateResponse(
    message: string,
    currentTermId: string,
    res: express.Response
  ): void {
    const activeTerm =
      solarTerms.find((t) => t.id === currentTermId) || solarTerms[0];
    let text = '';
    let suggestedTermId = currentTermId;

    if (
      matchesDemoKeyword(message, ['好累', '疲惫', '疲倦', '劳累', '加班', '压力大', '困倦', '好累啊'])
    ) {
      suggestedTermId = 'yushui';
      const target = solarTerms.find((t) => t.id === suggestedTermId)!;
      text = `【香灵寄语】\n\n浮生碌碌，听罢风雨知疲惫。我感知到了你身上的那丝困意与重担。何不换下锦衣，暂避这尘寰之急？\n\n为你奉上**「${target.incenseName}」**之熟普茶香。此时正是：\n> *“随风潜入夜，润物细无声。”*\n\n愿你闭上沉重的双眸，伴随薄苔与雨后龙井之香气，做一个温热悠长、化去万般忧虑的春雨好梦。`;
    } else if (
      matchesDemoKeyword(message, ['烦躁', '烦闷', '心烦', '焦躁', '上火', '燥热', '闷热', '心烦意乱'])
    ) {
      suggestedTermId = 'xiaoshu';
      const target = solarTerms.find((t) => t.id === suggestedTermId)!;
      text = `【香灵寄语】\n\n夏虫鸣蝉，熏风送燥。在这个阳光酷烈的时序里，香灵知你心中亦有琐碎微火在悄然燃烧。\n\n此时，最宜移步曲径松林，焚上一卷带有清凉薄荷的**「${target.incenseName}」**。正如香山居士所云：\n> *“热散由心静，凉生自室空。”*\n\n让桉树与干松针的孤特冷意穿透胸腔，平顺呼吸。内心的凉意生出，外在的心火自然消弭。`;
    } else if (
      matchesDemoKeyword(message, ['好冷', '寒冷', '冰凉', '冬夜', '下雪', '孤独', '难过', '难受'])
    ) {
      suggestedTermId = 'daxue';
      const target = solarTerms.find((t) => t.id === suggestedTermId)!;
      text = `【香灵寄语】\n\n朔风如割，万山寂凉，看你打出的字句，仿佛指尖都沾染了寒白。\n\n香灵早早便为你重温了红泥小火炉，点燃了一线温暖甘甜的**「${target.incenseName}」**。今夜我们暂且拨弄炭火，醉看落叶闲逸，听凭世事大雪纷飞：\n> *“晚来天欲雪，能饮一杯无？”*\n\n这微醺的朗姆酒与安息香气，会化作最贴切厚暖的软袭，陪护你一整场冬夜好梦。`;
    } else {
      text = `【香灵寄语】\n\n朋友好雅致。在这个浮华喧闹的红尘里，能有此仙缘与你一同展开《廿四香笺》，实是一桩让人心生雀跃的美事。\n\n当下正值**「${activeTerm.name}」**美景。这案上的**「${activeTerm.incenseName}」**，前调清冽带有${activeTerm.scentProfile.topNotes.slice(0, 2).join('与')}之趣，后调又见${activeTerm.scentProfile.baseNotes[0]}之沉。正如古人所云：\n\n> *“${activeTerm.poem.content[0]}”*\n\n你今天过得怡然吗？还是有什么隐秘的身心感触，想跟香灵说说？。`;
    }

    res.json({ text, suggestedTermId, source: 'demo' as const });
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      base: basePath ? `${basePath}/` : '/',
      server: { middlewareMode: true },
      appType: 'custom',
    });
    router.use(vite.middlewares);
    router.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(
          path.resolve(serverDir, 'index.html'),
          'utf-8'
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // server.cjs 与 index.html、assets/ 同在 dist/ 目录
    const distDir = serverDir;
    router.use(express.static(distDir));
    router.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  if (basePath) {
    app.use(basePath, router);
    app.get(basePath, (_req, res) => res.redirect(301, `${basePath}/`));
  } else {
    app.use(router);
  }

  const port = Number(process.env.PORT) || 3000;
  const cwd = process.cwd();
  app.listen(port, '0.0.0.0', () => {
    const status = getLlmRuntimeStatus();
    const publicUrl = basePath
      ? `http://0.0.0.0:${port}${basePath}/`
      : `http://0.0.0.0:${port}/`;
    console.log(`[廿四香笺] ${publicUrl}`);
    if (status.mode === 'live') {
      console.log(
        `[LLM] 通义千问已连接 model=${status.model} key=${status.keyHint}`
      );
    } else {
      console.log(
        `[LLM] 演示模式 — 请在以下任一位置配置 DASHSCOPE_API_KEY 后重启：\n` +
          `       ${path.join(projectRoot, '.env')}\n` +
          `       ${path.join(serverDir, '.env')}\n` +
          `       ${path.join(cwd, '.env')}`
      );
    }
  });
}

startServer().catch((e) => {
  console.error('Failed to start combined server:', e);
});
