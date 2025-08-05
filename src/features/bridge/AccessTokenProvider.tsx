import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccessTokenContextType = { token: string | null };

export const AccessTokenContext = createContext<AccessTokenContextType>({ token: null });

export const useAccessToken = (): string | null => {
  return useContext(AccessTokenContext).token;
};

export const AccessTokenProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [token, setToken] = useState<string | null>(
    'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlNjdmZTY1OC01YzcxLTRjYjItYWUzMS1kZjc1NGNlMjVmYzUiLCJpYXQiOjE3NTQzMTEyNjIsImV4cCI6Mjg4NDkwNzM4MDk0ODY5N30.BpfUmHMWlqev9JlPG0UZYLWqwnAe7lRYapmbYgsRaGeIvfk8wiX0sruAbnf9iuoJf30_38gtV6RVtIxSWT19Dg',
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let msg: unknown;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
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
