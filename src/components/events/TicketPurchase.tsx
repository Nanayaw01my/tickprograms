"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Minus, Plus, Tag, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface TicketType {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  id: string;
  title: string;
  ticketTypes: TicketType[];
}

export function TicketPurchase({ event }: { event: Event }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TicketType | null>(
    event.ticketTypes[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const available = selectedType ? selectedType.quantity - selectedType.sold : 0;
  const subtotal = selectedType ? selectedType.price * quantity : 0;
  const total = Math.max(0, subtotal - discount);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch(`/api/promo?code=${promoCode}&eventId=${event.id}`);
      const data = await res.json();
      if (res.ok) {
        const discountAmount = data.isPercent
          ? (subtotal * data.discount) / 100
          : data.discount;
        setDiscount(discountAmount);
        toast("Promo code applied!", "success");
      } else {
        toast(data.error || "Invalid promo code", "error");
      }
    } catch {
      toast("Failed to apply promo code", "error");
    }
  };

  const handlePurchase = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/events/${event.id}`);
      return;
    }

    if (!selectedType) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ticketTypeId: selectedType.id,
          quantity,
          promoCode: promoCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Purchase failed", "error");
        return;
      }

      if (data.free) {
        router.push(`/dashboard/tickets?success=true`);
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch {
      toast("Purchase failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (event.ticketTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No tickets available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-indigo-600" />
          Get Tickets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Ticket Types */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Ticket Type</p>
          {event.ticketTypes.map((type) => {
            const typeAvailable = type.quantity - type.sold;
            const isSoldOut = typeAvailable === 0;
            return (
              <button
                key={type.id}
                onClick={() => !isSoldOut && setSelectedType(type)}
                disabled={isSoldOut}
                className={`w-full rounded-xl border-2 p-3 text-left transition-colors ${
                  selectedType?.id === type.id
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                    : isSoldOut
                    ? "border-gray-200 opacity-50 cursor-not-allowed dark:border-gray-700"
                    : "border-gray-200 hover:border-indigo-300 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{type.name}</p>
                    {type.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{typeAvailable} remaining</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">
                      {type.price === 0 ? "Free" : formatCurrency(type.price)}
                    </p>
                    {isSoldOut && <Badge variant="destructive" className="mt-1">Sold Out</Badge>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quantity */}
        {selectedType && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, available, quantity + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Promo Code */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promo Code</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              icon={<Tag className="h-4 w-4" />}
            />
            <Button variant="outline" size="sm" onClick={applyPromo}>Apply</Button>
          </div>
        </div>

        {/* Price Summary */}
        {selectedType && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal ({quantity} ticket{quantity > 1 ? "s" : ""})</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span>Total</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {total === 0 ? "Free" : formatCurrency(total)}
              </span>
            </div>
          </div>
        )}

        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handlePurchase}
          loading={loading}
          disabled={!selectedType || available === 0}
        >
          {!session ? "Sign In to Purchase" : total === 0 ? "Get Free Ticket" : `Pay ${formatCurrency(total)}`}
        </Button>

        <p className="text-xs text-center text-gray-400">
          Secure payment via Paystack. Tickets delivered instantly.
        </p>
      </CardContent>
    </Card>
  );
}
