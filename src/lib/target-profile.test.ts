import { describe, expect, it } from "vitest";
import { storageFreeGb, storageUsagePercent, targetProfile, targetProfileSummary } from "./target-profile";

describe("target profile", () => {
  it("captures the intended Windows 11 Dev Channel machine", () => {
    expect(targetProfile.deviceName).toBe("DESKTOP-HI525Q3");
    expect(targetProfile.operatingSystem.edition).toBe("Windows 11 Pro Insider Preview");
    expect(targetProfile.operatingSystem.version).toBe("Dev");
    expect(targetProfile.operatingSystem.build).toBe("29648.1000");
    expect(targetProfile.hardware.ramGb).toBe(20);
    expect(targetProfile.hardware.graphics).toContain("NVIDIA GeForce MX330 (2 GB)");
  });

  it("derives storage facts from the provided capacity", () => {
    expect(storageFreeGb()).toBe(331);
    expect(storageUsagePercent()).toBe(29);
  });

  it("summarizes the target without dropping key hardware", () => {
    const summary = targetProfileSummary();
    expect(summary).toContain("build 29648.1000");
    expect(summary).toContain("i7-10510U");
    expect(summary).toContain("NVIDIA GeForce MX330");
  });
});
