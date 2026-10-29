import { useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { watchWalletSession } from "../wallet-session";
export function useWalletAccount() {
  const [account, setAccount] = useState<Address>();
  const session = useRef<ReturnType<typeof watchWalletSession>>(undefined);
  useEffect(() => {
    const current = watchWalletSession(window, setAccount);
    session.current = current;
    return () => {
      current.stop();
      if (session.current === current) session.current = undefined;
    };
  }, []);
  const connected = useCallback(
    (account: Address) => session.current?.connect(account),
    [],
  );
  const disconnect = useCallback(() => session.current?.disconnect(), []);
  return { account, connected, disconnect };
}
