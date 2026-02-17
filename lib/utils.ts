import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency = "INR") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  // Use crypto for secure random generation when available
  let random: string;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    random = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("").substring(0, 6).toUpperCase();
  } else {
    random = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  return `RS-${timestamp}-${random}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateRentalDays(startDate: Date | string, endDate: Date | string) {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays;
}

export function calculateRentalPrice(
  dailyPrice: number,
  weeklyPrice: number | null,
  days: number
) {
  if (weeklyPrice && days >= 7) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return (weeks * Number(weeklyPrice)) + (remainingDays * dailyPrice);
  }
  return days * dailyPrice;
}
