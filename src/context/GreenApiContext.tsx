import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import { GreenApiClient } from '../api/greenApi';

interface GreenApiContextValue {
  client: GreenApiClient;
  idInstance: string;
}

const GreenApiContext = createContext<GreenApiContextValue | null>(null);

interface GreenApiProviderProps extends GreenApiContextValue {
  children: ReactNode;
}

export function GreenApiProvider({
  client,
  idInstance,
  children,
}: GreenApiProviderProps) {
  return (
    <GreenApiContext.Provider value={{ client, idInstance }}>
      {children}
    </GreenApiContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGreenApi(): GreenApiContextValue {
  const context = useContext(GreenApiContext);

  if (!context) {
    throw new Error(
      'useGreenApi должен использоваться внутри GreenApiProvider',
    );
  }

  return context;
}
