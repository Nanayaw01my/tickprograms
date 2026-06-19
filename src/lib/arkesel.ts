import axios from "axios";

const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY!;
const ARKESEL_SENDER_ID = process.env.ARKESEL_SENDER_ID || "TicketHub";

export async function sendSMS(to: string, message: string) {
  try {
    const response = await axios.get("https://sms.arkesel.com/sms/api", {
      params: {
        action: "send-sms",
        api_key: ARKESEL_API_KEY,
        to,
        from: ARKESEL_SENDER_ID,
        sms: message,
      },
    });
    return response.data;
  } catch (error) {
    console.error("SMS send failed:", error);
    throw error;
  }
}

export async function sendRegistrationSMS(phone: string, name: string) {
  const message = `Welcome to TicketHub, ${name}! Your account has been created successfully. Start exploring amazing events today.`;
  return sendSMS(phone, message);
}

export async function sendTicketSMS(
  phone: string,
  eventName: string,
  ticketId: string
) {
  const message = `Your ticket for ${eventName} has been successfully purchased. Ticket ID: ${ticketId}. Show your QR code at the venue. - TicketHub`;
  return sendSMS(phone, message);
}

export async function sendEventReminderSMS(
  phone: string,
  eventName: string,
  venue: string,
  date: string
) {
  const message = `Reminder: ${eventName} is happening tomorrow at ${venue} on ${date}. Don't forget to bring your ticket QR code! - TicketHub`;
  return sendSMS(phone, message);
}
