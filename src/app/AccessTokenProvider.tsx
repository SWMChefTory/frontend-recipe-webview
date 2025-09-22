import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccessTokenContextType = { token: string | null };

export const AccessTokenContext = createContext<AccessTokenContextType>({ token: null });

export const useAccessToken = (): string | null => {
  return useContext(AccessTokenContext).token;
};

export const AccessTokenProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [token, setToken] = useState<string | null>('Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4Zjg4ZDI4YS04NzEwLTQxOWItOGUxOC1kNjQwM2ViZTBlYzEiLCJ0eXBlIjoiJHtKV1RfQUNDRVNTX1RPS0VOX1RZUEV9IiwiaWF0IjoxNzU4NDYwOTgwLCJleHAiOjE3NTg0NjEyODB9.vzjwLrFp7xPKURnkkniWt5urkw8o39puf2m0Bzcwx1VHLZOBT-5i9IOXIKjIDv5X5-InZXKNoNpy39nTx4vflw');

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
