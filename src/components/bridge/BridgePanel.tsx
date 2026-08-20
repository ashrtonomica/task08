import { useCallback, useEffect, useMemo, useState } from "react";
import { decodeEventLog, formatEther, parseEther, type Address } from "viem";
import { toast } from "sonner";
import { ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ethLogo from "@/assets/eth-logo.png";
import wethRbLogo from "@/assets/wethrb-logo.png";
import { StatusTimeline } from "@/components/bridge/StatusTimeline";
import { TestnetWarning } from "@/components/bridge/TestnetWarning";
import { CHAINLIST_SEPOLIA_URL } from "@/lib/links";
import type { Transfer } from "@/hooks/useBridgeTransfers";
import { useWallet } from "@/hooks/useWallet";
import {
  LOCK_VAULT_ADDRESS,
  REDBELLY_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
  WETH_RB_ADDRESS,
  isAddressLike,
  lockVaultAbi,
  redbellyClient,
  sepoliaChain,
  sepoliaClient,
  wethBridgedAbi,
} from "@/lib/bridge";

type Wallet = ReturnType<typeof useWallet>;

export function BridgePanel({
  wallet,
  activeTransfer,
  onCreate,
  onUpdate,
}: {
  wallet: Wallet;
  activeTransfer?: Transfer;
  onCreate: (transfer: Transfer) => void;
  onUpdate: (id: string, patch: Partial<Transfer>) => void;
}) {
  const { address, chainId, isConnected, connect, connecting, switchChain, getWalletClient } =
    wallet;

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientTouched, setRecipientTouched] = useState(false);
  const [limits, setLimits] = useState<{ min: bigint; max: bigint } | undefined>();
  const [ethBalance, setEthBalance] = useState<bigint | undefined>();
  const [wethBalance, setWethBalance] = useState<bigint | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (address && !recipientTouched) setRecipient(address);
  }, [address, recipientTouched]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [min, max] = await Promise.all([
          sepoliaClient.readContract({
            address: LOCK_VAULT_ADDRESS,
            abi: lockVaultAbi,
            functionName: "MIN_LOCK_AMOUNT",
          }),
          sepoliaClient.readContract({
            address: LOCK_VAULT_ADDRESS,
            abi: lockVaultAbi,
            functionName: "MAX_LOCK_AMOUNT",
          }),
        ]);
        if (!cancelled) setLimits({ min, max });
      } catch {
        if (!cancelled) toast.error("Couldn't read bridge limits from the Sepolia contract.");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadBalances = useCallback(async () => {
    if (!address) return;
    setRefreshing(true);
    try {
      const [eth, weth] = await Promise.all([
        sepoliaClient.getBalance({ address }),
        redbellyClient.readContract({
          address: WETH_RB_ADDRESS,
          abi: wethBridgedAbi,
          functionName: "balanceOf",
          args: [address],
        }),
      ]);
      setEthBalance(eth);
      setWethBalance(weth);
    } catch {
      /* transient RPC failure */
    } finally {
      setRefreshing(false);
    }
  }, [address]);

  useEffect(() => {
    void loadBalances();
  }, [loadBalances, activeTransfer?.status]);

  const amountWei = useMemo(() => {
    if (!amount.trim()) return undefined;
    try {
      return parseEther(amount.trim());
    } catch {
      return undefined;
    }
  }, [amount]);

  const amountError = useMemo(() => {
    if (!amount.trim()) return undefined;
    if (amountWei === undefined) return "Enter a valid ETH amount.";
    if (limits) {
      if (amountWei < limits.min) return `Minimum is ${formatEther(limits.min)} ETH.`;
      if (amountWei > limits.max) return `Maximum is ${formatEther(limits.max)} ETH.`;
    }
    return undefined;
  }, [amount, amountWei, limits]);

  const sliderRange = useMemo(() => {
    if (!limits) return undefined;
    const min = Number(formatEther(limits.min));
    const max = Number(formatEther(limits.max));
    if (!(max > min)) return undefined;
    return { min, max, step: Number(((max - min) / 100).toFixed(9)) || 0.0001 };
  }, [limits]);

  const sliderValue = useMemo(() => {
    if (!sliderRange) return 0;
    const parsed = Number(amount);
    if (!amount.trim() || !Number.isFinite(parsed)) return sliderRange.min;
    return Math.min(Math.max(parsed, sliderRange.min), sliderRange.max);
  }, [amount, sliderRange]);


  const maxSpendable = useMemo(() => {
    if (ethBalance === undefined) return undefined;
    return Number(formatEther(ethBalance)) * 0.9;
  }, [ethBalance]);

  const [gasNote, setGasNote] = useState(false);

  const handleAmountBlur = () => {
    setGasNote(false);
    const parsed = Number(amount);
    if (!amount.trim() || !Number.isFinite(parsed) || parsed <= 0) return;
    let next = parsed;
    if (next < 0.001) next = 0.001;
    if (maxSpendable !== undefined && next > maxSpendable) {
      next = Number(maxSpendable.toFixed(6));
      setGasNote(true);
    }
    if (next !== parsed) setAmount(String(next));
  };

  const recipientError =
    recipient.trim() && !isAddressLike(recipient) ? "Enter a valid EVM address (0x + 40 hex)." : undefined;

  const canSubmit =
    isConnected &&
    !submitting &&
    amountWei !== undefined &&
    !amountError &&
    isAddressLike(recipient);

  const onSepolia = chainId === SEPOLIA_CHAIN_ID;

  const handleLock = async () => {
    if (!address || amountWei === undefined) return;
    setSubmitting(true);
    const id = `${Date.now()}`;
    try {
      if (!onSepolia) {
        toast.info("Switching your wallet to Ethereum Sepolia…");
        await switchChain(SEPOLIA_CHAIN_ID);
      }

      const walletClient = getWalletClient();
      const hash = await walletClient.writeContract({
        account: address,
        chain: sepoliaChain,
        address: LOCK_VAULT_ADDRESS,
        abi: lockVaultAbi,
        functionName: "lock",
        args: [recipient.trim() as Address],
        value: amountWei,
      });

      onCreate({
        id,
        sender: address,
        recipient: recipient.trim(),
        amountWei: amountWei.toString(),
        sepoliaTx: hash,
        approvals: 0,
        executed: false,
        status: "locking",
        createdAt: Date.now(),
      });
      toast.success("Lock transaction submitted on Sepolia.");

      const receipt = await sepoliaClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        onUpdate(id, { status: "failed" });
        toast.error("Lock transaction reverted on Sepolia.");
        return;
      }

      let nonce: string | undefined;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== LOCK_VAULT_ADDRESS.toLowerCase()) continue;
        try {
          const decoded = decodeEventLog({
            abi: lockVaultAbi,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "Locked") {
            nonce = (decoded.args as { nonce: bigint }).nonce.toString();
          }
        } catch {
          /* not our event */
        }
      }

      onUpdate(id, { status: "locked", ...(nonce ? { nonce } : {}) });
      toast.success("Locked! Waiting for relayer confirmations (2-of-3 signers required).");
      void loadBalances();
      setAmount("");
    } catch (error) {
      const message = (error as { shortMessage?: string; message?: string }).shortMessage ??
        (error as Error).message ??
        "Transaction failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border p-0 shadow-[var(--shadow-card)]">
      <div className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-foreground">
              Bridge Sepolia ETH to Redbelly Testnet
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lock ETH on Ethereum Sepolia and receive WETH.rb 1:1 on Redbelly Testnet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadBalances()}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <img src={ethLogo} alt="" className="h-7 w-7 shrink-0 object-contain" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sepolia ETH</p>
              <p className="mt-1 text-lg font-medium text-foreground">
                {ethBalance !== undefined
                  ? `${Number(formatEther(ethBalance)).toFixed(5)} ETH`
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <img src={wethRbLogo} alt="" className="h-7 w-7 shrink-0 object-contain" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Redbelly WETH.rb
              </p>
              <p className="mt-1 text-lg font-medium text-foreground">
                {wethBalance !== undefined
                  ? `${Number(formatEther(wethBalance)).toFixed(5)} WETH.rb`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <TestnetWarning />

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="amount">Amount to bridge</Label>
            <span className="text-xs text-muted-foreground">
              {limits
                ? `Limits ${formatEther(limits.min)} to ${formatEther(limits.max)} ETH`
                : "Loading limits…"}
            </span>
          </div>
          <div className="relative">
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(event) => {
                const next = event.target.value;
                if (next === "" || /^\d*\.?\d*$/.test(next)) {
                  setGasNote(false);
                  setAmount(next);
                }
              }}
              onKeyDown={(event) => {
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                  if (!/[\d.]/.test(event.key)) event.preventDefault();
                  else if (event.key === "." && amount.includes(".")) event.preventDefault();
                }
              }}
              onBlur={handleAmountBlur}
              className="h-12 border-input bg-background pr-20 text-base placeholder:text-muted-foreground focus-visible:border-accent"
            />
            <span className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <img src={ethLogo} alt="" className="size-4 object-contain" />
              ETH
            </span>
          </div>
          {sliderRange ? (
            <div className="space-y-1 pt-1">
              <Slider
                value={[sliderValue]}
                min={sliderRange.min}
                max={sliderRange.max}
                step={sliderRange.step}
                onValueChange={([next]) => {
                  if (next !== undefined) setAmount(String(Number(next.toFixed(6))));
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{sliderRange.min} ETH</span>
                <span>{sliderRange.max} ETH</span>
              </div>
            </div>
          ) : null}
          {maxSpendable !== undefined ? (
            <p className="text-xs text-muted-foreground">
              Max: {maxSpendable.toFixed(3)} ETH (10% reserved for gas)
            </p>
          ) : null}
          {gasNote ? (
            <p className="text-sm text-accent">Reduced to leave room for gas fees.</p>
          ) : null}
          {amountError ? <p className="text-sm text-accent">{amountError}</p> : null}
          <p className="text-sm text-muted-foreground">
            RPC not responding?{" "}
            <a
              href={CHAINLIST_SEPOLIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Change RPC URL
            </a>
          </p>
        </div>

        <div className="flex justify-center">
          <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card">
            <ArrowDown className="size-4 text-muted-foreground" />
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient on Redbelly Testnet</Label>
          <Input
            id="recipient"
            placeholder="0x…"
            value={recipient}
            onChange={(event) => {
              setRecipientTouched(true);
              setRecipient(event.target.value);
            }}
            className="h-12 border-input bg-background font-mono text-sm placeholder:text-muted-foreground focus-visible:border-accent"
          />
          {recipientError ? (
            <p className="text-sm text-accent">{recipientError}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Defaults to your connected wallet. Edit it to mint WETH.rb to another address.
            </p>
          )}
        </div>

        {!isConnected ? (
          <Button
            onClick={() => void connect()}
            disabled={connecting}
            className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90"
          >
            {connecting ? "Connecting…" : "Connect wallet"}
          </Button>
        ) : !onSepolia ? (
          <Button
            onClick={() => void switchChain(SEPOLIA_CHAIN_ID)}
            className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90"
          >
            Switch network to Ethereum Sepolia
          </Button>
        ) : (
          <Button
            onClick={() => void handleLock()}
            disabled={!canSubmit}
            className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90"
          >
            {submitting ? "Confirm in your wallet…" : "Lock & Bridge"}
          </Button>
        )}

        {isConnected && chainId !== REDBELLY_CHAIN_ID ? (
          <button
            type="button"
            onClick={() => void switchChain(REDBELLY_CHAIN_ID)}
            className="w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            Add / switch to Redbelly Testnet in your wallet
          </button>
        ) : null}

        {activeTransfer ? (
          <StatusTimeline key={activeTransfer.id} transfer={activeTransfer} />
        ) : null}
      </div>
    </Card>
  );
}
