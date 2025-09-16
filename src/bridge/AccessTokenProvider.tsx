import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccessTokenContextType = { token: string | null };

export const AccessTokenContext = createContext<AccessTokenContextType>({ token: null });

export const useAccessToken = (): string | null => {
  return useContext(AccessTokenContext).token;
};

export const AccessTokenProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [token, setToken] = useState<string | null>("Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyYzdjMzFkNy1jODYxLTRkZWYtYmUwOC05NmRiYWJkN2NlZjEiLCJ0eXBlIjoiJHtKV1RfQUNDRVNTX1RPS0VOX1RZUEV9IiwiaWF0IjoxNzU4MDA4MjY5LCJleHAiOjE3NTgwMDg1Njl9.I11QgGbFEiT6gHudEPWMlP7kBwZVH7-ej5lwBMjpMXL7jn3rVBpbsNKpz4A4ZG-EX7OS_R8CdDx1ltl6Sf0qLg");

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
