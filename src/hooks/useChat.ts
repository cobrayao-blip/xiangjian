import { useState, useEffect, useRef, useCallback } from 'react';
import { solarTerms } from '../solarTermsData';
import { ChatMessage, LlmStatus } from '../types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'm-init',
  sender: 'agent',
  text: '折花相赠，见香如面。朋友，我是《廿四香笺》的香灵“芳华”。此间窗明几净，炉温尚存。不知您今日身心安好？若有半点疲惫与烦闷，尽可跟芳华语笑寒温，我将以四时的草木芬菲与温润诗词，为您拂去凡尘烦忧。',
  timestamp: new Date(),
};

export const CHAT_PRESETS = [
  { label: '疲劳安神', request: '今天项目劳累了一整天，感觉心神不定，好累啊...' },
  { label: '内心郁结', request: '生活好繁杂，感觉焦虑闷气，有推荐的清心静香和诗词吗？' },
  { label: '冬夜温暖', request: '天冷的时候感觉有些孤独，想在窗边温酒围炉，聊聊古典浪漫' },
];

export function useChat(
  activeTermId: string,
  onSuggestedTermChange: (termId: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [chatInput, setChatInput] = useState('');
  const [isChatPending, setIsChatPending] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [llmStatus, setLlmStatus] = useState<LlmStatus | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatPending]);

  useEffect(() => {
    const apiBase = `${import.meta.env.BASE_URL}`.replace(/\/?$/, '/');
    fetch(`${apiBase}api/llm/status`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LlmStatus | null) => {
        if (data?.mode) setLlmStatus(data);
      })
      .catch(() => setLlmStatus(null));
  }, []);

  useEffect(() => {
    if (!isChatExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsChatExpanded(false);
    };
    const mq = window.matchMedia('(max-width: 1023px)');
    const syncScrollLock = () => {
      document.body.style.overflow = mq.matches ? 'hidden' : '';
    };
    syncScrollLock();
    mq.addEventListener('change', syncScrollLock);
    window.addEventListener('keydown', onKey);
    chatInputRef.current?.focus();
    return () => {
      mq.removeEventListener('change', syncScrollLock);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isChatExpanded]);

  const resetMessages = useCallback(() => {
    setMessages([
      {
        id: `m-reset-${Date.now()}`,
        sender: 'agent',
        text: '画卷重开，香屑拂净。芳华在此，朋友可有任何心结郁闷？今天也想跟芳华探讨哪一个节气的香调配伍呢？',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatPending) return;

    setIsChatExpanded(true);
    const userMsgText = chatInput.trim();
    const newMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date(),
    };

    let updatedMessages: ChatMessage[] = [];
    setMessages((prev) => {
      updatedMessages = [...prev, newMsg];
      return updatedMessages;
    });
    setChatInput('');
    setIsChatPending(true);

    const chatHistory = updatedMessages.slice(0, -1).slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/qwen/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: chatHistory,
          currentTermId: activeTermId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail =
          typeof data?.error === 'string'
            ? data.error
            : typeof data?.text === 'string'
              ? data.text
              : 'API request failed';
        throw new Error(detail);
      }

      if (data.source === 'demo') {
        console.warn('[chat] 当前为本地演示回复，非大模型');
      }

      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        text: data.text || '小笺微湿，风动尘封。香灵刚才有一刹那思绪游离，还望朋友不吝海涵。',
        timestamp: new Date(),
        suggestedTermId: data.suggestedTermId || undefined,
      };

      setMessages((prev) => [...prev, agentMsg]);

      if (data.suggestedTermId && data.suggestedTermId !== activeTermId) {
        const potentialTerm = solarTerms.find((t) => t.id === data.suggestedTermId);
        if (potentialTerm) {
          setTimeout(() => onSuggestedTermChange(potentialTerm.id), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : '';
      const isNetwork =
        detail.includes('Failed to fetch') ||
        detail.includes('NetworkError') ||
        detail.includes('fetch');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'agent',
          text: isNetwork
            ? '【琴弦忽凝】未能连上对话服务。请确认使用 `npm run dev` 启动，并访问终端里显示的地址（默认 http://localhost:3000），不要单独开 Vite 端口。'
            : `【琴弦忽凝，暂难听香】${detail || '远方的山岚笼罩了一层迷雾。'}此时，不妨且抚长烟，深吸一束静木之香。`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsChatPending(false);
    }
  };

  return {
    messages,
    chatInput,
    setChatInput,
    isChatPending,
    isChatExpanded,
    setIsChatExpanded,
    llmStatus,
    chatEndRef,
    chatInputRef,
    handleSendMessage,
    resetMessages,
  };
}
