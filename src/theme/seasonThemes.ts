import { hexToRgba } from '../utils/color';

export type LayoutTheme = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ThemeStyles {
  bodyBg: string;
  headerBg: string;
  headerText: string;
  headerSubtitle: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  presetBtn: string;
  chatBubbleAgent: string;
  chatBubbleUser: string;
  activeTermButton: string;
  inactiveTermButton: string;
  glowStyle: { boxShadow: string };
  textColorAccent: string;
  borderColorAccent: string;
  bulletTag: string;
  systemBanner: string;
  tabBg: string;
  tabItemActiveBg: string;
  tabItemInactiveText: string;
  tabContentBg: string;
  contentCardBg: string;
  contentCardBorder: string;
  textColorMain: string;
  textColorSecondary: string;
  poemCardBg: string;
  poemCardBorder: string;
  poemScrollLineColor: string;
  poemTextColor: string;
  borderDivider: string;
  isLight: boolean;
}

export function getThemeStyles(layoutTheme: LayoutTheme, termColor: string): ThemeStyles {
  if (layoutTheme === 'spring') {
    return {
      bodyBg: 'bg-[#fafdfa] text-stone-800 selection:bg-emerald-100 selection:text-emerald-950',
      headerBg: 'bg-[#fafdfa]/95 border-emerald-900/10 text-stone-800 shadow-sm',
      headerText: 'text-emerald-950 font-bold font-serif',
      headerSubtitle: 'text-emerald-700/80',
      cardBg: 'bg-[#fafdfa]/90 border-[#cce7cd] backdrop-blur-md text-stone-800 shadow-[0_4px_24px_rgba(34,197,94,0.02)]',
      cardBorder: 'border-[#cce7cd]',
      inputBg: 'bg-white border-[#b7dfb9] text-[#1b3d21] placeholder-stone-405 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500',
      presetBtn: 'bg-[#ecf7ed] border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/70 text-emerald-800',
      chatBubbleAgent: 'bg-[#edf9ec]/95 border-[#cfead1] text-[#204a25]',
      chatBubbleUser: 'bg-[#fbf4e8]/90 border-[#ebd8bc] text-[#714f24]',
      activeTermButton: 'bg-white border-emerald-600 text-emerald-800 shadow-sm font-semibold',
      inactiveTermButton: 'bg-white/50 border-emerald-900/10 text-stone-500 hover:text-emerald-850 hover:border-emerald-300',
      glowStyle: { boxShadow: `0 10px 30px -4px ${hexToRgba(termColor, 0.22)}` },
      textColorAccent: 'text-emerald-800',
      borderColorAccent: 'border-emerald-200',
      bulletTag: 'bg-emerald-50/60 border-emerald-100 text-[#1b4322]',
      systemBanner: 'bg-[#edf7eb] border-[#daecd7] text-[#183d1e]',
      tabBg: 'bg-emerald-100/40 border-emerald-250/50',
      tabItemActiveBg: 'bg-white text-emerald-900 shadow-sm',
      tabItemInactiveText: 'text-emerald-750/70 hover:text-emerald-800',
      tabContentBg: 'bg-[#f9fdfa]/90',
      contentCardBg: 'bg-[#edf9ec]/60 border-[#cfead1]',
      contentCardBorder: 'border-[#cfead1]',
      textColorMain: 'text-stone-800',
      textColorSecondary: 'text-stone-650',
      poemCardBg: 'bg-[#f4fbf3] border-[#cfead1]',
      poemCardBorder: 'border-[#cfead1]',
      poemScrollLineColor: 'bg-[#b7dfb9]/50',
      poemTextColor: 'text-[#1e3f24]',
      borderDivider: 'border-[#daecd7]',
      isLight: true,
    };
  }
  if (layoutTheme === 'summer') {
    return {
      bodyBg: 'bg-[#061112] text-teal-100 selection:bg-teal-850 selection:text-white',
      headerBg: 'bg-stone-950/80 border-teal-900/40 text-teal-200',
      headerText: 'text-teal-100',
      headerSubtitle: 'text-teal-400/60',
      cardBg: 'bg-[#101b1c]/80 backdrop-blur-md border-[#1a3739]/80 text-[#cfd9dc]',
      cardBorder: 'border-[#1a3739]/80',
      inputBg: 'bg-[#081012] border-[#183133] text-teal-200 placeholder-teal-800 focus:border-teal-400',
      presetBtn: 'bg-teal-950/40 border-teal-900/60 text-teal-400 hover:text-teal-200 hover:border-teal-450',
      chatBubbleAgent: 'bg-[#0c1f21] border-[#1b3e40] text-teal-100',
      chatBubbleUser: 'bg-[#2a1d0f]/80 border-[#543b1e]/30 text-[#e9cca0]',
      activeTermButton: 'bg-[#122426] border-teal-500 text-teal-300',
      inactiveTermButton: 'bg-[#0b1315]/80 border-teal-950/85 text-teal-600/80 hover:text-teal-400 hover:border-teal-900',
      glowStyle: { boxShadow: `0 10px 32px -6px ${hexToRgba(termColor, 0.25)}` },
      textColorAccent: 'text-teal-400',
      borderColorAccent: 'border-teal-900/50',
      bulletTag: 'bg-[#122426] border-teal-950 text-teal-400',
      systemBanner: 'bg-[#0b1c1d] border-[#132c2e] text-teal-450 font-serif',
      tabBg: 'bg-stone-950/40 border-teal-950',
      tabItemActiveBg: 'bg-[#122426] text-teal-300 shadow-sm border border-teal-900/35',
      tabItemInactiveText: 'text-[#2e7478] hover:text-teal-400',
      tabContentBg: 'bg-stone-950/20',
      contentCardBg: 'bg-[#132325]/70 border-[#203a3d]',
      contentCardBorder: 'border-[#203a3d]',
      textColorMain: 'text-[#cfd9dc]',
      textColorSecondary: 'text-[#87acb0]',
      poemCardBg: 'bg-[#112123] border-[#1d383b]',
      poemCardBorder: 'border-[#1d383b]',
      poemScrollLineColor: 'bg-[#1b4347]',
      poemTextColor: 'text-teal-250',
      borderDivider: 'border-teal-950/65',
      isLight: false,
    };
  }
  if (layoutTheme === 'autumn') {
    return {
      bodyBg: 'bg-[#faf5eb] text-stone-850 selection:bg-amber-100 selection:text-[#321703]',
      headerBg: 'bg-[#faf6ee]/95 border-[#dfd2be] text-stone-800 shadow-sm',
      headerText: 'text-amber-950 font-serif font-bold',
      headerSubtitle: 'text-[#8c5932]',
      cardBg: 'bg-[#fcfaf5]/95 border-[#e6d8c0] text-stone-800 shadow-[0_4px_24px_rgba(113,87,55,0.03)]',
      cardBorder: 'border-[#e6d8c0]',
      inputBg: 'bg-white border-[#ebdcc1] text-stone-850 placeholder-stone-400 focus:border-amber-700',
      presetBtn: 'bg-[#f5ead6] border-[#dfcea9] hover:bg-[#ebdcc1] text-amber-900',
      chatBubbleAgent: 'bg-[#f4e6ce]/95 border-[#e7d2af] text-stone-900',
      chatBubbleUser: 'bg-[#faf1e1]/90 border-[#f1e0be] text-amber-950',
      activeTermButton: 'bg-white border-amber-600 text-[#8a521e] shadow-sm font-semibold',
      inactiveTermButton: 'bg-[#f8f2e7]/80 border-[#ebd2a8]/40 text-stone-500 hover:text-[#8a521e] hover:border-amber-600/40',
      glowStyle: { boxShadow: `0 8px 30px -4px ${hexToRgba(termColor, 0.28)}` },
      textColorAccent: 'text-[#9e5c1e]',
      borderColorAccent: 'border-[#dfcca0]',
      bulletTag: 'bg-[#f5e9d2] border-[#e6d3af] text-amber-950',
      systemBanner: 'bg-[#ebdcb9]/40 border-[#dfcaa4] text-[#7d512a]',
      tabBg: 'bg-[#efe3cc]/50 border-[#dfcaa1]/80',
      tabItemActiveBg: 'bg-white text-amber-900 shadow-sm border border-amber-900/10',
      tabItemInactiveText: 'text-[#7d512a]/70 hover:text-amber-900',
      tabContentBg: 'bg-[#fcfbf7]/90',
      contentCardBg: 'bg-[#f5ead5]/70 border-[#e7d2af]',
      contentCardBorder: 'border-[#e7d2af]',
      textColorMain: 'text-stone-850',
      textColorSecondary: 'text-[#704e31]',
      poemCardBg: 'bg-[#f5ead6] border-[#dfca9f]',
      poemCardBorder: 'border-[#dfca9f]',
      poemScrollLineColor: 'bg-[#dfca9f]/60',
      poemTextColor: 'text-amber-950',
      borderDivider: 'border-[#ebdcc1]',
      isLight: true,
    };
  }
  return {
    bodyBg: 'bg-[#edf2f6] text-slate-800 selection:bg-[#f6e5e8] selection:text-slate-900',
    headerBg: 'bg-white/95 border-slate-200 text-slate-850 shadow-sm',
    headerText: 'text-slate-950 font-bold font-serif',
    headerSubtitle: 'text-slate-500',
    cardBg: 'bg-white/90 border-[#cfdbe5] backdrop-blur-md text-slate-800 shadow-[0_4px_24px_rgba(148,163,184,0.03)]',
    cardBorder: 'border-[#cfdbe5]',
    inputBg: 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#a13b48]',
    presetBtn: 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-[#a13b48]',
    chatBubbleAgent: 'bg-[#f0f4f8]/95 border-slate-200 text-slate-900',
    chatBubbleUser: 'bg-[#fbebee]/90 border-[#f3d4d8] text-[#912d3b]',
    activeTermButton: 'bg-white border-[#a13b48] text-[#a13b48] shadow-sm font-semibold',
    inactiveTermButton: 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-350',
    glowStyle: { boxShadow: `0 8px 28px -4px ${hexToRgba(termColor, 0.18)}` },
    textColorAccent: 'text-[#a13b48]',
    borderColorAccent: 'border-slate-250',
    bulletTag: 'bg-slate-100/50 border-slate-200 text-slate-650',
    systemBanner: 'bg-slate-100/90 border-slate-200 text-slate-600',
    tabBg: 'bg-slate-100/80 border-slate-200',
    tabItemActiveBg: 'bg-white text-slate-900 shadow-sm border border-slate-200',
    tabItemInactiveText: 'text-slate-500 hover:text-slate-850',
    tabContentBg: 'bg-white/95',
    contentCardBg: 'bg-[#f1f6fa]/85 border-[#d2dfeb]',
    contentCardBorder: 'border-[#d2dfeb]',
    textColorMain: 'text-slate-850',
    textColorSecondary: 'text-slate-600',
    poemCardBg: 'bg-[#f8fafc] border-slate-250',
    poemCardBorder: 'border-slate-250',
    poemScrollLineColor: 'bg-slate-300/50',
    poemTextColor: 'text-slate-900',
    borderDivider: 'border-slate-200',
    isLight: true,
  };
}
