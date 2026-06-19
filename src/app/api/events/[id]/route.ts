import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        organizer: { select: { id: true, name: true, email: true, image: true } },
        ticketTypes: true,
        _count: { select: { tickets: true, orders: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (
      !user ||
      (user.role !== "ADMIN" && event.organizerId !== session.user.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { ticketTypes, ...updateData } = body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : null,
      },
      include: {
        ticketTypes: true,
        category: true,
        organizer: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (
      !user ||
      (user.role !== "ADMIN" && event.organizerId !== session.user.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.event.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Event cancelled" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
