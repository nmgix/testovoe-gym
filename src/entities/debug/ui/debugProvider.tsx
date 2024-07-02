import { useEffect, useMemo, useState } from "react";
import { DebugContext } from "../config";

/* eslint @typescript-eslint/no-explicit-any: 0 */

(window as any).debugMode = true;

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [debug, setDebug] = useState<boolean>((window as any).debugMode);

  // просто не было идеи как спрятать debug режим :)
  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).debugMode !== debug) setDebug((window as any).debugMode);
    }, 1000);

    return () => clearInterval(interval);
  }, [debug]);

  const value = useMemo(() => ({ debug, setDebug }), [debug]);

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
};
