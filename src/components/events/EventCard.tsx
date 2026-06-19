"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Ticket, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: Date | string;
    venue: string;
    image?: string | null;
    featured?: boolean;
    category?: { name: string; color?: string | null } | null;
    ticketTypes: { price: number; quantity: number; sold: number }[];
    _count?: { tickets: number };
  };
}

export function EventCard({ event }: EventCardProps) {
  const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
  const totalAvailable = event.ticketTypes.reduce(
    (sum, t) => sum + (t.quantity - t.sold),
    0
  );
  const isSoldOut = totalAvailable === 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-900">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Ticket className="h-16 w-16 text-indigo-300 dark:text-indigo-600" />
          </div>
        )}

        {event.featured && (
          <div className="absolute left-3 top-3">
            <Badge className="flex items-center gap-1 bg-amber-400 text-amber-900 border-0">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </Badge>
          </div>
        )}

        {event.category && (
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="border-0 bg-white/90 text-gray-700 dark:bg-gray-900/90 dark:text-gray-300">
              {event.category.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {event.title}
        </h3>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">From</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {minPrice === 0 ? "Free" : formatCurrency(minPrice)}
            </p>
          </div>

          {isSoldOut ? (
            <Badge variant="destructive">Sold Out</Badge>
          ) : (
            <p className="text-xs text-gray-400">{totalAvailable} left</p>
          )}
        </div>

        <Link href={`/events/${event.id}`} className="mt-4">
          <Button
            variant={isSoldOut ? "outline" : "gradient"}
            className="w-full"
            disabled={isSoldOut}
          >
            {isSoldOut ? "Sold Out" : "Get Tickets"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
