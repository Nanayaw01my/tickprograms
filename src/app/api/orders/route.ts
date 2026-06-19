import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { generateReference } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  eventId: z.string(),
  ticketTypeId: z.string(),
  quantity: z.number().min(1).max(10),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const [event, ticketType, user] = await Promise.all([
      prisma.event.findUnique({ where: { id: data.eventId } }),
      prisma.ticketType.findUnique({ where: { id: data.ticketTypeId } }),
      prisma.user.findUnique({ where: { id: session.user.id } }),
    ]);

    if (!event || event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event not available" }, { status: 400 });
    }

    if (!ticketType || ticketType.eventId !== data.eventId) {
      return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 });
    }

    const available = ticketType.quantity - ticketType.sold;
    if (available < data.quantity) {
      return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 });
    }

    let discount = 0;
    let promoCodeUsed: string | undefined;

    if (data.promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode.toUpperCase(), active: true },
      });

      if (
        promo &&
        (!promo.expiresAt || promo.expiresAt > new Date()) &&
        (!promo.maxUses || promo.usedCount < promo.maxUses) &&
        (!promo.eventId || promo.eventId === data.eventId)
      ) {
        if (promo.isPercent) {
          discount = (ticketType.price * data.quantity * promo.discount) / 100;
        } else {
          discount = promo.discount;
        }
        promoCodeUsed = promo.code;
      }
    }

    const amount = Math.max(0, ticketType.price * data.quantity - discount);
    const reference = generateReference();

    const order = await prisma.order.create({
      data: {
        amount,
        paymentReference: reference,
        promoCode: promoCodeUsed,
        discount,
        userId: session.user.id!,
        eventId: data.eventId,
      },
    });

    if (amount === 0) {
      // Free ticket — process immediately
      return NextResponse.json({ orderId: order.id, free: true });
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify?reference=${reference}`;

    const paystackResponse = await initializeTransaction({
      email: user!.email,
      amount,
      reference,
      callback_url: callbackUrl,
      metadata: {
        orderId: order.id,
        eventId: data.eventId,
        ticketTypeId: data.ticketTypeId,
        quantity: data.quantity,
        userId: session.user.id,
      },
    });

    await prisma.payment.create({
      data: {
        reference,
        amount,
        status: "PENDING",
        provider: "paystack",
        metadata: JSON.stringify({
          ticketTypeId: data.ticketTypeId,
          quantity: data.quantity,
        }),
        orderId: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: { id: true, title: true, date: true, venue: true, image: true },
        },
        tickets: {
          include: {
            ticketType: { select: { name: true, price: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
