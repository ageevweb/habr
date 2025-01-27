export interface ISuggestion {
  id: string;
  type: 'user' | 'company';
  avatar: string | null;
  name?: string;
  alias: string;
}

export interface ISuggestionResponse {
  data: ISuggestion[];
}