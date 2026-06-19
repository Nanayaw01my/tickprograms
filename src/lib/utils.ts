import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "EEEE, MMMM d, yyyy");
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "EEEE, MMMM d, yyyy 'at' h:mm a");
}

export function formatTime(date: Date | string) {
  return format(new Date(date), "h:mm a");
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateReference() {
  return `TH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
