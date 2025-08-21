
export type Provider = 'google';

export interface Model {
  id: string;
  name: string;
  provider: Provider;
}

export type AppStatus = 'idle' | 'loading' | 'streaming' | 'error';
