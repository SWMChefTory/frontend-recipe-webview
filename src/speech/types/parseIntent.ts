export type BasicIntent =
  | 'NEXT'
  | 'PREV'
  | `TIMESTAMP ${number}`
  | `STEP ${number}`
  | 'EXTRA'
  | 'TIMER'
  | 'TIMER START'
  | 'TIMER STOP'
  | 'TIMER CHECK'
  | `TIMER SET ${number}`;

export function parseIntent(raw: string | undefined): BasicIntent {
  const key = (raw ?? '').trim().toUpperCase();

  if (key === 'NEXT') return 'NEXT';
  if (key === 'PREV') return 'PREV';
  if (/^TIMESTAMP\s+\d+$/.test(key)) return key as BasicIntent;
  if (/^STEP\s+\d+$/.test(key)) return key as BasicIntent;
  if (/^TIMER\s+START$/.test(key)) return 'TIMER START';
  if (/^TIMER\s+STOP$/.test(key)) return 'TIMER STOP';
  if (/^TIMER\s+CHECK$/.test(key)) return 'TIMER CHECK';
  if (/^TIMER\s+SET\s+\d+$/.test(key)) return key as BasicIntent;

  return 'EXTRA';
}
