"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    fetch(`/api/payments/verify?reference=${reference}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStatus("success");
          setTimeout(() => router.push("/dashboard/tickets"), 3000);
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-16 w-16 text-indigo-600 animate-spin" />
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Verifying Payment...</h2>
            <p className="mt-2 text-gray-500">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h2>
            <p className="mt-2 text-gray-500">Your tickets have been generated. Redirecting...</p>
            <Link href="/dashboard/tickets" className="mt-6 inline-block">
              <Button variant="gradient">View My Tickets</Button>
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Payment Failed</h2>
            <p className="mt-2 text-gray-500">Something went wrong. Please try again.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/events"><Button variant="outline">Browse Events</Button></Link>
              <Link href="/dashboard"><Button variant="gradient">Dashboard</Button></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
