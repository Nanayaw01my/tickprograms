import Link from "next/link";
import { ArrowRight, Shield, Zap, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

async function getFeaturedEvents() {
  try {
    return await prisma.event.findMany({
      where: { status: "PUBLISHED", featured: true, date: { gte: new Date() } },
      include: {
        category: true,
        organizer: { select: { id: true, name: true, image: true } },
        ticketTypes: true,
        _count: { select: { tickets: true } },
      },
      orderBy: { date: "asc" },
      take: 6,
    });
  } catch { return []; }
}

async function getUpcomingEvents() {
  try {
    return await prisma.event.findMany({
      where: { status: "PUBLISHED", date: { gte: new Date() } },
      include: {
        category: true,
        organizer: { select: { id: true, name: true, image: true } },
        ticketTypes: true,
        _count: { select: { tickets: true } },
      },
      orderBy: { date: "asc" },
      take: 8,
    });
  } catch { return []; }
}

const CATEGORIES = [
  { name: "Music", icon: "🎵", slug: "music", color: "from-pink-500 to-rose-500" },
  { name: "Sports", icon: "⚽", slug: "sports", color: "from-green-500 to-emerald-500" },
  { name: "Arts", icon: "🎨", slug: "arts", color: "from-purple-500 to-violet-500" },
  { name: "Food", icon: "🍽️", slug: "food", color: "from-orange-500 to-amber-500" },
  { name: "Tech", icon: "💻", slug: "technology", color: "from-blue-500 to-cyan-500" },
  { name: "Comedy", icon: "😂", slug: "comedy", color: "from-yellow-500 to-orange-500" },
  { name: "Business", icon: "💼", slug: "business", color: "from-slate-500 to-gray-500" },
  { name: "Education", icon: "📚", slug: "education", color: "from-teal-500 to-green-500" },
];

export default async function HomePage() {
  const [featuredEvents, upcomingEvents] = await Promise.all([
    getFeaturedEvents(),
    getUpcomingEvents(),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 pb-20 pt-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300 backdrop-blur-sm mb-6">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              Ghana&apos;s #1 Event Ticketing Platform
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Discover Amazing
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Events Near You
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-200">
              Book tickets for concerts, sports, arts, food festivals, and more. Secure payments via Paystack. Instant digital tickets.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/events">
                <Button size="xl" className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl">
                  Browse Events <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="xl" variant="outline" className="border-indigo-400 text-indigo-200 hover:bg-indigo-800">
                  Create Account
                </Button>
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[{ label: "Events", value: "500+" }, { label: "Tickets Sold", value: "10K+" }, { label: "Happy Fans", value: "8K+" }].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-indigo-300">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Browse by Category</h2>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/events?category=${cat.slug}`} className="flex flex-col items-center gap-2 rounded-xl p-3 hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-xl shadow-sm`}>{cat.icon}</div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-indigo-600">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Events</h2>
                <Link href="/events?featured=true"><Button variant="outline">View All <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredEvents.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
              <Link href="/events"><Button variant="outline">See All <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
            {upcomingEvents.length === 0 && (
              <div className="py-20 text-center text-gray-400">No upcoming events yet. Check back soon!</div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose TicketHub?</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { icon: Shield, title: "Secure Payments", desc: "All payments processed securely via Paystack.", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
                { icon: Zap, title: "Instant Digital Tickets", desc: "Receive your QR-code ticket immediately after payment.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                { icon: Users, title: "Easy Check-in", desc: "Fast QR-code scanning prevents fraud and duplicate entries.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
              ].map((feat) => (
                <div key={feat.title} className="flex flex-col items-center text-center rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feat.bg} mb-4`}><feat.icon className={`h-8 w-8 ${feat.color}`} /></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feat.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to experience TicketHub?</h2>
            <p className="mt-3 text-lg text-indigo-100">Join thousands of event-goers across Ghana</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register"><Button size="xl" className="bg-white text-indigo-900 hover:bg-indigo-50">Sign Up Free <ArrowRight className="h-5 w-5" /></Button></Link>
              <Link href="/events"><Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">Explore Events</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
