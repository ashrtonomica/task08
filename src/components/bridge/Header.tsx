import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SEPOLIA_CHAIN_ID, REDBELLY_CHAIN_ID, shorten } from "@/lib/bridge";


const chainLabel = (chainId?: number) => {
  if (chainId === SEPOLIA_CHAIN_ID) return "Ethereum Sepolia";
  if (chainId === REDBELLY_CHAIN_ID) return "Redbelly Testnet";
  if (chainId === undefined) return "Unknown network";
  return `Chain ${chainId}`;
};

export function Header({
  address,
  chainId,
  connecting,
  onConnect,
  onDisconnect,
}: {
  address?: string;
  chainId?: number;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <img
            src="/dao-logo-on-dark.png"
            alt="Redbelly DAO"
            className="h-9 w-auto shrink-0 self-center object-contain"
          />
        </div>



        <div className="flex items-center gap-3">
          {address ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{shorten(address, 4)}</p>
                <p className="text-xs text-muted-foreground">{chainLabel(chainId)}</p>
              </div>
              <Button variant="outline" onClick={onDisconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={onConnect}
              disabled={connecting}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {connecting ? "Connecting…" : "Connect wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function WarningBanner() {
  return (
    <div className="border-b border-[#3a4650] bg-[rgba(239,83,80,0.08)]" role="alert">
      <div className="mx-auto flex max-w-5xl items-start gap-3 px-6 py-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#EF5350]" strokeWidth={1.8} />
        <p className="text-base font-normal leading-normal text-[#ffb3ae]">
          <span className="font-semibold">This is a testnet demo. Do not send real funds.</span> ETH
          locked on Sepolia can be reclaimed by reaching out to contact support.
        </p>
      </div>
    </div>
  );
}
