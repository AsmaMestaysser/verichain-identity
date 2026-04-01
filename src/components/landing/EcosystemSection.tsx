import { motion } from "framer-motion";
import { ArrowRight, Database, FileSignature, Users, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Database,
    label: "Data Source",
    description: "Organizations maintain authoritative records of identity attributes and qualifications.",
  },
  {
    icon: FileSignature,
    label: "Issues Credential",
    description: "Trusted issuers create verifiable credentials signed with their DID and anchored on-chain.",
  },
  {
    icon: Users,
    label: "Holders",
    description: "Individuals store credentials in their wallet and choose what to share, when, and with whom.",
  },
  {
    icon: ShieldCheck,
    label: "Relying Parties",
    description: "Verifiers validate credentials cryptographically without contacting the issuer.",
  },
];

export function EcosystemSection() {
  return (
    <section id="ecosystem" className="py-20 sm:py-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Ecosystem</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Customize your ecosystem of issuers, holders and verifiers
          </h2>
          <p className="mt-4 text-muted-foreground">
            Make it easier and safer for people and organizations to share
            information with one another — powered by decentralized trust.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative rounded-xl border bg-card p-6"
            >
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground lg:block" />
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="mt-4 block text-xs font-medium text-primary">0{i + 1}</span>
              <h3 className="mt-1 text-base font-semibold text-card-foreground">{step.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
