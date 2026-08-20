import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, ExternalLink } from "lucide-react";
import type { Transfer } from "@/hooks/useBridgeTransfers";
import { useBridgeHistory } from "@/hooks/useBridgeHistory";
import { redbellyTxUrl, sepoliaTxUrl, shorten } from "@/lib/bridge";

type StepState = "done" | "active" | "todo";

function icon(state: StepState) {
  if (state === "done") return <CheckCircle2 className="size-5 text-success" />;
  if (state === "active") return <Loader2 className="size-5 animate-spin text-accent" />;
  return <Circle className="size-5 text-muted-foreground/50" />;
}

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function WaitingTimer({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="mt-1 text-sm font-medium tabular-nums text-accent">
      Waiting… {formatElapsed(now - startedAt)}
    </p>
  );
}

export function StatusTimeline({ transfer }: { transfer: Transfer }) {
  const [dismissed, setDismissed] = useState(false);
  const { rows } = useBridgeHistory();
  const row =
    transfer.nonce !== undefined
      ? rows.find((item) => String(item.sourceNonce) === String(transfer.nonce))
      : undefined;

  const apiApprovals = row?.approvals ?? [];
  const lockDone = Boolean(transfer.sepoliaTx) && transfer.status !== "locking";
  const approvals = Math.max(transfer.approvals, apiApprovals.length);
  const mintTx = row?.mint?.redbellyTxHash ?? transfer.mintTx;
  const minted = transfer.executed || Boolean(row?.mint) || row?.status === "minted";

  const steps: { title: string; detail: string; state: StepState; timer?: boolean }[] = [
    {
      title: "Locking on Sepolia",
      detail: transfer.sepoliaTx
        ? "ETH locked in the SepoliaLockVault contract."
        : "Waiting for your wallet signature and confirmation.",
      state: lockDone ? "done" : "active",
    },
    {
      title: "Waiting for relayer confirmations",
      detail: `2-of-3 signers required. ${approvals} of 2 approvals recorded on Redbelly.`,
      state: minted ? "done" : lockDone ? "active" : "todo",
      timer: true,
    },
    {
      title: "WETH.rb minted on Redbelly Testnet",
      detail: minted
        ? "Your wrapped ETH has been minted 1:1."
        : "The relayer executes the mint once 2 approvals land.",
      state: minted ? "done" : "todo",
    },
  ];

  if (dismissed) return null;

  return (
    <div className="relative space-y-5 rounded-lg border border-border bg-secondary/60 p-5">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss transfer status"
        className="absolute right-3 top-3 text-[#93a4ae] transition-colors hover:text-[#e4ebf0]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <div className="flex items-center justify-between pr-8">
        <p className="text-sm font-medium text-foreground">Transfer status</p>
        {transfer.nonce !== undefined ? (
          <span className="text-xs text-muted-foreground">Lock nonce #{transfer.nonce}</span>
        ) : null}
      </div>

      <ol className="space-y-4">
        {steps.map((step) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5">{icon(step.state)}</span>
            <div>
              <p
                className={`text-sm font-medium ${
                  step.state === "todo" ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{step.detail}</p>
              {step.timer && step.state === "active" ? (
                <WaitingTimer startedAt={transfer.createdAt} />
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        {transfer.sepoliaTx ? (
          <a
            href={sepoliaTxUrl(transfer.sepoliaTx)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            Sepolia lock tx {shorten(transfer.sepoliaTx)}
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}

        {apiApprovals.map((approval, index) => (
          <a
            key={approval.redbellyTxHash ?? index}
            href={redbellyTxUrl(approval.redbellyTxHash)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            Relayer approval {index + 1} of 2 tx {shorten(approval.redbellyTxHash)}
            <ExternalLink className="size-3.5" />
          </a>
        ))}

        {mintTx ? (
          <a
            href={redbellyTxUrl(mintTx)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            Redbelly mint tx {shorten(mintTx)}
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
