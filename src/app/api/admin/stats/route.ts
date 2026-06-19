import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalEvents,
      totalTickets,
      revenueData,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.ticket.count({ where: { status: "ACTIVE" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        where: { paymentStatus: "SUCCESS" },
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { title: true } },
          tickets: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "SUCCESS",
        createdAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, createdAt: true },
    });

    const revenueByMonth: Record<string, number> = {};
    monthlyOrders.forEach((order) => {
      const month = order.createdAt.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + order.amount;
    });

    return NextResponse.json({
      totalUsers,
      totalEvents,
      totalTickets,
      totalRevenue: revenueData._sum.amount || 0,
      recentOrders,
      revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month,
        revenue,
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
