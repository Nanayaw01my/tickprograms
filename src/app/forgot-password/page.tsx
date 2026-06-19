"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        toast("Failed to send reset email", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Ticket<span className="text-indigo-600">Hub</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Check your email</h3>
              <p className="mt-2 text-sm text-gray-500">If that email is registered, we sent a password reset link.</p>
              <Link href="/login" className="mt-4 inline-block">
                <Button variant="outline">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                required
              />
              <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>
                Send Reset Link
              </Button>
              <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="text-indigo-600 hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
