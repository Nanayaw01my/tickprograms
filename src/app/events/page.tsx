import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/events/EventCard";
import { EventSearch } from "@/components/events/EventSearch";
import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";

interface SearchParams {
  search?: string;
  category?: string;
  page?: string;
  featured?: string;
}

async function getEvents(params: SearchParams) {
  const page = parseInt(params.page || "1");
  const limit = 12;

  const where: Record<string, unknown> = {
    status: "PUBLISHED" as EventStatus,
    date: { gte: new Date() },
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { venue: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.featured === "true") {
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

  return { events, total, page, limit };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { events, total, page, limit } = await getEvents(params);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {params.featured === "true" ? "Featured Events" : "All Events"}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {total} event{total !== 1 ? "s" : ""} found
            </p>
          </div>

          <Suspense>
            <EventSearch />
          </Suspense>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {events.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-2xl text-gray-300 dark:text-gray-600">🎭</p>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No events found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...params, page: String(p) })}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
