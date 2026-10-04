export const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Hackathon: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  Workshop: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  Conference: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  Sports: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  Cultural: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Other: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' }
};

export const getEventColor = (type: string) => {
  return EVENT_COLORS[type] || EVENT_COLORS.Other;
};
