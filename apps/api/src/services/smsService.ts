import type { Env } from "../config/env";

export interface SmsResult {
  success: boolean;
  mode: "simulated" | "gateway";
  error?: string;
}

/**
 * Simulated SMS service for demo purposes.
 * Logs SMS to console instead of sending to external APIs.
 * In production, this could integrate with real SMS gateways.
 */
export async function sendSMS(
  _env: Env,
  to: string,
  message: string
): Promise<SmsResult> {
  // Simulate SMS dispatch
  console.log(`[SMS SIMULATED] To: ${to}`);
  console.log(`[SMS SIMULATED] Message: ${message.substring(0, 50)}...`);
  console.log(`[SMS SIMULATED] Status: ✓ Sent (Simulated)`);

  // Return success for demo purposes
  return {
    success: true,
    mode: "simulated",
  };
}
