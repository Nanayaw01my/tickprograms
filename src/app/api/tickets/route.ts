import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: { id: true, title: true, date: true, venue: true, image: true },
        },
        ticketType: { select: { name: true, price: true } },
        order: { select: { id: true, amount: true, paymentStatus: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
