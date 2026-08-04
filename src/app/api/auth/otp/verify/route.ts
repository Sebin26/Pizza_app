import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setCustomerSession } from "@/lib/customerSession";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code } = body || {};

    if (!phone || typeof phone !== "string" || !phone.trim() || !code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const trimmedPhone = phone.trim();
    const trimmedCode = code.trim();
    const now = new Date();

    // Find the most recent unverified, unexpired OtpCode for this phone
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone: trimmedPhone,
        verified: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    // Check if max failed attempts (5) has already been reached on this code
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    // Check if code matches
    if (otpRecord.code !== trimmedCode) {
      const updatedRecord = await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      if (updatedRecord.attempts >= 5) {
        return NextResponse.json(
          { error: "Too many failed attempts. Please request a new code." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // On match: mark OtpCode.verified = true
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Find-or-create a Customer by phone
    let customer = await prisma.customer.findUnique({
      where: { phone: trimmedPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { phone: trimmedPhone },
      });
    }

    // Issue signed session cookie for customer
    await setCustomerSession({
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
      },
    });
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
