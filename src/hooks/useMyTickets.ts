import { useCallback, useEffect, useState } from "react";

export type SupportTicket = {
  ticketId: string;
  txHash: string;
  walletAddress: string;
  amountWei?: string;
  description?: string;
  lockStatus?: "pending" | "minted" | null;
  status: "active" | "resolved_already_bridged" | "resolved_manual";
  redbellyTxHash?: string | null;
  createdAt: number;
  resolvedAt?: number | null;
};

export const WALLET_TICKETS_URL = "https://api.redbridge.test-hub.xyz/api/support-ticket/wallet";

const byNewest = (a: SupportTicket, b: SupportTicket) => b.createdAt - a.createdAt;

export function useMyTickets(walletAddress?: string) {
  const [active, setActive] = useState<SupportTicket[]>([]);
  const [solved, setSolved] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${WALLET_TICKETS_URL}/${walletAddress}`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const json = (await res.json()) as { active?: SupportTicket[]; solved?: SupportTicket[] };
      setActive((Array.isArray(json.active) ? json.active : []).slice().sort(byNewest));
      setSolved((Array.isArray(json.solved) ? json.solved : []).slice().sort(byNewest));
    } catch {
      setError("Couldn't load your tickets right now.");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    void load();
  }, [load]);

  return { active, solved, loading, error, refresh: load };
}
