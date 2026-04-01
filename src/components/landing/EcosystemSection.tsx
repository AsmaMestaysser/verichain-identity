import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Database, ShieldCheck, KeyRound, ArrowRight } from "lucide-react";

const accordionItems = [
  {
    number: "01",
    title: "Onboard issuers and verifiers",
    content:
      "Register trusted organizations as credential issuers or verifiers within the QS·DID ecosystem. Each entity receives a unique DID anchored on-chain.",
  },
  {
    number: "02",
    title: "Establish trust in your ecosystem",
    content:
      "Define trust frameworks, credential schemas, and verification policies. Build a network of trusted participants with transparent governance.",
  },
  {
    number: "03",
    title: "Launch credential issuance and ZKP verification",
    content:
      "Start issuing verifiable credentials to holders and enable privacy-preserving verification through zero-knowledge proofs — no intermediaries needed.",
  },
];

const avatarSeeds = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank",
  "Grace", "Hank", "Ivy", "Jack", "Karen", "Leo",
];

function Avatar({ seed, size = 36 }: { seed: string; size?: number }) {
  const colors = ["4F46E5", "0EA5E9", "10B981", "F59E0B", "EF4444", "8B5CF6"];
  const bg = colors[seed.length % colors.length];
  return (
    <img
      src={`https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=${bg}`}
      alt={seed}
      className="rounded-full border-2 border-background shadow-sm"
      style={{ width: size, height: size }}
    />
  );
}

export function EcosystemSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="ecosystem" className="py-20 sm:py-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — Accordion */}
          <div>
            <span className="text-sm font-semibold tracking-wide text-primary">Ecosystem tooling</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
              Customize your ecosystem of issuers, holders and verifiers
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              Make it easier and safer for people and organizations to share
              information with one another.
            </p>

            <div className="mt-10 divide-y divide-border">
              {accordionItems.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={item.number} className="py-5">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="text-sm font-semibold text-primary">{item.number}</span>
                        <span className="text-base font-semibold text-foreground sm:text-lg">{item.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 pl-8 text-sm leading-relaxed text-muted-foreground">
                            {item.content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — Visual flow diagram */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col items-center pt-4"
          >
            {/* Provider card */}
            <div className="relative z-10 rounded-xl border bg-card px-6 py-4 shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Your team
              </span>
              <div className="flex items-center gap-3 mt-1">
                <Avatar seed="Sarah" size={40} />
                <Avatar seed="Mohamed" size={44} />
                <Avatar seed="Yuki" size={40} />
              </div>
              <p className="mt-2 text-center text-sm font-semibold text-card-foreground">Provider</p>
            </div>

            {/* Connector icon */}
            <div className="my-3 flex h-8 w-8 items-center justify-center rounded-full border bg-card shadow-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>

            {/* Arc / fan shape with holders */}
            <div className="relative w-full max-w-md">
              {/* Arc background */}
              <svg viewBox="0 0 400 200" className="w-full" fill="none">
                {[180, 160, 140, 120].map((r, i) => (
                  <path
                    key={i}
                    d={`M ${200 - r} 200 A ${r} ${r} 0 0 1 ${200 + r} 200`}
                    stroke="hsl(220 90% 56% / 0.12)"
                    strokeWidth="1"
                    strokeDasharray={i % 2 === 0 ? "4 4" : "none"}
                  />
                ))}
              </svg>

              {/* Holders cluster */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex flex-col items-center gap-1">
                  {/* Row 1 */}
                  <div className="flex gap-1">
                    {avatarSeeds.slice(0, 4).map((s) => (
                      <Avatar key={s} seed={s} size={28} />
                    ))}
                  </div>
                  {/* Row 2 */}
                  <div className="flex gap-1">
                    {avatarSeeds.slice(4, 9).map((s) => (
                      <Avatar key={s} seed={s} size={28} />
                    ))}
                  </div>
                  {/* Row 3 */}
                  <div className="flex gap-1">
                    {avatarSeeds.slice(9, 12).map((s) => (
                      <Avatar key={s} seed={s} size={28} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-center text-sm font-bold text-foreground">Holders</p>
              </div>
            </div>

            {/* Bottom flow: Data Source → Issues → Holders → Shares → Relying */}
            <div className="mt-6 flex w-full items-center justify-between gap-2 px-2">
              {/* Data source */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-card shadow-sm">
                  <Database className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-medium text-foreground">Data source</span>
                <div className="h-1 w-12 rounded-full bg-muted" />
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

              {/* Issues credential */}
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-lg border bg-card px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-medium text-foreground">Issues credential</span>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

              {/* Shares credential */}
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-lg border bg-card px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-medium text-foreground">Shares Credential</span>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

              {/* Relying Parties */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-card shadow-sm">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-medium text-foreground whitespace-nowrap">Relying Parties</span>
                <div className="h-1 w-12 rounded-full bg-muted" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
