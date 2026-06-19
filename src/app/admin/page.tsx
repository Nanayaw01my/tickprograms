import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, Ticket, DollarSign, TrendingUp, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, totalEvents, totalTickets, revenueData, recentOrders, events] =
    await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.ticket.count(),
      prisma.order.aggregate({ where: { paymentStatus: "SUCCESS" }, _sum: { amount: true } }),
      prisma.order.findMany({
        where: { paymentStatus: "SUCCESS" },
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { title: true } },
          tickets: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { tickets: true } },
          ticketTypes: true,
        },
      }),
    ]);

  // Revenue by month
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyOrders = await prisma.order.findMany({
    where: { paymentStatus: "SUCCESS", createdAt: { gte: sixMonthsAgo } },
    select: { amount: true, createdAt: true },
  });

  const revenueByMonth: Record<string, number> = {};
  monthlyOrders.forEach((order) => {
    const month = new Date(order.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + order.amount;
  });

  const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage events, tickets, and analytics</p>
            </div>
            <Link href="/admin/events/new">
              <Button variant="gradient">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { label: "Total Revenue", value: formatCurrency(revenueData._sum.amount || 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Total Events", value: totalEvents.toLocaleString(), icon: Calendar, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
              { label: "Tickets Sold", value: totalTickets.toLocaleString(), icon: Ticket, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Revenue (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminRevenueChart data={chartData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{order.user.name}</p>
                        <p className="text-xs text-gray-500">{order.event.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)} • {order.tickets.length} ticket(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(order.amount)}</p>
                        <Badge variant="success">Paid</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Events</CardTitle>
                <Link href="/admin/events"><Button variant="ghost" size="sm">Manage</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map((event) => {
                    const totalSold = event.ticketTypes.reduce((s, t) => s + t.sold, 0);
                    const totalQty = event.ticketTypes.reduce((s, t) => s + t.quantity, 0);
                    return (
                      <div key={event.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[180px]">{event.title}</p>
                          <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{totalSold}/{totalQty}</p>
                          <Badge variant={event.status === "PUBLISHED" ? "success" : "secondary"}>{event.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { href: "/admin/events", label: "Manage Events", icon: Calendar },
              { href: "/admin/tickets", label: "All Tickets", icon: Ticket },
              { href: "/admin/scan", label: "QR Scanner", icon: Users },
              { href: "/admin/users", label: "Users", icon: Users },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer">
                  <link.icon className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
