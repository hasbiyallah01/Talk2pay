// Utility to fetch the latest OTP for a user (for fallback display)
// This is a DEV-ONLY endpoint and should be removed in production!
export async function fetchLatestOtp(phone: string): Promise<string | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/dev-latest-otp?phoneNumber=${encodeURIComponent(phone)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data?.otp || null;
    } catch {
        return null;
    }
}
