import { motion } from "framer-motion";
import { Shield, Fingerprint, Lock, FileCheck, Share2, ScanFace } from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Decentralized Identity",
    description: "Create and manage your DID anchored to the blockchain. Your identity, your control — no central authority.",
  },
  {
    icon: Shield,
    title: "Zero-Knowledge Proofs",
    description: "Prove attributes about yourself without revealing the underlying data. Share only what's needed.",
  },
  {
    icon: ScanFace,
    title: "AI Fraud Detection",
    description: "Every uploaded document is analyzed by our EdgeDoc AI model with heatmap overlays for authenticity verification.",
  },
  {
    icon: Lock,
    title: "Encrypted Storage",
    description: "Documents and credentials are encrypted and stored on IPFS. Only you hold the decryption keys.",
  },
  {
    icon: FileCheck,
    title: "Verifiable Credentials",
    description: "Issue and receive W3C-compliant verifiable credentials with cryptographic signatures and on-chain anchoring.",
  },
  {
    icon: Share2,
    title: "Selective Disclosure",
    description: "Share credentials via QR codes or links with fine-grained attribute selection and optional expiration.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Features</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need for sovereign identity
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A complete toolkit for holders, issuers, and verifiers to manage decentralized credentials
            with privacy, security, and trust built in.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
