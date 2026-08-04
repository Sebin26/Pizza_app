import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivityAnalytics } from "@/lib/analytics/services";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getActivityAnalytics();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Activity analytics error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch activity analytics";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
