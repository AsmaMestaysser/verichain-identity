import { motion } from "framer-motion";
import { ArrowRight, Shield, Fingerprint, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute -top-40 -right-40 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
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
              {[
                { icon: Shield, label: "Zero-Knowledge Proofs" },
                { icon: Lock, label: "End-to-End Encrypted" },
                { icon: Fingerprint, label: "AI Fraud Detection" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Credential preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Verification Card (inspired by image 4) */}
            <div className="mx-auto max-w-sm rounded-2xl border bg-card p-6 shadow-lg" style={{ boxShadow: "var(--shadow-elevated)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-card-foreground">Verification Accepted</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Your credential has been verified successfully.</p>

              <div className="mt-5 space-y-4">
                {[
                  { label: "Valid Schema", desc: "Schema has been verified" },
                  { label: "Valid Signature", desc: "Signature has been verified" },
                  { label: "Trusted Issuer", desc: "Issuer is trusted within this ecosystem" },
                  { label: "Credential Status", desc: "Your credential status is active" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      <Shield className="h-3 w-3" /> Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 rounded-xl border bg-card px-4 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">AI Verified</p>
                  <p className="text-[10px] text-muted-foreground">Score: 99.7%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
