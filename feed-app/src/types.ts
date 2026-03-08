export type Affinity = 'code' | 'musculation' | 'psychologie' | 'finances';

export interface AffinityConfig {
  id: Affinity;
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
}

export interface FeedCard {
  id: string;
  affinity: Affinity;
  title: string;
  content: string;
  keyPoints: string[];
  movies: Movie[];
  readTime: number;
  isLoading?: boolean;
}

export interface Movie {
  title: string;
  year: number;
  why: string;
}
