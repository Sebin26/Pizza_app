import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtp } from "@/lib/otp/sendOtp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body || {};

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const trimmedPhone = phone.trim();
    const now = new Date();
    const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

    // Rate limit: Check if an unexpired OtpCode was created in the last 60 seconds for this phone
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        phone: trimmedPhone,
        createdAt: { gte: sixtySecondsAgo },
        expiresAt: { gt: now },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting another code" },
        { status: 429 }
      );
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes expiry

    await prisma.otpCode.create({
      data: {
        phone: trimmedPhone,
        code,
        expiresAt,
      },
    });

    // Send OTP via mock SMS provider
    await sendOtp(trimmedPhone, code);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Send OTP error:", error);
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
