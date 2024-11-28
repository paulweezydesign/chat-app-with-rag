export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export interface SearchResult {
  text: string;
  metadata: Record<string, any>;
  score: number;
}