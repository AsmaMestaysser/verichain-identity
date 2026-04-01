import { motion } from "framer-motion";
import {
  Shield,
  Fingerprint,
  Lock,
  FileCheck,
  Share2,
  ScanFace,
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Decentralized Identity",
    description:
      "Create and manage your DID anchored to the blockchain. Your identity, your control.",
  },
  {
    icon: Shield,
    title: "Zero-Knowledge Proofs",
    description:
      "Prove attributes without revealing underlying data. Privacy by design.",
  },
  {
    icon: ScanFace,
    title: "AI Fraud Detection",
    description:
      "Documents analyzed with AI and visual heatmaps to detect tampering.",
  },
  {
    icon: Lock,
    title: "Encrypted Storage",
    description:
      "Secure storage via IPFS with end-to-end encryption and key ownership.",
  },
  {
    icon: FileCheck,
    title: "Verifiable Credentials",
    description:
      "Issue and verify credentials with cryptographic guarantees.",
  },
  {
    icon: Share2,
    title: "Selective Disclosure",
    description:
      "Share only what’s needed via QR or secure links with expiration.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 h-[400px] w-[400px] bg-primary/10 blur-3xl rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Features
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            A new standard for
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              {" "}digital identity
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Built for privacy, security and control — everything you need to manage credentials in a decentralized world.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl border bg-card/60 backdrop-blur-xl p-6 transition-all duration-300 hover:shadow-xl"
            >
              {/* Glow hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-primary/10 to-transparent" />

              {/* Icon */}
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border bg-background shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-primary">
                <f.icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-6" />
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {f.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>

              {/* Bottom subtle line */}
              <div className="mt-5 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-12" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}