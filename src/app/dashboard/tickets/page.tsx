import { redirect } from "next/navigation";
import Image from "next/image";
import { Download, QrCode, Ticket, Calendar, MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { TicketDownload } from "@/components/tickets/TicketDownload";

export default async function MyTicketsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    include: {
      event: { select: { id: true, title: true, date: true, venue: true, image: true, address: true, city: true } },
      ticketType: { select: { name: true, price: true } },
      order: { select: { id: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusVariant = (status: string) => {
    if (status === "ACTIVE") return "success";
    if (status === "USED") return "secondary";
    if (status === "CANCELLED") return "destructive";
    return "secondary";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Tickets</h1>

          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-16 text-center">
              <Ticket className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No tickets yet</h3>
              <p className="mt-2 text-gray-500">Browse events and get your first ticket!</p>
              <a href="/events" className="mt-4 inline-block">
                <Button variant="gradient">Browse Events</Button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Left - Event Info */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{ticket.event.title}</h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 text-indigo-500" />
                              {formatDateTime(ticket.event.date)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4 text-rose-500" />
                              {ticket.event.venue}
                              {ticket.event.city && `, ${ticket.event.city}`}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">
                              {ticket.ticketType.name} — {ticket.ticketType.price === 0 ? "Free" : formatCurrency(ticket.ticketType.price)}
                            </span>
                            <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                          </div>
                          <p className="mt-2 font-mono text-xs text-gray-400">{ticket.ticketCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:flex flex-col justify-center py-4">
                      <div className="w-px h-full border-l-2 border-dashed border-gray-200 dark:border-gray-700" />
                    </div>

                    {/* Right - QR Code */}
                    <div className="flex flex-col items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l border-dashed border-gray-200 dark:border-gray-700 p-6 sm:w-48">
                      {ticket.qrCode ? (
                        <Image
                          src={ticket.qrCode}
                          alt="QR Code"
                          width={120}
                          height={120}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <QrCode className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <TicketDownload ticket={ticket} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
