export type BasicIntent = 'NEXT' | 'PREV' | `TIMESTAMP ${number}` | `STEP${number}` | 'EXTRA';

export function parseIntent(raw: string | undefined): BasicIntent {
  const key = (raw ?? '').trim().toUpperCase();

  if (key === 'NEXT') return 'NEXT';
  if (key === 'PREV') return 'PREV';
  if (/^TIMESTAMP\s+\d+$/.test(key)) return key as BasicIntent;
  if (/^STEP\d+$/.test(key)) return key as BasicIntent;

  return 'EXTRA';
}
