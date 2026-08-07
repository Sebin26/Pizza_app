import { NextResponse } from "next/server";
import { destroyCustomerSession } from "@/lib/customerSession";

export async function POST() {
  await destroyCustomerSession();
  return NextResponse.json({ success: true });
}
