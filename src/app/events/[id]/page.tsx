import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock, Users, Tag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { TicketPurchase } from "@/components/events/TicketPurchase";

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
      organizer: { select: { id: true, name: true, email: true, image: true } },
      ticketTypes: true,
      _count: { select: { tickets: true, orders: true } },
    },
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  const totalAvailable = event.ticketTypes.reduce(
    (sum, t) => sum + (t.quantity - t.sold),
    0
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {/* Hero Image */}
        <div className="relative h-64 bg-gradient-to-br from-indigo-900 to-purple-900 sm:h-80 lg:h-96">
          {event.image ? (
            <Image src={event.image} alt={event.title} fill className="object-cover opacity-60" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="mx-auto max-w-7xl">
              {event.category && (
                <Badge className="mb-3 bg-indigo-600 text-white border-0">{event.category.name}</Badge>
              )}
              <h1 className="text-2xl font-extrabold text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
                {event.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDateTime(event.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                    <MapPin className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Venue</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.venue}</p>
                    {event.city && <p className="text-xs text-gray-400">{event.city}, {event.country}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Availability</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {totalAvailable > 0 ? `${totalAvailable} tickets left` : "Sold Out"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this Event</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>

              {/* Organizer */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Organizer</h2>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                    {event.organizer.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.organizer.name}</p>
                    <p className="text-sm text-gray-500">{event.organizer.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Purchase Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <TicketPurchase event={event} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
