/** 二十四节气近似起始日（公历），用于按今日默认选中节气 */
const TERM_STARTS: { month: number; day: number; id: string }[] = [
  { month: 1, day: 5, id: 'xiaohan' },
  { month: 1, day: 20, id: 'dahan' },
  { month: 2, day: 3, id: 'lichun' },
  { month: 2, day: 18, id: 'yushui' },
  { month: 3, day: 5, id: 'jingzhe' },
  { month: 3, day: 20, id: 'chunfen' },
  { month: 4, day: 4, id: 'qingming' },
  { month: 4, day: 19, id: 'guyu' },
  { month: 5, day: 5, id: 'lixia' },
  { month: 5, day: 20, id: 'xiaoman' },
  { month: 6, day: 5, id: 'mangzhong' },
  { month: 6, day: 21, id: 'xiazhi' },
  { month: 7, day: 6, id: 'xiaoshu' },
  { month: 7, day: 22, id: 'dashu' },
  { month: 8, day: 7, id: 'liqiu' },
  { month: 8, day: 22, id: 'chushu' },
  { month: 9, day: 7, id: 'bailu' },
  { month: 9, day: 22, id: 'qiufen' },
  { month: 10, day: 8, id: 'hanlu' },
  { month: 10, day: 23, id: 'shuangjiang' },
  { month: 11, day: 7, id: 'lidong' },
  { month: 11, day: 22, id: 'xiaoxue' },
  { month: 12, day: 6, id: 'daxue' },
  { month: 12, day: 21, id: 'dongzhi' },
];

function dateKey(date: Date): number {
  return (date.getMonth() + 1) * 100 + date.getDate();
}

/** 根据公历日期返回当前所处节气 id */
export function getSolarTermIdForDate(date: Date = new Date()): string {
  const key = dateKey(date);
  let currentId = TERM_STARTS[TERM_STARTS.length - 1]!.id;
  for (const term of TERM_STARTS) {
    const startKey = term.month * 100 + term.day;
    if (key >= startKey) {
      currentId = term.id;
    }
  }
  return currentId;
}

/** 东八区「今日」用于时令判断 */
export function getTodayInShanghai(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  return new Date(y, m - 1, d);
}

export function formatTodayLabel(date: Date = getTodayInShanghai()): string {
  return date.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}
