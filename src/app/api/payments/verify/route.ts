import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { generateQRCode, generateTicketCode } from "@/lib/qrcode";
import { sendTicketConfirmationEmail } from "@/lib/email";
import { sendTicketSMS } from "@/lib/arkesel";
import { formatDateTime } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "SUCCESS") {
      return NextResponse.json({ status: "success", orderId: payment.orderId });
    }

    const paystackData = await verifyTransaction(reference);

    if (paystackData.data.status !== "success") {
      await prisma.payment.update({
        where: { reference },
        data: { status: "FAILED" },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ status: "failed" });
    }

    const metadata = JSON.parse(payment.metadata || "{}");
    const { ticketTypeId, quantity } = metadata;

    const [ticketType, order] = await Promise.all([
      prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
        include: { event: true },
      }),
      prisma.order.findUnique({
        where: { id: payment.orderId },
        include: { user: true },
      }),
    ]);

    if (!ticketType || !order) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    // Create tickets
    const ticketPromises = [];
    for (let i = 0; i < quantity; i++) {
      const ticketCode = generateTicketCode();
      const qrData = JSON.stringify({
        ticketCode,
        eventId: ticketType.eventId,
        orderId: order.id,
      });
      const qrCode = await generateQRCode(qrData);

      ticketPromises.push(
        prisma.ticket.create({
          data: {
            ticketCode,
            qrCode,
            status: "ACTIVE",
            eventId: ticketType.eventId,
            userId: order.userId,
            ticketTypeId,
            orderId: order.id,
          },
        })
      );
    }

    const tickets = await Promise.all(ticketPromises);

    await Promise.all([
      prisma.payment.update({
        where: { reference },
        data: { status: "SUCCESS" },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "SUCCESS" },
      }),
      prisma.ticketType.update({
        where: { id: ticketTypeId },
        data: { sold: { increment: quantity } },
      }),
      ...(order.promoCode
        ? [prisma.promoCode.update({
            where: { code: order.promoCode },
            data: { usedCount: { increment: 1 } },
          })]
        : []),
    ]);

    // Send notifications
    const eventDate = formatDateTime(ticketType.event.date);
    sendTicketConfirmationEmail(order.user.email, {
      eventName: ticketType.event.title,
      ticketId: tickets[0].ticketCode,
      eventDate,
      venue: ticketType.event.venue,
    }).catch(console.error);

    if (order.user.phone) {
      sendTicketSMS(
        order.user.phone,
        ticketType.event.title,
        tickets[0].ticketCode
      ).catch(console.error);
    }

    return NextResponse.json({ status: "success", orderId: payment.orderId });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
