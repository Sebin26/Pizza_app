export async function sendOtp(phone: string, code: string): Promise<void> {
  console.log(`📱 [MOCK SMS] OTP for ${phone}: ${code}`);
}
