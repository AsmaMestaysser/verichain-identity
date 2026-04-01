import { useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Fingerprint, Lock, User, QrCode, Cpu, AlertTriangle, CheckCircle2, Wallet, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

type Phase = "opening" | "capture" | "processing" | "alert" | "success";

function ProgressBar({ label, delay, phase }: { label: string; delay: number; phase: Phase }) {
  const active = phase === "processing" || phase === "alert" || phase === "success";
  const complete = phase === "success";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground">{label}</span>
        {complete && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--gradient-primary)" }}
          initial={{ width: "0%" }}
          animate={active ? { width: "100%" } : { width: "0%" }}
          transition={{ duration: 2, delay, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function GlowCircle({ children, size = 80, pulse = false }: { children: React.ReactNode; size?: number; pulse?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div
        className="flex items-center justify-center rounded-full border border-primary/30 bg-card"
        style={{ width: size, height: size, boxShadow: "0 0 20px hsl(220 90% 56% / 0.2)" }}
      >
        {children}
      </div>
    </div>
  );
}

function HeroAnimation() {
  const [phase, setPhase] = useState<Phase>("opening");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("capture"), 3000),
      setTimeout(() => setPhase("processing"), 5000),
      setTimeout(() => setPhase("alert"), 6500),
      setTimeout(() => setPhase("success"), 8500),
      setTimeout(() => setPhase("opening"), 12000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase === "opening" ? Date.now() : 0]);

  return (
    <div
      className="relative mx-auto h-[420px] w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Top logo */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-sm font-bold text-foreground tracking-tight">QS·DID</span>
      </div>

      <AnimatePresence mode="wait">
        {/* OPENING PHASE */}
        {phase === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <GlowCircle size={72} pulse>
              <User className="h-8 w-8 text-primary" />
            </GlowCircle>

            <div className="flex w-full items-start justify-between gap-3">
              {[{ icon: Shield, label: "Issuer" }, { icon: Wallet, label: "Holder" }, { icon: BadgeCheck, label: "Verifier" }].map(
                ({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="h-8 w-px bg-primary/20" />
                    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-primary/10 bg-secondary/50 px-3 py-3 backdrop-blur-sm">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-semibold text-foreground">{label}</span>
                    </div>
                  </motion.div>
                )
              )}
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">Decentralized identity verification flow</p>
          </motion.div>
        )}

        {/* CAPTURE PHASE */}
        {phase === "capture" && (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-primary"
            >
              Identity verification in progress
            </motion.p>

            <div className="flex items-center gap-8">
              <GlowCircle size={80}>
                <User className="h-10 w-10 text-primary/60" />
              </GlowCircle>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative flex h-28 w-16 flex-col items-center justify-center rounded-xl border-2 border-primary/30 bg-secondary/50"
                style={{ boxShadow: "0 0 15px hsl(220 90% 56% / 0.15)" }}
              >
                <QrCode className="h-8 w-8 text-primary" />
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-primary/40"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </div>

            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">Scanning credentials…</p>
          </motion.div>
        )}

        {/* PROCESSING + ALERT + SUCCESS PHASES */}
        {(phase === "processing" || phase === "alert" || phase === "success") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            <div className="space-y-3">
              <ProgressBar label="Post-Quantum Crypto" delay={0} phase={phase} />
              <ProgressBar label="EdgeDoc AI Analysis" delay={0.3} phase={phase} />
              <ProgressBar label="ZKsync Anchoring" delay={0.6} phase={phase} />
            </div>

            <div className="mt-2 flex items-center gap-3 rounded-lg border bg-secondary/30 p-3">
              <div className="flex h-14 w-10 items-center justify-center rounded border bg-muted">
                <Cpu className="h-5 w-5 text-primary/50" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium text-foreground">Document Heatmap</p>
                <div className="mt-1 flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-sm"
                      style={{
                        background:
                          i < 3
                            ? `hsl(var(--success) / ${0.4 + i * 0.2})`
                            : `hsl(var(--primary) / ${0.2 + (i - 3) * 0.1})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {phase === "alert" && (
                <motion.div
                  key="alert-badge"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2"
                >
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <AlertTriangle className="h-4 w-4" style={{ color: "hsl(var(--warning))" }} />
                  </motion.div>
                  <span className="text-[11px] font-medium text-foreground">Scanning for forgeries…</span>
                </motion.div>
              )}

              {phase === "success" && (
                <motion.div
                  key="success-badge"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <p className="text-xs font-semibold text-foreground">
                    Identity verified — quantum‑secure & AI‑confirmed
                  </p>

                  <div className="mt-1 flex items-center gap-3">
                    {[Shield, Wallet, BadgeCheck].map((Icon, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.15 }}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-card"
                      >
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute -top-40 -right-40 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-primary shadow-sm">
              <Shield className="h-3 w-3" /> Self-Sovereign Identity Platform
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Own Your
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                {" "}Digital Identity
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Issue, hold, and verify decentralized credentials with AI-powered fraud detection,
              zero-knowledge proofs, and blockchain-backed trust — no intermediaries required.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2">
                Connect Wallet <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Learn More
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6">
              {[{ icon: Shield, label: "Zero-Knowledge Proofs" }, { icon: Lock, label: "End-to-End Encrypted" }, { icon: Fingerprint, label: "AI Fraud Detection" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeroAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}