import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { EventStatus } from "@prisma/client";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string(),
  endDate: z.string().optional(),
  venue: z.string().min(3),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string().optional(),
  capacity: z.number().optional(),
  featured: z.boolean().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  ticketTypes: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number().min(0),
        quantity: z.number().min(1),
      })
    )
    .min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "PUBLISHED";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {
      status: status as EventStatus,
      date: { gte: new Date() },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (featured === "true") {
      where.featured = true;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          category: true,
          organizer: { select: { id: true, name: true, image: true } },
          ticketTypes: true,
          _count: { select: { tickets: true } },
        },
        orderBy: { date: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({ events, total, page, limit });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const { ticketTypes, ...eventData } = data;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        organizerId: session.user.id!,
        ticketTypes: {
          create: ticketTypes,
        },
      },
      include: {
        ticketTypes: true,
        category: true,
        organizer: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
