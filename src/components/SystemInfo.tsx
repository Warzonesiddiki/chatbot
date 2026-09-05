"use client";

import { useEffect, useState } from "react";
import { storageFreeGb, storageUsagePercent, targetProfile } from "@/lib/target-profile";

interface SysInfo {
  cpuModel: string;
  cpuCores: number;
  totalMemGb: number;
  freeMemGb: number;
  diskTotalGb: number;
  diskUsedGb: number;
  platform: string;
  hostname: string;
  uptimeHours: number;
}

export function SystemInfo() {
  const [info, setInfo] = useState<SysInfo | null>(null);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  const osInfo = targetProfile.operatingSystem;
  const hardware = targetProfile.hardware;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-sky-100">Target PC profile locked for this build</h4>
            <p className="mt-1 text-xs leading-5 text-sky-100/75">
              WinForge recommendations and labels are focused on {targetProfile.deviceName}: Windows 11 Dev Channel,
              10th Gen Intel i7, 20 GB RAM, hybrid Intel/NVIDIA graphics, and a 466 GB system disk.
            </p>
          </div>
          <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-100">
            {storageUsagePercent()}% disk used · {storageFreeGb()} GB free
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Operating System</h4>
          <div className="space-y-2 text-sm">
            <Row label="Edition" value={osInfo.edition} small />
            <Row label="Version" value={osInfo.version} />
            <Row label="Installed On" value={osInfo.installedOn} />
            <Row label="Evaluation Expires" value={osInfo.evaluationExpires} small />
            <Row label="OS Build" value={osInfo.build} />
            <Row label="Experience" value={osInfo.experience} small />
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Hardware</h4>
          <div className="space-y-2 text-sm">
            <Row label="Device" value={targetProfile.deviceName} />
            <Row label="Processor" value={hardware.processor} small />
            <Row label="RAM" value={`${hardware.ramGb} GB (${hardware.usableRamGb} GB usable)`} />
            <Row label="Graphics" value={hardware.graphics.join(" + ")} small />
            <Row label="System Disk" value={`${hardware.storageUsedGb} GB used of ${hardware.storageTotalGb} GB`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">PC-Specific Safety Focus</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {targetProfile.optimizationFocus.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Live Runtime Source</h4>
          {info ? (
            <div className="space-y-2 text-sm">
              <Row label="Telemetry Host" value={info.hostname} small />
              <Row label="Runtime CPU" value={info.cpuModel} small />
              <Row label="Logical CPUs" value={`${info.cpuCores}`} />
              <Row label="Runtime RAM" value={`${info.totalMemGb} GB total (${info.freeMemGb} GB free)`} />
              <Row label="Runtime Disk" value={`${info.diskUsedGb} GB used of ${info.diskTotalGb} GB`} />
              <Row label="Uptime" value={`${info.uptimeHours} hours`} />
            </div>
          ) : (
            <div className="h-24 animate-pulse rounded-xl bg-white/5" />
          )}
          <p className="mt-3 text-xs text-slate-500">
            In the Linux/Next.js demo this section shows the server sandbox. On your Windows EXE, the engine reads the local PC.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone, small }: { label: string; value: string; tone?: "green" | "amber" | "red"; small?: boolean }) {
  const toneClass = tone === "green" ? "text-emerald-400" : tone === "amber" ? "text-amber-400" : tone === "red" ? "text-red-400" : "text-white";
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400">{label}</span>
      <span className={`text-right ${toneClass} ${small ? "max-w-[240px] truncate text-xs" : ""}`} title={value}>{value}</span>
    </div>
  );
}
