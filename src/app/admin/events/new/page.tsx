"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";

interface TicketTypeForm {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export default function NewEventPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    venue: "",
    address: "",
    city: "",
    country: "Ghana",
    image: "",
    categoryId: "",
    capacity: "",
    featured: false,
    status: "PUBLISHED",
  });

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: "General Admission", description: "", price: 0, quantity: 100 },
  ]);

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", description: "", price: 0, quantity: 50 }]);
  };

  const removeTicketType = (i: number) => {
    if (ticketTypes.length === 1) return;
    setTicketTypes(ticketTypes.filter((_, idx) => idx !== i));
  };

  const updateTicketType = (i: number, key: keyof TicketTypeForm, value: string | number) => {
    const updated = [...ticketTypes];
    (updated[i] as unknown as Record<string, string | number>)[key] = value;
    setTicketTypes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? parseInt(form.capacity) : undefined,
          ticketTypes: ticketTypes.map((t) => ({
            ...t,
            price: Number(t.price),
            quantity: Number(t.quantity),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to create event", "error");
        return;
      }

      toast("Event created successfully!", "success");
      router.push(`/events/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ORGANIZER")) {
    return <div className="min-h-screen flex items-center justify-center"><p>Access denied</p></div>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Event</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Event Details</h2>
              <Input label="Event Title *" placeholder="e.g. Accra Music Festival 2025" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  placeholder="Describe your event..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date & Time *" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                <Input label="End Date & Time" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <Input label="Event Image URL" placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Location</h2>
              <Input label="Venue *" placeholder="e.g. Accra Sports Stadium" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required />
              <Input label="Address" placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="Accra" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input label="Country" placeholder="Ghana" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Capacity (optional)" type="number" placeholder="500" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Feature this event on homepage</span>
              </label>
            </div>

            {/* Ticket Types */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">Ticket Types</h2>
                <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                  <Plus className="h-4 w-4" /> Add Type
                </Button>
              </div>
              {ticketTypes.map((tt, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Ticket Type {i + 1}</span>
                    {ticketTypes.length > 1 && (
                      <button type="button" onClick={() => removeTicketType(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Name *" placeholder="General Admission" value={tt.name} onChange={(e) => updateTicketType(i, "name", e.target.value)} required />
                    <Input label="Price (GHS)" type="number" placeholder="0" min="0" value={tt.price} onChange={(e) => updateTicketType(i, "price", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Quantity *" type="number" placeholder="100" min="1" value={tt.quantity} onChange={(e) => updateTicketType(i, "quantity", e.target.value)} required />
                    <Input label="Description" placeholder="What's included?" value={tt.description} onChange={(e) => updateTicketType(i, "description", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>
              Create Event
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
