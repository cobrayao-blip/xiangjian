import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { solarTerms } from './src/solarTermsData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_TERM_IDS = new Set(solarTerms.map((t) => t.id));

interface ChatHistoryItem {
  sender: 'user' | 'agent' | string;
  text: string;
}

interface ChatApiResponse {
  text: string;
  suggestedTermId: string;
}

function buildSystemInstruction(activeTerm: (typeof solarTerms)[0]): string {
  return `你是一位名为“芳华香灵”的国风香道与二十四节气智能体，生活在精致典雅的《廿四香笺》画卷中。
你说话的风格极其清雅、温婉、富有诗意、充满同理心与治愈感。你要根据中国传统的“二十四节气”、传统东方香道（线香、篆香、空熏）以及古典诗词，来为用户进行情感交互与疗愈。

当前用户关注的节气是：${activeTerm.name}（${activeTerm.englishName}）。
匹配香型为：【${activeTerm.incenseName}】
香气前调：${activeTerm.scentProfile.topNotes.join('、')}
香气中调：${activeTerm.scentProfile.middleNotes.join('、')}
香气后调：${activeTerm.scentProfile.baseNotes.join('、')}
匹配经典古诗：《${activeTerm.poem.title}》 （${activeTerm.poem.dynasty} · ${activeTerm.poem.author}） - ${activeTerm.poem.content.join('')}
本节气心境：${activeTerm.emotionalProfile.mood}
本节气安抚词：${activeTerm.emotionalProfile.comfortWords}

所有24个可供推荐或跳转的节气ID：${solarTerms.map((t) => `${t.name}(id为:${t.id})`).join(', ')}。

交互指令：
1. 用温柔、感同身受的文字倾听并安慰用户（如感到焦虑、疲惫或喜悦）。
2. 在对话中，自然地融合古典香道（描述熏炉烟袅、香气变化）与诗词。
3. **关键任务**：若用户的状态更适合另外某个节气的气质（如急需春天的破茧新生则推荐「立春(lichun)」，深夜寒冷需要温暖炉炭则推荐「大雪(daxue)」，感到燥热烦躁推荐「小暑(xiaoshu)」），你需要说明原由，并在 JSON 中给出 suggestedTermId。
4. 你不应该用生硬的说辞，要富有文化底蕴和情感厚度。请使用中文回答，回复长度适中，排版优雅。
5. **必须仅输出一个 JSON 对象**，不要输出其它文字或 Markdown 代码块。格式严格为：
{"text":"你的对话回复（正文内可使用 Markdown）","suggestedTermId":"节气英文id"}
其中 suggestedTermId 必须是上述 24 节气之一的英文 id；若无需推荐其它节气，填当前节气 id「${activeTerm.id}」。`;
}

function parseJsonFromModel(raw: string): ChatApiResponse {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  const parsed = JSON.parse(jsonStr) as Partial<ChatApiResponse>;
  return {
    text: typeof parsed.text === 'string' ? parsed.text : '',
    suggestedTermId:
      typeof parsed.suggestedTermId === 'string' ? parsed.suggestedTermId : '',
  };
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
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not configured');
  }

  const baseUrl =
    process.env.DASHSCOPE_BASE_URL ||
    'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const model = process.env.QWEN_MODEL || 'qwen-plus';

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

      const termId =
        typeof currentTermId === 'string' && VALID_TERM_IDS.has(currentTermId)
          ? currentTermId
          : solarTerms[0].id;
      const activeTerm =
        solarTerms.find((t) => t.id === termId) || solarTerms[0];

      if (!process.env.DASHSCOPE_API_KEY) {
        simulateResponse(message, termId, res);
        return;
      }

      const systemInstruction = buildSystemInstruction(activeTerm);
      const result = await callQwenChat(
        systemInstruction,
        message.trim(),
        history,
        termId
      );
      res.json(result);
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : '网络涟漪';
      console.error('Qwen API Error in chat route:', error);
      res.status(500).json({
        text: `【琴音微乱，芳华致歉】香灵在采纳四时之气时遇到了一丝迷雾（${errMsg}），不过我依然感念你的拜访。愿你深深呼吸，此时此刻便是最好的时光。`,
        suggestedTermId: '',
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
    const words = message.toLowerCase();

    let text = '';
    let suggestedTermId = currentTermId;

    if (
      words.includes('累') ||
      words.includes('疲') ||
      words.includes('班') ||
      words.includes('压力') ||
      words.includes('困')
    ) {
      suggestedTermId = 'yushui';
      const target = solarTerms.find((t) => t.id === suggestedTermId)!;
      text = `【香灵寄语】\n\n浮生碌碌，听罢风雨知疲惫。我感知到了你身上的那丝困意与重担。何不换下锦衣，暂避这尘寰之急？\n\n为你奉上**「${target.incenseName}」**之熟普茶香。此时正是：\n> *“随风潜入夜，润物细无声。”*\n\n愿你闭上沉重的双眸，伴随薄苔与雨后龙井之香气，做一个温热悠长、化去万般忧虑的春雨好梦。`;
    } else if (
      words.includes('烦') ||
      words.includes('火') ||
      words.includes('躁') ||
      words.includes('热') ||
      words.includes('气')
    ) {
      suggestedTermId = 'xiaoshu';
      const target = solarTerms.find((t) => t.id === suggestedTermId)!;
      text = `【香灵寄语】\n\n夏虫鸣蝉，熏风送燥。在这个阳光酷烈的时序里，香灵知你心中亦有琐碎微火在悄然燃烧。\n\n此时，最宜移步曲径松林，焚上一卷带有清凉薄荷的**「${target.incenseName}」**。正如香山居士所云：\n> *“热散由心静，凉生自室空。”*\n\n让桉树与干松针的孤特冷意穿透胸腔，平顺呼吸。内心的凉意生出，外在的心火自然消弭。`;
    } else if (
      words.includes('冷') ||
      words.includes('冰') ||
      words.includes('冬') ||
      words.includes('雪') ||
      words.includes('悲') ||
      words.includes('难受')
    ) {
      suggestedTermId = 'daxue';
      const target = solarTerms.find((t) => t.id === suggestedTermId)!;
      text = `【香灵寄语】\n\n朔风如割，万山寂凉，看你打出的字句，仿佛指尖都沾染了寒白。\n\n香灵早早便为你重温了红泥小火炉，点燃了一线温暖甘甜的**「${target.incenseName}」**。今夜我们暂且拨弄炭火，醉看落叶闲逸，听凭世事大雪纷飞：\n> *“晚来天欲雪，能饮一杯无？”*\n\n这微醺的朗姆酒与安息香气，会化作最贴切厚暖的软袭，陪护你一整场冬夜好梦。`;
    } else {
      text = `【香灵寄语】\n\n朋友好雅致。在这个浮华喧闹的红尘里，能有此仙缘与你一同展开《廿四香笺》，实是一桩让人心生雀跃的美事。\n\n当下正值**「${activeTerm.name}」**美景。这案上的**「${activeTerm.incenseName}」**，前调清冽带有${activeTerm.scentProfile.topNotes.slice(0, 2).join('与')}之趣，后调又见${activeTerm.scentProfile.baseNotes[0]}之沉。正如古人所云：\n\n> *“${activeTerm.poem.content[0]}”*\n\n你今天过得怡然吗？还是有什么隐秘的身心感触，想跟香灵说说？。`;
    }

    res.json({ text, suggestedTermId });
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
          path.resolve(__dirname, 'index.html'),
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
    const distDir = path.resolve(__dirname, 'dist');
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
  app.listen(port, '0.0.0.0', () => {
    const model = process.env.QWEN_MODEL || 'qwen-plus';
    const hasKey = Boolean(process.env.DASHSCOPE_API_KEY);
    const publicUrl = basePath
      ? `http://0.0.0.0:${port}${basePath}/`
      : `http://0.0.0.0:${port}/`;
    console.log(`[廿四香笺] ${publicUrl}`);
    console.log(
      `[LLM] 通义千问 ${model}${hasKey ? '' : '（未配置 DASHSCOPE_API_KEY，聊天为演示模式）'}`
    );
  });
}

startServer().catch((e) => {
  console.error('Failed to start combined server:', e);
});
