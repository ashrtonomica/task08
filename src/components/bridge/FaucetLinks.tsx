const RBNT_FAUCETS = [{ label: "FaucetMe", href: "https://redbelly.faucetme.pro/" }];

const SEPOLIA_FAUCETS = [
  { label: "Alchemy", href: "https://www.alchemy.com/faucets/ethereum-sepolia" },
  { label: "Infura", href: "https://www.infura.io/faucet/sepolia" },
  {
    label: "Google Cloud",
    href: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
  },
  { label: "PoW Faucet", href: "https://sepolia-faucet.pk910.de/" },
];

function FaucetGroup({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#93a4ae]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-[#3a4650] bg-[#27323a] px-3 py-1.5 text-sm text-[#ffb3ae] transition-colors hover:border-[#EF5350]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function FaucetLinks() {
  return (
    <section className="space-y-4 rounded-lg border border-[#3a4650] bg-[#1e2a31] p-5">
      <div className="space-y-1">
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground">
          Testnet faucets
        </p>
        <p className="text-base leading-normal text-muted-foreground">
          Grab free testnet funds before you bridge.
        </p>
      </div>
      <FaucetGroup title="RBNT" items={RBNT_FAUCETS} />
      <FaucetGroup title="Sepolia ETH" items={SEPOLIA_FAUCETS} />
    </section>
  );
}
