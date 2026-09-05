import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { computeHealthReport } from "@/lib/health";
import { recordHealthSnapshot } from "@/lib/actions";
import { debloatPackages, presets, tweaks, windowsUpdates } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { MetricsPanel } from "@/components/MetricsPanel";
import { SystemInfo } from "@/components/SystemInfo";
import { QuickScan } from "@/components/QuickScan";
import { HealthPanel } from "@/components/HealthPanel";
import { EngineStatusCard } from "@/components/EngineStatusCard";
import { EngineTweaks } from "@/components/EngineTweaks";
import { Banner } from "@/components/ui";
import { PresetButtons } from "./PresetButtons";
import { PageHeader } from "@/components/PageHeader";
import { targetProfile } from "@/lib/target-profile";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type DashboardData =
  | {
      ok: true;
      health: Awaited<ReturnType<typeof computeHealthReport>>;
      allPresets: { id: string; name: string; description: string }[];
      bloatCount: number;
      appliedTweaks: number;
      totalTweaks: number;
      pendingUpdates: number;
    }
  | { ok: false; reason: string };

async function loadDashboardData(): Promise<DashboardData> {
  try {
    await ensureSeeded();
    const health = await computeHealthReport();
    await recordHealthSnapshot(); // throttled to 1/hour
    const allPresets = await db.select().from(presets);
    const bloatCount = (
      await db
        .select()
        .from(debloatPackages)
        .where(and(eq(debloatPackages.status, "installed"), ne(debloatPackages.category, "Protected")))
    ).length;
    const allTweaks = await db.select().from(tweaks);
    const pendingUpdates = await db
      .select()
      .from(windowsUpdates)
      .where(and(eq(windowsUpdates.installed, false), eq(windowsUpdates.hidden, false)));

    return {
      ok: true,
      health,
      allPresets,
      bloatCount,
      appliedTweaks: allTweaks.filter((t) => t.applied).length,
      totalTweaks: allTweaks.length,
      pendingUpdates: pendingUpdates.length,
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "database unavailable" };
  }
}

export default async function DashboardPage() {
  const data = await loadDashboardData();
  if (!data.ok) {
    return <OfflineDashboard reason={data.reason} />;
  }

  const { health } = data;

  return (
    <DashboardShell>
      <div className="mt-6">
        <HealthPanel
          initialScore={health.score}
          initialPrivacy={health.privacyScore}
          initialBloat={data.bloatCount}
          initialApplied={data.appliedTweaks}
          initialTotal={data.totalTweaks}
          initialPending={data.pendingUpdates}
        />
      </div>

      <div className="mt-6">
        <EngineStatusCard />
      </div>

      <div className="mt-6">
        <EngineTweaks />
      </div>

      <div className="mt-6 space-y-2">
        {health.warnings.length === 0 ? (
          <Banner>✅ No critical alerts — your system looks healthy.</Banner>
        ) : (
          health.warnings.map((w, i) => (
            <Banner key={i} tone="warn">
              ⚠️ {w}
            </Banner>
          ))
        )}
      </div>

      <div className="mt-6">
        <MetricsPanel />
      </div>

      <SystemInformationSection />

      <div className="mt-6">
        <QuickScan />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Quick Wins</h3>
          <ul className="space-y-2">
            {health.quickWins.map((qw, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-0.5 text-sky-400">→</span>
                {qw}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-3 text-sm font-semibold text-white">One-Click Presets</h3>
          <p className="mb-4 text-xs text-slate-500">
            Applies a curated bundle of tweaks, debloat targets, and privacy rules. A restore point
            is created automatically before changes are made.
          </p>
          <PresetButtons presets={data.allPresets.map((p) => ({ id: p.id, name: p.name, description: p.description }))} />
        </div>
      </div>
    </DashboardShell>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Focused for ${targetProfile.deviceName}: ${targetProfile.operatingSystem.edition} build ${targetProfile.operatingSystem.build}.`}
      />
      {children}
    </div>
  );
}

function SystemInformationSection() {
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-white">System Information</h3>
      <SystemInfo />
    </div>
  );
}

function OfflineDashboard({ reason }: { reason: string }) {
  return (
    <DashboardShell>
      <div className="mt-6">
        <Banner tone="warn">
          Database-backed simulation is offline ({reason}). Showing the Windows 11 target profile and live runtime telemetry only.
        </Banner>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Target Build</p>
          <p className="mt-2 text-2xl font-semibold text-white">{targetProfile.operatingSystem.build}</p>
          <p className="mt-1 text-xs text-slate-500">Windows 11 Dev Channel</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Target RAM</p>
          <p className="mt-2 text-2xl font-semibold text-white">{targetProfile.hardware.ramGb} GB</p>
          <p className="mt-1 text-xs text-slate-500">{targetProfile.hardware.usableRamGb} GB usable</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Target GPU</p>
          <p className="mt-2 text-lg font-semibold text-white">NVIDIA MX330</p>
          <p className="mt-1 text-xs text-slate-500">Hybrid Intel UHD graphics protected</p>
        </div>
      </div>

      <div className="mt-6">
        <MetricsPanel />
      </div>

      <SystemInformationSection />
    </DashboardShell>
  );
}
