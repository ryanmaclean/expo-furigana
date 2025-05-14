export type Translation = {
  id: string;
  english: string;
  japanese: string;
  furigana: Array<string | [string, string]>;
  timestamp: number;
  isFavorite: boolean;
};