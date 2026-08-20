import { createFileRoute } from "@tanstack/react-router";
import { BridgePanel } from "@/components/bridge/BridgePanel";
import { Explainer } from "@/components/bridge/Explainer";
import { FaucetLinks } from "@/components/bridge/FaucetLinks";
import { FooterLinks } from "@/components/bridge/FooterLinks";
import { Header, WarningBanner } from "@/components/bridge/Header";
import { HistoryTable } from "@/components/bridge/HistoryTable";
import { ResourceButtons } from "@/components/bridge/ResourceButtons";
import { useBridgeTransfers } from "@/hooks/useBridgeTransfers";
import { useWallet } from "@/hooks/useWallet";
import { LOCK_VAULT_ADDRESS, WETH_RB_ADDRESS, shorten } from "@/lib/bridge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Redbridge" },
      {
        name: "description",
        content:
          "Lock ETH on Ethereum Sepolia and receive wrapped WETH.rb 1:1 on Redbelly Testnet through a 2-of-3 relayer bridge.",
      },
      { property: "og:title", content: "Redbridge" },
      {
        property: "og:description",
        content:
          "Testnet cross-chain bridge: lock ETH on Sepolia, mint WETH.rb 1:1 on Redbelly Testnet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BridgePage,
});

function BridgePage() {
  const wallet = useWallet();
  const { transfers, addTransfer, updateTransfer } = useBridgeTransfers(wallet.address);
  const activeTransfer = transfers[0];

  return (
    <div className="min-h-screen bg-background">
      <Header
        {...(wallet.address ? { address: wallet.address } : {})}
        {...(wallet.chainId !== undefined ? { chainId: wallet.chainId } : {})}
        connecting={wallet.connecting}
        onConnect={() => void wallet.connect()}
        onDisconnect={wallet.disconnect}
      />
      <WarningBanner />

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10 sm:py-14">
        {!wallet.hasProvider ? (
          <p className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">
            No EVM wallet detected. Install MetaMask to connect to Sepolia and Redbelly Testnet.
          </p>
        ) : null}

        <FaucetLinks />

        <BridgePanel
          wallet={wallet}
          {...(activeTransfer ? { activeTransfer } : {})}
          onCreate={addTransfer}
          onUpdate={updateTransfer}
        />

        <Explainer />

        <HistoryTable />

        <ResourceButtons />

        <footer className="space-y-5 border-t border-border pt-6 text-xs text-muted-foreground">
          <FooterLinks />
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              SepoliaLockVault ·{" "}
              <a
                href={`https://sepolia.etherscan.io/address/${LOCK_VAULT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent hover:underline"
              >
                {shorten(LOCK_VAULT_ADDRESS, 6)}
              </a>
            </p>
            <p className="sm:text-right">
              WETHBridged ·{" "}
              <a
                href={`https://redbelly.testnet.routescan.io/token/${WETH_RB_ADDRESS}?type=erc20`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent hover:underline"
              >
                {shorten(WETH_RB_ADDRESS, 6)}
              </a>
            </p>
          </div>
          <p className="text-center">
            Built with ♥ by{" "}
            <a
              href="https://github.com/0xDarkSeidBull"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent hover:underline"
            >
              0xDarkSeidBull
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
