import React from 'react';
import { Send, RefreshCw, ChevronRight, MessageSquareOff } from 'lucide-react';
import { solarTerms } from '../solarTermsData';
import { ChatMessage, LlmStatus } from '../types';
import { ThemeStyles } from '../theme/seasonThemes';
import { hexToRgba } from '../utils/color';
import { CHAT_PRESETS } from '../hooks/useChat';

export const CHAT_DRAWER_WIDTH_PX = 420;

interface ChatDrawerProps {
  isExpanded: boolean;
  onClose: () => void;
  styles: ThemeStyles;
  termColor: string;
  activeTermId: string;
  llmStatus: LlmStatus | null;
  messages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  isChatPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onSelectSuggestedTerm: (termId: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  chatInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isExpanded,
  onClose,
  styles,
  termColor,
  activeTermId,
  llmStatus,
  messages,
  chatInput,
  onChatInputChange,
  isChatPending,
  onSubmit,
  onReset,
  onSelectSuggestedTerm,
  chatEndRef,
  chatInputRef,
}) => (
  <div
    className={`fixed z-[60] transition-opacity duration-300 ease-out ${
      isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
    } inset-0 lg:inset-auto lg:top-0 lg:right-0 lg:h-[100dvh] lg:w-[var(--drawer-w,420px)] lg:opacity-100 lg:pointer-events-none`}
    aria-hidden={!isExpanded}
  >
    <button
      type="button"
      className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px] cursor-pointer lg:hidden"
      onClick={onClose}
      aria-label="关闭对话抽屉"
    />
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-drawer-title"
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto absolute top-0 right-0 flex h-[100dvh] w-full max-w-[420px] flex-col border-l shadow-2xl transition-transform duration-300 ease-out pt-[env(safe-area-inset-top)] lg:relative lg:w-full lg:max-w-none lg:shadow-[-8px_0_32px_rgba(0,0,0,0.12)] ${styles.cardBg} ${styles.cardBorder} ${
        isExpanded ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className={`shrink-0 p-4 border-b ${styles.cardBorder} bg-stone-950/20 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border shadow-inner transition-colors duration-1000"
              style={{
                backgroundColor: termColor,
                borderColor: hexToRgba(termColor, 0.3),
              }}
            >
              <span className="font-serif text-sm text-stone-900 font-bold">芳</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-300 dark:border-[#16171c]" />
          </div>
          <div>
            <h3 id="chat-drawer-title" className={`text-xs font-serif font-bold ${styles.textColorMain}`}>
              芳华香灵 · 客斋
            </h3>
            <span className="text-[10px] text-stone-500 block transition-colors duration-1000">
              {llmStatus?.mode === 'live'
                ? `通义千问 · ${llmStatus.model}`
                : llmStatus?.mode === 'demo'
                  ? '本地演示模式（未配置 API Key）'
                  : '四时心愈顾问 · 在线研读'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onReset}
            className={`text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-sans text-xs flex items-center gap-1 bg-stone-900/10 px-2.5 py-1 rounded-lg border ${styles.cardBorder} cursor-pointer transition-colors duration-1000`}
            title="重置香灵对话，拂平香屑"
          >
            <RefreshCw size={11} />
            <span>拂尘重新</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`text-stone-500 hover:text-stone-850 dark:hover:text-stone-300 font-sans text-xs flex items-center justify-center bg-stone-900/10 p-1.5 rounded-lg border ${styles.cardBorder} cursor-pointer transition-colors duration-1000`}
            title="收起/关闭此对话模块"
          >
            <MessageSquareOff size={11} />
          </button>
        </div>
      </div>

      {llmStatus?.mode === 'demo' && (
        <div className="shrink-0 mx-3 mt-2 px-3 py-2 rounded-lg border border-amber-600/40 bg-amber-950/15 text-[10px] text-amber-800 dark:text-amber-200 font-sans leading-relaxed">
          当前为<strong>演示回复</strong>（服务端未配置通义千问密钥）。请在运行环境设置{' '}
          <code className="font-mono text-[9px]">DASHSCOPE_API_KEY</code> 后重启，详见项目 deploy/README.md。
        </div>
      )}

      <div className={`shrink-0 px-4 py-2 border-b ${styles.cardBorder} ${styles.systemBanner} shadow-inner transition-colors duration-1000`}>
        <span className="text-[10px] font-serif block opacity-78">您可以用这些心境短语敲门：</span>
        <div className="flex flex-wrap gap-1.5 mt-1.5 pb-1" role="group" aria-label="快捷提问">
          {CHAT_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChatInputChange(p.request)}
              className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer transition-all duration-1000 ${
                styles.isLight
                  ? 'bg-white hover:bg-stone-100 border border-[#dfd9cb] text-stone-600 hover:text-stone-900'
                  : 'bg-stone-900 border border-stone-800/80 hover:border-teal-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`min-h-0 flex-1 p-4 overflow-y-auto overscroll-contain space-y-4 relative transition-colors duration-1000 ${styles.isLight ? 'bg-[#fcfaf4]/50 font-sans' : 'bg-stone-950/20 font-sans'}`}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-serif text-xs select-none ${
                  isAgent
                    ? 'bg-gradient-to-br from-amber-950 to-amber-750 text-stone-100 border border-amber-650/30'
                    : 'bg-stone-300 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-400/30 dark:border-stone-700'
                }`}
              >
                {isAgent ? '芳' : '客'}
              </div>
              <div className="space-y-2">
                <div
                  className={`px-3 py-2.5 rounded-2xl text-xs leading-relaxed font-sans border shadow-sm ${
                    isAgent ? styles.chatBubbleAgent : styles.chatBubbleUser
                  }`}
                >
                  <div className="space-y-1.5 whitespace-pre-wrap text-justify">
                    {msg.text.split('\n').map((line, lidx) => {
                      if (line.startsWith('>')) {
                        return (
                          <blockquote
                            key={lidx}
                            className="border-l-2 border-[#b8a688] pl-2.5 py-0.5 italic my-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-serif bg-stone-900/10"
                          >
                            {line.replace(/^>\s*/, '')}
                          </blockquote>
                        );
                      }
                      if (line.includes('**')) {
                        const parsed = line.split('**');
                        return (
                          <p key={lidx}>
                            {parsed.map((chunk, cidx) =>
                              cidx % 2 === 1 ? (
                                <strong key={cidx} className="text-amber-700 dark:text-[#ebd1a0] font-bold">
                                  {chunk}
                                </strong>
                              ) : (
                                chunk
                              ),
                            )}
                          </p>
                        );
                      }
                      return <p key={lidx}>{line}</p>;
                    })}
                  </div>

                  {msg.suggestedTermId && msg.suggestedTermId !== activeTermId && (
                    <div
                      className={`mt-3.5 pt-2.5 border-t flex flex-col gap-2 ${styles.isLight ? 'border-amber-900/10' : 'border-stone-850/30'}`}
                    >
                      <span className="text-[10px] text-stone-500 font-sans italic">
                        香灵感知您的心情更契合 ──{' '}
                        <strong>{solarTerms.find((t) => t.id === msg.suggestedTermId)?.name}</strong> 节气的呼吸：
                      </span>
                      <button
                        type="button"
                        onClick={() => msg.suggestedTermId && onSelectSuggestedTerm(msg.suggestedTermId)}
                        className="bg-amber-900/15 hover:bg-amber-900/25 border border-amber-800/20 text-amber-900 dark:text-[#ecebe6] px-3 py-1.5 rounded-lg text-[10px] cursor-pointer font-serif flex items-center justify-between transition-colors w-full"
                      >
                        <span>
                          瞬息投奔「{solarTerms.find((t) => t.id === msg.suggestedTermId)?.name}」香气意境
                        </span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isChatPending && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
            <div className="w-7 h-7 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center font-serif text-xs text-stone-400">
              芳
            </div>
            <div className={`px-3 py-2 rounded-2xl border text-[11px] font-serif ${styles.chatBubbleAgent}`}>
              香灵正在抚琴研香，请宽坐片刻...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className={`shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t flex gap-2 items-center transition-colors duration-1000 ${
          styles.isLight ? 'bg-[#f4efe4] border-[#e2dcd0]' : 'bg-stone-950 border-stone-800'
        }`}
      >
        <input
          ref={chatInputRef}
          type="text"
          placeholder={isChatPending ? '琴声清润，请待其答复...' : '与香灵诉说心愿、烦郁或考问诗香...'}
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          disabled={isChatPending}
          aria-label="对话输入"
          className={`flex-1 ${styles.inputBg} border rounded-xl py-2 px-3 text-xs focus:outline-none disabled:opacity-50 transition-colors duration-1000`}
        />
        <button
          type="submit"
          disabled={isChatPending || !chatInput.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700 text-stone-200 hover:text-white disabled:opacity-30 disabled:from-stone-900 disabled:to-stone-900 transition-all cursor-pointer flex items-center justify-center border border-amber-850/15"
          title="发送致意"
          aria-label="发送消息"
        >
          <Send size={14} />
        </button>
      </form>
    </aside>
  </div>
);
