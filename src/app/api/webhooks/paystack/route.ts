import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, verifyTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { generateQRCode, generateTicketCode } from "@/lib/qrcode";
import { sendTicketConfirmationEmail } from "@/lib/email";
import { sendTicketSMS } from "@/lib/arkesel";
import { formatDateTime } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { order: { include: { user: true } } },
      });

      if (!payment || payment.status === "SUCCESS") {
        return NextResponse.json({ received: true });
      }

      const paystackData = await verifyTransaction(reference);
      if (paystackData.data.status !== "success") {
        return NextResponse.json({ received: true });
      }

      const metadata = JSON.parse(payment.metadata || "{}");
      const { ticketTypeId, quantity } = metadata;

      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
        include: { event: true },
      });

      if (!ticketType) return NextResponse.json({ received: true });

      const ticketPromises = [];
      for (let i = 0; i < quantity; i++) {
        const ticketCode = generateTicketCode();
        const qrData = JSON.stringify({
          ticketCode,
          eventId: ticketType.eventId,
          orderId: payment.orderId,
        });
        const qrCode = await generateQRCode(qrData);

        ticketPromises.push(
          prisma.ticket.create({
            data: {
              ticketCode,
              qrCode,
              status: "ACTIVE",
              eventId: ticketType.eventId,
              userId: payment.order.userId,
              ticketTypeId,
              orderId: payment.orderId,
            },
          })
        );
      }

      const tickets = await Promise.all(ticketPromises);

      await Promise.all([
        prisma.payment.update({ where: { reference }, data: { status: "SUCCESS" } }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "SUCCESS" },
        }),
        prisma.ticketType.update({
          where: { id: ticketTypeId },
          data: { sold: { increment: quantity } },
        }),
      ]);

      const user = payment.order.user;
      const eventDate = formatDateTime(ticketType.event.date);

      sendTicketConfirmationEmail(user.email, {
        eventName: ticketType.event.title,
        ticketId: tickets[0].ticketCode,
        eventDate,
        venue: ticketType.event.venue,
      }).catch(console.error);

      if (user.phone) {
        sendTicketSMS(user.phone, ticketType.event.title, tickets[0].ticketCode).catch(
          console.error
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
