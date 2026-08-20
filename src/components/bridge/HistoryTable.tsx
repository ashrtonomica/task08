import { useState } from "react";
import { ExternalLink } from "lucide-react";

import { formatEther } from "viem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import ethLogo from "@/assets/eth-logo.png";
import wethRbLogo from "@/assets/wethrb-logo.png";
import { useBridgeHistory, type BridgeHistoryRow } from "@/hooks/useBridgeHistory";
import {
  SupportTicketDialog,
  type SupportTicketPrefill,
} from "@/components/bridge/SupportTicketDialog";
import { MyTicketsDialog } from "@/components/bridge/MyTicketsDialog";
import { redbellyTxUrl, sepoliaTxUrl, shorten } from "@/lib/bridge";

const STUCK_AFTER_MS = 5 * 60 * 1000;

function StatusPill({ row }: { row: BridgeHistoryRow }) {
  const minted = row.status === "minted" || Boolean(row.mint);
  const approvals = row.approvals?.length ?? 0;
  const label = minted ? "Minted" : `${approvals}-of-2 approved`;
  const tone = minted ? "bg-success/12 text-success" : "bg-warning/12 text-warning";

  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

const PAGE_SIZE = 5;

function formatTime(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))}h ago`;
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryTable({
  walletAddress,
  onConnect,
}: {
  walletAddress?: string;
  onConnect?: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [myTicketsOpen, setMyTicketsOpen] = useState(false);
  const [ticket, setTicket] = useState<SupportTicketPrefill | undefined>();
  const { rows: fetched, total, loading, error } = useBridgeHistory(15000, PAGE_SIZE, offset);
  // Guard against an API that ignores limit/offset: slice locally as well.
  const rows =
    fetched.length > PAGE_SIZE ? fetched.slice(offset, offset + PAGE_SIZE) : fetched;
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, total);


  return (
    <Card className="border-border p-0 shadow-none">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <h2 className="text-base font-medium text-foreground">Bridge history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All bridge transactions, tracked live against both chains.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setTicket({ ...(walletAddress ? { walletAddress } : {}) })
            }
          >
            Contact Support
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setTicket({
                ...(walletAddress ? { walletAddress } : {}),
                description: "Requesting emergency withdrawal for stuck lock.",
              })
            }
          >
            Reclaim
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMyTicketsOpen(true)}>
            My Tickets
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">
          {loading ? "Loading bridge history…" : (error ?? "No bridge transfers yet.")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Recipient</th>
                <th className="px-6 py-3 font-medium">Sepolia lock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Redbelly mint</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.sourceChainId}-${row.sourceNonce}`}
                  className="border-b border-border last:border-b-0"
                >
                  <td
                    className="whitespace-nowrap px-6 py-4 font-mono text-xs text-muted-foreground"
                    title={new Date(row.lockedAt).toLocaleString()}
                  >
                    {formatTime(row.lockedAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <img src={ethLogo} alt="" className="size-4 object-contain" />
                      {formatEther(BigInt(row.amountWei))} ETH
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {shorten(row.recipient)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {row.sepoliaTxHash ? (
                      <a
                        href={sepoliaTxUrl(row.sepoliaTxHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                      >
                        {shorten(row.sepoliaTxHash)}
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusPill row={row} />
                    {!row.mint &&
                    row.status !== "minted" &&
                    Date.now() - row.lockedAt > STUCK_AFTER_MS ? (
                      <button
                        type="button"
                        onClick={() =>
                          setTicket({
                            txHash: row.sepoliaTxHash,
                            walletAddress: row.sender,
                            amount: formatEther(BigInt(row.amountWei)),
                            locked: true,
                          })
                        }
                        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#EF5350] hover:underline"
                      >
                        <span className="size-1.5 rounded-full bg-[#EF5350]" />
                        Pending manual review, contact support
                      </button>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {row.mint?.redbellyTxHash ? (
                      <a
                        href={redbellyTxUrl(row.mint.redbellyTxHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
                      >
                        <img src={wethRbLogo} alt="" className="size-4 object-contain" />
                        {shorten(row.mint.redbellyTxHash)}
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Showing {rangeStart}-{rangeEnd} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      </div>

      <MyTicketsDialog
        open={myTicketsOpen}
        onOpenChange={setMyTicketsOpen}
        {...(walletAddress ? { walletAddress } : {})}
        {...(onConnect ? { onConnect } : {})}
      />

      {ticket ? (
        <SupportTicketDialog
          key={ticket.txHash ?? ticket.description ?? "blank"}
          open
          onOpenChange={(next) => {
            if (!next) setTicket(undefined);
          }}
          prefill={ticket}
        />
      ) : null}
    </Card>
  );
}
