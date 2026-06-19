import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ ticketCode: z.string() });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ticketCode } = schema.parse(await req.json());

    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        event: { select: { id: true, title: true, date: true, venue: true } },
        user: { select: { name: true, email: true } },
        ticketType: { select: { name: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ valid: false, error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status === "USED") {
      return NextResponse.json({
        valid: false,
        error: "Ticket already used",
        checkedInAt: ticket.checkedInAt,
        ticket,
      });
    }

    if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
      return NextResponse.json({
        valid: false,
        error: `Ticket is ${ticket.status.toLowerCase()}`,
        ticket,
      });
    }

    const updated = await prisma.ticket.update({
      where: { ticketCode },
      data: { status: "USED", checkedInAt: new Date() },
      include: {
        event: { select: { id: true, title: true, date: true, venue: true } },
        user: { select: { name: true, email: true } },
        ticketType: { select: { name: true } },
      },
    });

    return NextResponse.json({ valid: true, ticket: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Validate ticket error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
