import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccessTokenContextType = { token: string | null };

export const AccessTokenContext = createContext<AccessTokenContextType>({ token: null });

export const useAccessToken = (): string | null => {
  return useContext(AccessTokenContext).token;
};

export const AccessTokenProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [token, setToken] = useState<string | null>(
    'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxYzdiNGYwZC1kMzEzLTRiZDctYjYzZC0xMTJiNWM4ZDg4MjAiLCJ0eXBlIjoiJHtKV1RfUkVGUkVTSF9UT0tFTl9UWVBFfSIsImlhdCI6MTc1NzkwOTAxMywiZXhwIjoxNzU5MTE4NjEzfQ.9fmfBfCLlbRBH0XUF6MKO3Rru5Mc8zwvZNpg3c7kJdGu7vuFllpKyXR69qtBxL6Qqk8N_n1YSCsulLnuxlA1tg'
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let msg: unknown;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }

      if (
        typeof msg === 'object' &&
        msg !== null &&
        'type' in msg &&
        (msg as any).type === 'ACCESS_TOKEN' &&
        typeof (msg as any).token === 'string'
      ) {
        setToken((msg as any).token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <AccessTokenContext.Provider value={{ token }}>{children}</AccessTokenContext.Provider>;
};
