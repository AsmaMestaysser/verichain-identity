// pages/IssuerDashboard.tsx
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Inbox, ShieldX, KeyRound } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DIDBar } from "@/components/identity/DIDBar";
import { StatCards, type StatCardConfig } from "@/components/dashboard/StatCards";
import { RecentCredentials } from "@/components/dashboard/RecentCredentials";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions, type QuickActionConfig } from "@/components/dashboard/QuickActions";
import { mockNotifications, mockIssuer } from "@/lib/mock-data";

const MOCK_WALLET = "0x8b2d1e4f7a3c6b9d0e5f2a8c1b4d7e6f3a9c2b5d";

export default function IssuerDashboard() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: "easeOut" as const, delay: delay / 1000 },
  });

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const issuerStats: StatCardConfig[] = [
    { label: "Credentials issued", value: mockIssuer.stats.issued, icon: BadgeCheck, subtext: "Total", subColor: "text-muted-foreground" },
    { label: "Pending requests", value: mockIssuer.stats.pending, icon: Inbox, subtext: "Awaiting review", subColor: "text-amber-500" },
    { label: "Revocations issued", value: mockIssuer.stats.revoked, icon: ShieldX, subtext: "All time", subColor: "text-muted-foreground" },
    { label: "Registered keys", value: mockIssuer.stats.keys, icon: KeyRound, subtext: "Active keypairs", subColor: "text-green-600" },
  ];

  const issuerActions: QuickActionConfig[] = [
    { icon: Inbox, label: "Review requests", href: "/issuer/requests" },
    { icon: BadgeCheck, label: "Issue credential", href: "/issuer/issue" },
    { icon: KeyRound, label: "Manage keys", href: "/issuer/settings" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar walletAddress={MOCK_WALLET} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-lg px-4">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">Issuer Dashboard</span>
          </header>

          <main className="flex-1 overflow-y-auto flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <motion.div {...fadeUp(0)} className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Overview</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Welcome back, {mockIssuer.name} — {formattedDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell notifications={mockNotifications} />
              </div>
            </motion.div>

            <motion.div {...fadeUp(60)}>
              <DIDBar did={mockIssuer.did} chain="ZKsync Atlas L2" />
            </motion.div>

            <StatCards configs={issuerStats} baseDelay={120} />

            <motion.div {...fadeUp(250)} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
              <RecentCredentials credentials={mockIssuer.credentials} viewAllHref="/issuer/credentials" />
              <RecentActivity events={mockIssuer.activity} />
            </motion.div>

            <motion.div {...fadeUp(320)}>
              <QuickActions actions={issuerActions} />
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
