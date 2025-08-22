
export type Provider = 'google';

export interface Model {
  id: string;
  name: string;
  provider: Provider;
}

export type AppStatus = 'idle' | 'loading' | 'streaming' | 'error';

export type TableRow = Record<string, string>;

export type TableData = {
  headers: string[];
  rows: TableRow[];
};
