import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDeliveryAnalytics } from "@/lib/analytics/services";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getDeliveryAnalytics();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Delivery analytics error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch delivery analytics";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
