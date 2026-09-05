import { NextResponse } from "next/server";
import { storageFreeGb, storageUsagePercent, targetProfile, targetProfileSummary } from "@/lib/target-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...targetProfile,
    summary: targetProfileSummary(),
    storage: {
      usedPercent: storageUsagePercent(),
      freeGb: storageFreeGb(),
    },
  });
}
