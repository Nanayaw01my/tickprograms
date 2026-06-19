"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { QrCode, CheckCircle, XCircle, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { formatDateTime } from "@/lib/utils";

interface TicketResult {
  valid: boolean;
  error?: string;
  ticket?: {
    ticketCode: string;
    status: string;
    checkedInAt?: string;
    event: { title: string; date: string; venue: string };
    user: { name: string; email: string };
    ticketType: { name: string };
  };
}

export default function QRScanPage() {
  const { data: session } = useSession();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<TicketResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validateTicket = async (ticketCode: string) => {
    if (!ticketCode.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: ticketCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      setResult(data);
      if (data.valid) {
        toast("Ticket validated successfully!", "success");
      } else {
        toast(data.error || "Invalid ticket", "error");
      }
    } catch {
      toast("Validation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ORGANIZER")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Access denied. Admin or Organizer required.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 mb-4">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Ticket Scanner</h1>
            <p className="mt-1 text-gray-500">Enter a ticket code to validate</p>
          </div>

          {/* Manual Entry */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter ticket code (e.g. TKT-XXXX-XXXX-XXXX)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && validateTicket(code)}
                icon={<Search className="h-4 w-4" />}
              />
              <Button variant="gradient" onClick={() => validateTicket(code)} loading={loading}>
                Check
              </Button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-2xl border-2 p-6 ${
              result.valid
                ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.valid ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className={`font-bold text-lg ${result.valid ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
                    {result.valid ? "Valid Ticket!" : "Invalid Ticket"}
                  </h3>
                  {result.error && <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>}
                </div>
              </div>

              {result.ticket && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Event</span>
                    <span className="font-medium text-gray-900 dark:text-white">{result.ticket.event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Attendee</span>
                    <span className="font-medium text-gray-900 dark:text-white">{result.ticket.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ticket Type</span>
                    <span className="font-medium text-gray-900 dark:text-white">{result.ticket.ticketType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={result.ticket.status === "USED" ? "secondary" : "success"}>{result.ticket.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Venue</span>
                    <span className="font-medium text-gray-900 dark:text-white">{result.ticket.event.venue}</span>
                  </div>
                  {result.ticket.checkedInAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Checked in at</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDateTime(result.ticket.checkedInAt)}</span>
                    </div>
                  )}
                  <p className="font-mono text-xs text-gray-400 text-center mt-3">{result.ticket.ticketCode}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
