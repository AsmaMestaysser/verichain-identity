// src/pages/Login.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, KeyRound, Wallet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuthMachine } from "@/lib/qsdid/stateMachine";
import { audit } from "@/lib/qsdid/audit";
import {
  initWasm,
  healthCheck,
  signDocument,
  verifySignature,
  encodeUtf8ToB64,
  generateChallengeNonce,
} from "@/lib/qsdid/wasmClient";
import { loadTotpDev, verifyTotp } from "@/lib/qsdid/totp";

type Identity = {
  did: string;
  walletAddress: string;
  totpRef: string;
  publicKey?: string;
};

function loadIdentity(): Identity | null {
  try {
    const raw = sessionStorage.getItem("qsdid.identity");
    return raw ? (JSON.parse(raw) as Identity) : null;
  } catch {
    return null;
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { state, send } = useAuthMachine();
  const identity = useMemo(loadIdentity, []);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    initWasm().catch((e) => setError(String(e)));
  }, []);

  const handleVerify = useCallback(async () => {
    if (!identity) {
      setError("No registered identity on this device. Please register first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // STEP 1 — TOTP
      const secret = loadTotpDev(identity.totpRef);
      if (!secret) throw new Error("TOTP secret missing on this device.");
      if (!verifyTotp(secret, code, identity.did)) throw new Error("Invalid TOTP code");
      audit("INFO", "TOTP verified");
      send("TOTP_VERIFIED");

      // STEP 2 — Health
      await healthCheck();
      send("BACKEND_OK");

      // STEP 3 — Challenge
      const nonce = generateChallengeNonce();
      const docB64 = encodeUtf8ToB64(JSON.stringify({ ctx: "login", nonce, did: identity.did }));
      audit("INFO", "Challenge generated", { context: "login" });
      send("CHALLENGE_GENERATED");

      // STEP 4 — Sign
      const sig = await signDocument(docB64);
      send("SIGNED");

      // STEP 5 — Verify
      const v = await verifySignature(sig.signature_id, docB64);
      if (!v?.valid) throw new Error("Signature verification failed");
      send("VERIFIED");

      // STEP 6 — Wallet
      audit("INFO", "Wallet connection requested");
      const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string[]> } }).ethereum;
      if (!eth) throw new Error("MetaMask not available");
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const addr = accounts?.[0];
      if (!addr) throw new Error("No wallet account");
      if (addr.toLowerCase() !== identity.walletAddress.toLowerCase())
        throw new Error("Wallet does not match registered identity");
      setWalletAddr(addr);
      audit("SUCCESS", "Wallet connected", { addr });
      send("WALLET_CONNECTED");

      // STEP 7 — Grant
      sessionStorage.setItem(
        "qsdid.session",
        JSON.stringify({ did: identity.did, addr, issuedAt: Date.now() }),
      );
      send("ACCESS_GRANTED");
      audit("SUCCESS", "Access granted", { did: identity.did });
      toast({ title: "Authenticated", description: identity.did });
      navigate("/holder");
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      setError(msg);
      audit("ERROR", "Login failed", { error: msg });
    } finally {
      setBusy(false);
    }
  }, [identity, code, send, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Sign in with PQC</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter your authenticator code. Your wallet will be challenged with ML-DSA-65.
        </p>

        {!identity && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            No identity on this device. <button className="underline" onClick={() => navigate("/onboarding")}>Register</button>.
          </div>
        )}

        {identity && (
          <>
            <label className="mt-5 block text-xs font-medium text-foreground">6-digit code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              className="mt-1 tracking-[0.4em] text-center font-mono"
            />

            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <KeyRound className="h-3 w-3" /> State: <span className="font-mono text-foreground">{state}</span>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button onClick={handleVerify} disabled={busy || code.length !== 6} className="mt-4 w-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
              Verify & Sign
            </Button>

            {walletAddr && (
              <p className="mt-3 break-all text-center font-mono text-[10px] text-muted-foreground">{walletAddr}</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}