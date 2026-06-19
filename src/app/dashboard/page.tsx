import { redirect } from "next/navigation";
import Link from "next/link";
import { Ticket, CreditCard, Calendar, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [tickets, orders] = await Promise.all([
    prisma.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        event: { select: { id: true, title: true, date: true, venue: true, image: true } },
        ticketType: { select: { name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { userId: session.user.id, paymentStatus: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const upcomingTickets = tickets.filter(
    (t) => new Date(t.event.date) > new Date() && t.status === "ACTIVE"
  );

  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {session.user.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your tickets and events</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { label: "Total Tickets", value: tickets.length, icon: Ticket, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
              { label: "Upcoming Events", value: upcomingTickets.length, icon: Calendar, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "Orders", value: orders.length, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
              { label: "Total Spent", value: formatCurrency(totalSpent), icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upcoming Tickets */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Tickets</CardTitle>
                <Link href="/dashboard/tickets"><Button variant="ghost" size="sm">View All</Button></Link>
              </CardHeader>
              <CardContent>
                {upcomingTickets.length === 0 ? (
                  <div className="py-8 text-center">
                    <Ticket className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="mt-3 text-sm text-gray-500">No upcoming events</p>
                    <Link href="/events"><Button size="sm" className="mt-3" variant="outline">Browse Events</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                          <Ticket className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{ticket.event.title}</p>
                          <p className="text-xs text-gray-500">{formatDate(ticket.event.date)}</p>
                          <p className="text-xs text-gray-400 truncate">{ticket.event.venue}</p>
                        </div>
                        <Badge variant="success">{ticket.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link href="/dashboard/orders"><Button variant="ghost" size="sm">View All</Button></Link>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="py-8 text-center">
                    <CreditCard className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="mt-3 text-sm text-gray-500">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{order.paymentReference}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(order.amount)}</p>
                          <Badge variant="success">Paid</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
