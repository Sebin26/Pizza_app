import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSalesAnalytics } from "@/lib/analytics/services";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    const data = await getSalesAnalytics(range);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Sales analytics error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch sales analytics";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
