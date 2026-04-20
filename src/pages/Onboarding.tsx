// src/pages/Onboarding.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Wallet,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cpu,
  ScanLine,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

import { useAuthMachine, type AuthState } from "@/lib/qsdid/stateMachine";
import { audit } from "@/lib/qsdid/audit";
import {
  initWasm,
  healthCheck,
  generateHybridKeys,
  signDocument,
  verifySignature,
  encodeUtf8ToB64,
  generateChallengeNonce,
  type HybridKeyPair,
  type SignatureResult,
} from "@/lib/qsdid/wasmClient";
import { createTotp, persistTotpDev, verifyTotp } from "@/lib/qsdid/totp";

const API_BASE = "http://localhost:8081";

type StepKey = "totp" | "backend" | "keys" | "sign" | "wallet" | "done";

const stepOrder: { key: StepKey; label: string; icon: React.ReactNode }[] = [
  { key: "totp", label: "Authenticator", icon: <ScanLine className="h-4 w-4" /> },
  { key: "backend", label: "Backend", icon: <Cpu className="h-4 w-4" /> },
  { key: "keys", label: "PQC Keys", icon: <KeyRound className="h-4 w-4" /> },
  { key: "sign", label: "Sign & Verify", icon: <FileSignature className="h-4 w-4" /> },
  { key: "wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
  { key: "done", label: "Bind Identity", icon: <ShieldCheck className="h-4 w-4" /> },
];

function stateToStep(s: AuthState): StepKey {
  switch (s) {
    case "INIT":
    case "TOTP_SETUP":
      return "totp";
    case "TOTP_VERIFIED":
      return "backend";
    case "BACKEND_READY":
      return "keys";
    case "KEYS_GENERATED":
    case "CHALLENGE_GENERATED":
    case "SIGNED":
      return "sign";
    case "VERIFIED":
      return "wallet";
    case "WALLET_CONNECTED":
    case "AUTHENTICATED":
      return "done";
  }
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { state, send } = useAuthMachine();
  const step = stateToStep(state);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TOTP
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");

  // PQC
  const [keys, setKeys] = useState<HybridKeyPair | null>(null);
  const [signature, setSignature] = useState<SignatureResult | null>(null);
  const [verified, setVerified] = useState(false);

  // Wallet
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  const did = useMemo(() => (walletAddr ? `did:zk:${walletAddr}` : null), [walletAddr]);

  // Bootstrap WASM + TOTP secret immediately so QR is ready on screen 1
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initWasm(API_BASE);
      } catch (e) {
        setError(`WASM init failed: ${(e as Error).message}`);
        return;
      }
      if (cancelled) return;
      const ref = `dev-${Date.now()}`;
      const { secret, uri } = createTotp(ref);
      setTotpSecret(secret);
      setTotpUri(uri);
      const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
      if (!cancelled) setQrDataUrl(qr);
      send("TOTP_SETUP_STARTED");
    })();
    return () => {
      cancelled = true;
    };
  }, [send]);

  const verifyTotpCode = useCallback(() => {
    if (!totpSecret) return;
    if (!verifyTotp(totpSecret, totpCode)) {
      setError("Invalid authenticator code");
      audit("ERROR", "Invalid TOTP");
      return;
    }
    setError(null);
    audit("INFO", "TOTP verified");
    send("TOTP_VERIFIED");
  }, [totpSecret, totpCode, send]);

  const runBackendCheck = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await healthCheck();
      send("BACKEND_OK");
    } catch (e) {
      setError(`Backend unavailable at ${API_BASE}. Start the Rust service and retry.`);
    } finally {
      setBusy(false);
    }
  }, [send]);

  const runGenerateKeys = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const k = await generateHybridKeys();
      setKeys(k);
      send("KEYS_GENERATED");
    } catch (e) {
      setError(`Key generation failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [send]);

  const runSignAndVerify = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const nonce = generateChallengeNonce();
      const docB64 = encodeUtf8ToB64(JSON.stringify({ ctx: "registration", nonce }));
      audit("INFO", "Challenge generated", { context: "registration" });
      send("CHALLENGE_GENERATED");

      const sig = await signDocument(docB64);
      setSignature(sig);
      send("SIGNED");

      const v = await verifySignature(sig.signature_id, docB64);
      if (!v?.valid) throw new Error("Verification rejected");
      setVerified(true);
      send("VERIFIED");
    } catch (e) {
      setError(`Sign/verify failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [send]);

  const runConnectWallet = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      audit("INFO", "Wallet connection requested");
      const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string[]> } }).ethereum;
      if (!eth) throw new Error("MetaMask not detected");
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const addr = accounts?.[0];
      if (!addr) throw new Error("No account returned");
      setWalletAddr(addr);
      audit("SUCCESS", "Wallet connected", { addr });
      send("WALLET_CONNECTED");
    } catch (e) {
      setError(`Wallet connection failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [send]);

  const finalize = useCallback(() => {
    if (!walletAddr || !keys || !totpSecret || !did) return;
    const ref = did;
    persistTotpDev(ref, totpSecret); // dev-only TOTP storage
    const identity = {
      did,
      walletAddress: walletAddr,
      totpRef: ref,
      publicKey: keys.public_key,
      createdAt: Date.now(),
    };
    sessionStorage.setItem("qsdid.identity", JSON.stringify(identity));
    audit("SUCCESS", "Identity bound", { did, walletAddr });
    send("ACCESS_GRANTED");
    toast({ title: "Identity anchored", description: did });
    navigate("/holder");
  }, [walletAddr, keys, totpSecret, did, send, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-2xl border border-border/60 bg-card/80 shadow-lg backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 border-b border-border/40 px-6 pt-7 pb-5">
            <div className="flex items-center gap-2">
              <img src={logo} alt="QS·DID" className="h-9 w-9" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                QS<span className="text-primary">·</span>DID
              </span>
            </div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Post-Quantum Identity · ML-DSA-65
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between gap-1 border-b border-border/40 px-4 py-3">
            {stepOrder.map((s, i) => {
              const idx = stepOrder.findIndex((x) => x.key === step);
              const reached = i <= idx;
              const active = i === idx;
              return (
                <div key={s.key} className="flex flex-1 items-center gap-1">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : reached
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {reached && !active ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.icon}
                  </div>
                  {i < stepOrder.length - 1 && (
                    <div className={`h-px flex-1 ${reached ? "bg-primary/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "totp" && (
                <motion.div key="totp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-base font-semibold text-foreground">Setup authenticator</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Scan this QR with Google Authenticator (or any TOTP app) and enter the 6-digit code.
                  </p>

                  <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 p-4">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="TOTP QR code" className="h-44 w-44 rounded-md bg-background p-2" />
                    ) : (
                      <div className="flex h-44 w-44 items-center justify-center rounded-md bg-background">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {totpSecret && (
                      <code className="break-all text-center text-[10px] text-muted-foreground">{totpSecret}</code>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-medium text-foreground">6-digit code</label>
                    <Input
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      placeholder="123456"
                      className="mt-1 text-center font-mono tracking-[0.4em]"
                    />
                  </div>

                  <Button onClick={verifyTotpCode} disabled={totpCode.length !== 6} className="mt-4 w-full">
                    Verify code <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === "backend" && (
                <motion.div key="backend" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-base font-semibold text-foreground">Verify backend</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pinging the Rust PQC service at <code className="font-mono">{API_BASE}</code> via WASM.
                  </p>
                  <Button onClick={runBackendCheck} disabled={busy} className="mt-4 w-full">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cpu className="mr-2 h-4 w-4" />}
                    Check backend
                  </Button>
                </motion.div>
              )}

              {step === "keys" && (
                <motion.div key="keys" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-base font-semibold text-foreground">Generate hybrid PQC keys</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Classical + ML-DSA-65 keypair. Private key never leaves this device.
                  </p>
                  {keys?.public_key && (
                    <div className="mt-3 rounded-md border border-border/60 bg-secondary/30 p-3">
                      <div className="text-[10px] font-semibold uppercase text-muted-foreground">Public key</div>
                      <code className="mt-1 block break-all text-[10px] text-foreground">
                        {String(keys.public_key).slice(0, 96)}…
                      </code>
                    </div>
                  )}
                  <Button onClick={runGenerateKeys} disabled={busy} className="mt-4 w-full">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    {keys ? "Regenerate" : "Generate keys"}
                  </Button>
                </motion.div>
              )}

              {step === "sign" && (
                <motion.div key="sign" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-base font-semibold text-foreground">Sign & verify challenge</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    A unique nonce will be signed with ML-DSA-65 and verified against the backend.
                  </p>
                  {signature?.signature_id && (
                    <div className="mt-3 rounded-md border border-border/60 bg-secondary/30 p-3 text-[10px]">
                      <div className="font-semibold uppercase text-muted-foreground">Signature ID</div>
                      <code className="mt-1 block break-all text-foreground">{signature.signature_id}</code>
                      {verified && (
                        <div className="mt-2 inline-flex items-center gap-1 text-accent">
                          <CheckCircle2 className="h-3 w-3" /> verified
                        </div>
                      )}
                    </div>
                  )}
                  <Button onClick={runSignAndVerify} disabled={busy} className="mt-4 w-full">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
                    Sign & verify
                  </Button>
                </motion.div>
              )}

              {step === "wallet" && (
                <motion.div key="wallet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-base font-semibold text-foreground">Connect MetaMask</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your wallet anchors the DID and binds it to your PQC public key.
                  </p>
                  <Button onClick={runConnectWallet} disabled={busy} className="mt-4 w-full">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                    Connect MetaMask
                  </Button>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-base font-semibold text-foreground">Bind your identity</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Linking TOTP, hybrid public key, wallet, and DID.
                  </p>
                  <div className="mt-3 space-y-2 rounded-md border border-border/60 bg-secondary/30 p-3 text-[11px]">
                    <Row label="DID" value={did ?? "—"} />
                    <Row label="Wallet" value={walletAddr ?? "—"} />
                    <Row label="Signature" value={signature?.signature_id ?? "—"} />
                  </div>
                  <Button onClick={finalize} className="mt-4 w-full">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Finalize & enter app
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                State: <span className="text-foreground">{state}</span>
              </span>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Already registered? Sign in
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <code className="break-all text-right text-foreground">{value}</code>
    </div>
  );
}