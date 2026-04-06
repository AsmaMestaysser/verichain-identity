import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Stamp,
  UserCheck,
  ScanSearch,
  Wallet,
  Link2,
  Landmark,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

type Step = "connect" | "role";
type WalletId = "metamask" | "walletconnect" | "coinbase";
type Role = "issuer" | "holder" | "verifier";

interface WalletOption {
  id: WalletId;
  name: string;
  description: string;
  icon: React.ReactNode;
  checkInstalled: () => boolean;
  installUrl: string;
}

const wallets: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "The most popular browser wallet",
    icon: <Wallet className="h-6 w-6 text-orange-500" />,
    checkInstalled: () => typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask,
    installUrl: "https://metamask.io/download/",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Connect any mobile wallet via QR",
    icon: <Link2 className="h-6 w-6 text-primary" />,
    checkInstalled: () => true,
    installUrl: "",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Secure wallet by Coinbase",
    icon: <Landmark className="h-6 w-6 text-blue-600" />,
    checkInstalled: () => typeof window !== "undefined" && !!(window as any).ethereum?.isCoinbaseWallet,
    installUrl: "https://www.coinbase.com/wallet/downloads",
  },
];

const roles: { id: Role; name: string; description: string; icon: React.ReactNode; badge?: string }[] = [
  {
    id: "holder",
    name: "Individual",
    description: "For personal identity management and credential storage.",
    icon: <UserCheck className="h-5 w-5" />,
    badge: "INSTANT",
  },
  {
    id: "issuer",
    name: "Issuer",
    description: "For organizations issuing verifiable credentials on-chain.",
    icon: <Stamp className="h-5 w-5" />,
  },
  {
    id: "verifier",
    name: "Verifier",
    description: "For entities verifying credential authenticity and ZKP proofs.",
    icon: <ScanSearch className="h-5 w-5" />,
  },
];

const cardSpring = { type: "spring" as const, stiffness: 120, damping: 14 };

export default function Onboarding() {
  const [step, setStep] = useState<Step>("connect");
  const [connectingWallet, setConnectingWallet] = useState<WalletId | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptRegion, setAcceptRegion] = useState(false);
  const navigate = useNavigate();

  const handleConnect = useCallback(async (wallet: WalletOption) => {
    if (!wallet.checkInstalled() && wallet.installUrl) {
      toast({
        title: `${wallet.name} not detected`,
        description: "Please install the extension and refresh.",
        variant: "destructive",
      });
      window.open(wallet.installUrl, "_blank");
      return;
    }

    setConnectingWallet(wallet.id);

    try {
      if (wallet.id === "metamask" || wallet.id === "coinbase") {
        const ethereum = (window as any).ethereum;
        const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setTimeout(() => setStep("role"), 600);
        }
      } else {
        // WalletConnect placeholder
        await new Promise((r) => setTimeout(r, 1500));
        const mockAddr = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        setWalletAddress(mockAddr);
        setTimeout(() => setStep("role"), 600);
      }
    } catch (err: any) {
      toast({
        title: "Connection failed",
        description: err?.message || "User rejected the request.",
        variant: "destructive",
      });
    } finally {
      setConnectingWallet(null);
    }
  }, []);

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedRole || !walletAddress) return;
    const did = `did:zk:${walletAddress}`;
    toast({ title: "Identity anchored", description: `DID: ${did.slice(0, 20)}…` });
    navigate(`/${selectedRole}`);
  }, [selectedRole, walletAddress, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 sm:px-6">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[100px]" />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={cardSpring}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 shadow-lg backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 border-b border-border/40 px-6 pt-8 pb-5">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, ...cardSpring }}>
              <div className="flex items-center gap-2">
                <img src={logo} alt="QS·DID" className="h-9 w-9" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  QS<span className="text-primary">·</span>DID
                </span>
              </div>
            </motion.div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Quantum-Secure Identity Layer
            </p>
          </div>

          {/* Connected address badge */}
          <AnimatePresence>
            {walletAddress && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex justify-center overflow-hidden border-b border-border/40 py-3"
              >
                <WalletAddress address={walletAddress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps */}
          <div className="relative overflow-hidden px-6 py-6">
            <AnimatePresence mode="wait">
              {step === "connect" && (
                <motion.div
                  key="connect"
                  initial={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h2 className="text-lg font-semibold text-foreground">Connect your wallet to continue</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We use your wallet as your decentralized identity anchor.
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    {wallets.map((w) => {
                      const isConnecting = connectingWallet === w.id;
                      return (
                        <motion.button
                          key={w.id}
                          whileHover={{ y: -2, boxShadow: "0 8px 30px -8px hsl(var(--primary) / 0.12)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleConnect(w)}
                          disabled={!!connectingWallet}
                          className="group flex items-center gap-4 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3.5 text-left transition-colors hover:border-primary/30 hover:bg-secondary/70 disabled:opacity-60"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                            {w.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-foreground">{w.name}</span>
                            <span className="block text-xs text-muted-foreground">{w.description}</span>
                          </div>
                          {isConnecting ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {connectingWallet && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Connecting…
                    </motion.p>
                  )}
                </motion.div>
              )}

              {step === "role" && (
                <motion.div
                  key="role"
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 60, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <button
                    onClick={() => setStep("connect")}
                    className="mb-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                  </button>

                  <h2 className="text-lg font-semibold text-foreground">Verify your identity</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select your account type
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    {roles.map((r) => {
                      const isSelected = selectedRole === r.id;
                      return (
                        <motion.button
                          key={r.id}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRoleSelect(r.id)}
                          className={`group flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border/60 bg-background hover:border-primary/30"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{r.name}</span>
                              {r.badge && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                  <Zap className="h-2.5 w-2.5" />
                                  {r.badge}
                                </span>
                              )}
                            </div>
                            <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{r.description}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Checkboxes */}
                  <div className="mt-5 flex flex-col gap-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={acceptTerms}
                        onCheckedChange={(v) => setAcceptTerms(v === true)}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-muted-foreground leading-snug">
                        I agree to the quantum-secure identity protocol and accept the network's governance terms.
                      </span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={acceptRegion}
                        onCheckedChange={(v) => setAcceptRegion(v === true)}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-muted-foreground leading-snug">
                        I'm not operating in a <span className="underline text-foreground">restricted country/region</span>.
                      </span>
                    </label>
                  </div>

                  <Button
                    onClick={handleContinue}
                    disabled={!selectedRole || !acceptTerms || !acceptRegion}
                    className="mt-5 w-full"
                    size="lg"
                  >
                    Continue
                  </Button>

                  <p className="mt-3 text-center text-[10px] text-muted-foreground leading-relaxed">
                    QS·DID uses decentralized identity protocols to securely anchor your credentials. By continuing, you agree to our{" "}
                    <span className="underline cursor-pointer text-foreground">Terms of Service</span> and{" "}
                    <span className="underline cursor-pointer text-foreground">Privacy Policy</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer trust signal */}
          <div className="flex items-center justify-center gap-1.5 border-t border-border/40 py-3">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              End-to-end encrypted · Quantum-resistant
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
