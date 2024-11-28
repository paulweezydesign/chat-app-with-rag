export interface Document {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export interface SearchResult {
  text: string;
  metadata: Record<string, any>;
  score: number;
}