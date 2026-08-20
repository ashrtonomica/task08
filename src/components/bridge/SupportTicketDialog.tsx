import { useState } from "react";
import { Check, Copy, Loader2, X } from "lucide-react";

export const SUPPORT_TICKET_URL = "https://api.redbridge.test-hub.xyz/api/support-ticket";

const TX_RE = /^0x[a-fA-F0-9]{64}$/;
const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const MAX_DESCRIPTION = 2000;

export type SupportTicketPrefill = {
  txHash?: string;
  walletAddress?: string;
  amount?: string;
  description?: string;
  /** true when opened from a specific bridge history row */
  locked?: boolean;
};

type TicketResponse = { ticketId: string; status?: string; lockStatus?: string };

async function submitTicket(payload: {
  txHash: string;
  walletAddress: string;
  amount: string;
  description: string;
}): Promise<TicketResponse> {
  const res = await fetch(SUPPORT_TICKET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as TicketResponse & { error?: string };
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

const inputClass =
  "w-full rounded-[4px] border border-[#3a4650] bg-[#1b252a] px-3 py-2 text-sm text-[#e4ebf0] outline-none transition-shadow placeholder:text-[#5d6b75] focus:border-[#EF5350] focus:shadow-[0_0_0_2px_rgba(239,83,80,0.25)]";
const labelClass = "block text-sm font-medium text-[#e4ebf0]";
const errorClass = "text-xs text-[#DC2626]";

export function SupportTicketDialog({
  open,
  onOpenChange,
  prefill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill: SupportTicketPrefill;
}) {
  const [txHash, setTxHash] = useState(prefill.txHash ?? "");
  const [walletAddress, setWalletAddress] = useState(prefill.walletAddress ?? "");
  const [amount, setAmount] = useState(prefill.amount ?? "");
  const [description, setDescription] = useState(prefill.description ?? "");
  const [txError, setTxError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TicketResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const valid = TX_RE.test(txHash.trim()) && ADDR_RE.test(walletAddress.trim());
  const overLimit = description.length > MAX_DESCRIPTION;
  const disabled = !valid || overLimit || submitting;

  const close = () => onOpenChange(false);

  const onSubmit = async () => {
    if (disabled) return;
    setBanner(null);
    setSubmitting(true);
    try {
      const data = await submitTicket({
        txHash: txHash.trim(),
        walletAddress: walletAddress.trim(),
        amount: amount.trim(),
        description: description.trim(),
      });
      setResult(data);
    } catch (err) {
      setBanner(
        err instanceof Error && err.message && err.message !== "Failed to fetch"
          ? err.message
          : "Couldn't submit — try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copy = () => {
    if (!result) return;
    void navigator.clipboard.writeText(result.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const alreadyOpen = result?.status === "already_open";

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
        aria-label="Contact Support"
        className="relative z-10 w-full max-w-[480px] rounded-lg border border-[#3a4650] bg-[#1e2a31] p-6"
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
          Contact Support
        </h2>

        {result ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2">
              <span
                className="size-1.5 rounded-full"
                style={{ background: alreadyOpen ? "#FCD34D" : "#86EFAC" }}
              />
              <span className="font-mono text-xs uppercase tracking-wide text-[#93a4ae]">
                {alreadyOpen ? "Ticket already open" : "Ticket created"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xl text-[#e4ebf0]">{result.ticketId}</span>
              <span className="relative">
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copy ticket ID"
                  className="text-[#93a4ae] transition-colors hover:text-[#e4ebf0]"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
                {copied ? (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-[4px] border border-[#3a4650] bg-[#1b252a] px-2 py-0.5 text-xs text-[#e4ebf0]">
                    Copied
                  </span>
                ) : null}
              </span>
            </div>

            <p className="text-base leading-relaxed text-[#e4ebf0]">
              {alreadyOpen
                ? `You already have an open ticket for this transaction: ${result.ticketId}.`
                : `Your message has been sent to Redbridge support. Reference ${result.ticketId} if you follow up.`}
            </p>

            {result.lockStatus ? (
              <p className="text-sm text-[#93a4ae]">Current lock status: {result.lockStatus}</p>
            ) : null}

            <button
              type="button"
              onClick={close}
              className="rounded-[4px] border border-[#3a4650] px-4 py-2 text-sm font-semibold text-[#e4ebf0] transition-colors hover:border-[#ffb3ae]"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {banner ? (
              <div
                className="flex items-start gap-2 rounded-[4px] border border-[#EF5350] border-l-4 px-3 py-2 text-sm text-[#ffb3ae]"
                style={{ background: "rgba(239, 83, 80, 0.08)" }}
              >
                {banner}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="ticket-tx">
                Sepolia lock tx hash
              </label>
              <input
                id="ticket-tx"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                onBlur={() =>
                  setTxError(
                    TX_RE.test(txHash.trim())
                      ? null
                      : "Enter a valid transaction hash (0x + 64 hex characters).",
                  )
                }
                placeholder="0x…"
                className={`${inputClass} font-mono ${prefill.locked ? "bg-[#121b20]" : ""}`}
              />
              {txError ? <p className={errorClass}>{txError}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="ticket-wallet">
                Your wallet address
              </label>
              <input
                id="ticket-wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                onBlur={() =>
                  setWalletError(
                    ADDR_RE.test(walletAddress.trim())
                      ? null
                      : "Enter a valid wallet address (0x + 40 hex characters).",
                  )
                }
                placeholder="0x…"
                className={`${inputClass} font-mono ${prefill.locked ? "bg-[#121b20]" : ""}`}
              />
              {walletError ? <p className={errorClass}>{walletError}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="ticket-amount">
                Amount (ETH)
              </label>
              <input
                id="ticket-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next === "" || /^\d*\.?\d*$/.test(next)) setAmount(next);
                }}
                placeholder="0.0"
                className={`${inputClass} font-mono ${prefill.locked ? "bg-[#121b20]" : ""}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="ticket-description">
                What happened? (optional)
              </label>
              <textarea
                id="ticket-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-y`}
              />
              <p
                className="text-right text-xs"
                style={{ color: overLimit ? "#DC2626" : "#93a4ae" }}
              >
                {description.length}/{MAX_DESCRIPTION}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={disabled}
                onClick={() => void onSubmit()}
                className="inline-flex min-w-[130px] items-center justify-center rounded-[4px] bg-[#EF5350] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : "Submit ticket"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-[4px] border border-[#3a4650] px-4 py-2 text-sm font-semibold text-[#e4ebf0] transition-colors hover:border-[#ffb3ae]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
