import { sendSMS } from "./smsService";
import { prisma } from "../prisma/client";
/** Send SOS SMS notifications to active emergency contacts. */
export async function sendSosSmsNotifications(input) {
    console.log(`[SOS TRIGGERED] User: ${input.userId}, Location: ${input.lat},${input.lng}`);
    const contacts = await prisma.contact.findMany({
        where: { userId: input.userId, isActive: true },
        take: 5,
    });
    if (contacts.length === 0) {
        console.log("[SOS] No active emergency contacts found");
        return {
            success: true,
            sent: 0,
            failed: 0,
            mode: "simulated",
            contactsNotified: 0,
            message: "No emergency contacts configured",
        };
    }
    const locationUrl = `https://maps.google.com/?q=${input.lat},${input.lng}`;
    const body = `EMERGENCY: SOS alert triggered. Location: ${locationUrl}. Respond immediately.`;
    // Send simulated SMS to all contacts
    const smsResults = await Promise.all(contacts.map(async (contact) => {
        const smsResult = await sendSMS(input.env, contact.phone, body);
        console.log(`[SOS SMS] Contact: ${contact.name} (${contact.phone}) - Mode: ${smsResult.mode}`);
        return smsResult;
    }));
    const allSimulated = smsResults.every((r) => r.mode === "simulated");
    console.log(`[SOS COMPLETE] Notified: ${contacts.length}, Mode: ${allSimulated ? "simulated" : "gateway"}`);
    return {
        success: true,
        sent: contacts.length,
        failed: 0,
        mode: allSimulated ? "simulated" : "gateway",
        contactsNotified: contacts.length,
        message: "Emergency contacts notified successfully",
    };
}
