import twilio from "twilio";
import type { Env } from "../config/env";
import { prisma } from "../prisma/client";

/** Send SOS SMS notifications to active emergency contacts. */
export async function sendSosSmsNotifications(input: {
  env: Env;
  userId: string;
  lat: number;
  lng: number;
}): Promise<void> {
  const accountSid = input.env.TWILIO_ACCOUNT_SID;
  const authToken = input.env.TWILIO_AUTH_TOKEN;
  const fromNumber = input.env.TWILIO_FROM_NUMBER ?? input.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    if (input.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("Twilio not configured; skipping SOS SMS dispatch.");
    }
    return;
  }

  const contacts = await prisma.contact.findMany({
    where: { userId: input.userId, isActive: true },
    take: 5,
  });
  if (contacts.length === 0) return;

  const client = twilio(accountSid, authToken);
  const locationUrl = `https://maps.google.com/?q=${input.lat},${input.lng}`;
  const body = `EMERGENCY: ${input.userId} has triggered an SOS alert. Their location: ${locationUrl}. Respond immediately.`;

  await Promise.allSettled(
    contacts.map((contact) =>
      client.messages.create({
        from: fromNumber,
        to: contact.phone,
        body,
      }),
    ),
  );
}

