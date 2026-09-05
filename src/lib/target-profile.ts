export const targetProfile = {
  deviceName: "DESKTOP-HI525Q3",
  operatingSystem: {
    edition: "Windows 11 Pro Insider Preview",
    version: "Dev",
    installedOn: "2026-08-31",
    evaluationExpires: "2027-11-01 05:13",
    build: "29648.1000",
    experience: "Windows Feature Experience Pack 1000.26100.408.0",
  },
  hardware: {
    processor: "Intel(R) Core(TM) i7-10510U CPU @ 1.80GHz (2.30 GHz)",
    ramGb: 20,
    usableRamGb: 19.8,
    graphics: ["NVIDIA GeForce MX330 (2 GB)", "Intel(R) UHD Graphics (128 MB)"],
    storageUsedGb: 135,
    storageTotalGb: 466,
  },
  optimizationFocus: [
    "Prioritize safe Windows 11 Dev Channel privacy and telemetry controls that remain reversible.",
    "Use balanced performance settings for a 10th Gen low-voltage i7 to avoid unnecessary heat and battery drain.",
    "Keep NVIDIA MX330 services and graphics components protected; do not debloat GPU drivers or hybrid graphics support.",
    "Prefer moderate startup cleanup and background-app reduction instead of aggressive service disabling.",
    "Keep at least 20% disk free before ISO building, component cleanup, or large Windows Update operations.",
  ],
  recommendedPresets: ["standard", "privacy"],
  avoidPresets: ["expert"],
} as const;

export type TargetProfile = typeof targetProfile;

export function storageUsagePercent(profile: TargetProfile = targetProfile): number {
  return Math.round((profile.hardware.storageUsedGb / profile.hardware.storageTotalGb) * 100);
}

export function storageFreeGb(profile: TargetProfile = targetProfile): number {
  return Number((profile.hardware.storageTotalGb - profile.hardware.storageUsedGb).toFixed(1));
}

export function targetProfileSummary(profile: TargetProfile = targetProfile): string {
  return `${profile.operatingSystem.edition} build ${profile.operatingSystem.build} on ${profile.hardware.processor}, ${profile.hardware.ramGb} GB RAM, ${profile.hardware.graphics.join(" + ")}`;
}
