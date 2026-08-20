import { useState } from "react";
import { Check, Copy, ExternalLink, Loader2, X } from "lucide-react";

import { useMyTickets, type SupportTicket } from "@/hooks/useMyTickets";
import { redbellyTxUrl, shorten } from "@/lib/bridge";

function relative(ms: number) {
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

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex rounded-[4px] border px-2 py-0.5 text-xs font-medium"
      style={{
        color,
        borderColor: `${color}66`,
        background: `${color}26`,
      }}
    >
      {label}
    </span>
  );
}

function HashCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={value}
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 font-mono text-xs text-[#93a4ae] transition-colors hover:text-[#e4ebf0]"
    >
      {shorten(value)}
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

function TicketCard({ ticket }: { ticket: SupportTicket }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = ticket.status === "active";
  const alreadyBridged = ticket.status === "resolved_already_bridged";

  return (
    <div className="rounded-[4px] border border-[#3a4650] bg-[#1b252a] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm text-[#e4ebf0]">{ticket.ticketId}</span>
        {isActive ? (
          <Pill label="In Progress" color="#FCD34D" />
        ) : (
          <Pill label={alreadyBridged ? "Already Bridged" : "Resolved"} color="#86EFAC" />
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#93a4ae]">
        {ticket.txHash ? <HashCopy value={ticket.txHash} /> : null}
        {ticket.amountWei ? (
          <span className="font-mono text-[#e4ebf0]">{ticket.amountWei} ETH</span>
        ) : null}
        <span className="font-mono" title={new Date(ticket.createdAt).toLocaleString()}>
          {relative(ticket.createdAt)}
        </span>
      </div>

      {!isActive ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-[#e4ebf0]">
            {alreadyBridged
              ? "This transfer had already completed successfully — your funds arrived on Redbelly Chain. No action was needed."
              : "Your funds have been recovered and confirmed on Redbelly Chain."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {ticket.resolvedAt ? (
              <span
                className="font-mono text-xs text-[#93a4ae]"
                title={new Date(ticket.resolvedAt).toLocaleString()}
              >
                Resolved {relative(ticket.resolvedAt)}
              </span>
            ) : null}
            {ticket.redbellyTxHash ? (
              <a
                href={redbellyTxUrl(ticket.redbellyTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                View on Redbelly Explorer
                <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </>
      ) : null}

      {ticket.description ? (
        <div className="mt-3">
          <p
            className={`text-sm text-[#93a4ae] ${expanded ? "" : "truncate"}`}
          >
            {ticket.description}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-medium text-accent hover:underline"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MyTicketsDialog({
  open,
  onOpenChange,
  walletAddress,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string;
  onConnect?: () => void;
}) {
  const [tab, setTab] = useState<"active" | "solved">("active");
  const { active, solved, loading, error, refresh } = useMyTickets(walletAddress);

  if (!open) return null;
  const close = () => onOpenChange(false);
  const list = tab === "active" ? active : solved;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="My Tickets"
        className="relative z-10 max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-lg border border-[#3a4650] bg-[#1e2a31] p-6"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-[#93a4ae] transition-colors hover:text-[#e4ebf0]"
        >
          <X className="size-4" />
        </button>

        <h2 className="pr-8 text-2xl font-semibold tracking-[-0.01em] text-[#e4ebf0]">
          My Tickets
        </h2>

        {!walletAddress ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-[#93a4ae]">Connect your wallet to view your tickets</p>
            {onConnect ? (
              <button
                type="button"
                onClick={onConnect}
                className="rounded-[4px] bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Connect wallet
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-4 flex gap-2">
              {(["active", "solved"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-[4px] border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    tab === key
                      ? "border-[#ffb3ae] text-[#e4ebf0]"
                      : "border-[#3a4650] text-[#93a4ae] hover:border-[#ffb3ae]"
                  }`}
                >
                  {key === "active" ? `Active (${active.length})` : `Solved (${solved.length})`}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-[#93a4ae]">
                  <Loader2 className="size-4 animate-spin" /> Loading your tickets…
                </div>
              ) : error ? (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-l-4 border-[#EF5350] px-3 py-2 text-sm text-[#ffb3ae]"
                  style={{ background: "rgba(239, 83, 80, 0.08)" }}
                >
                  {error}
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="rounded-[4px] border border-[#3a4650] px-3 py-1 text-xs font-semibold text-[#e4ebf0] hover:border-[#ffb3ae]"
                  >
                    Retry
                  </button>
                </div>
              ) : active.length === 0 && solved.length === 0 ? (
                <p className="py-6 text-sm text-[#93a4ae]">
                  You haven&apos;t opened any support tickets yet.
                </p>
              ) : list.length === 0 ? (
                <p className="py-6 text-sm text-[#93a4ae]">
                  No {tab} tickets.
                </p>
              ) : (
                list.map((ticket) => <TicketCard key={ticket.ticketId} ticket={ticket} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
