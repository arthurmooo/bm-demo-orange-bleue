export type ScoreTone = 'hi' | 'mid' | 'lo';
export const scoreTone = (s: number): ScoreTone => (s >= 80 ? 'hi' : s >= 70 ? 'mid' : 'lo');
export type DeltaSense = 'good' | 'bad' | 'neutral';
