import { NextRequest } from "next/server";

// Simple in-memory storage for rate limiting
// Note: This will reset if the server process restarts
const rates = new Map<string, { count: number; lastReset: number }>();

/**
 * Basic rate limiter for API routes
 * @param ip IP address of the requester
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(ip: string, limit: number, windowMs: number) {
    const now = Date.now();
    const userData = rates.get(ip) || { count: 0, lastReset: now };

    // If window has passed, reset the count
    if (now - userData.lastReset > windowMs) {
        userData.count = 1;
        userData.lastReset = now;
    } else {
        userData.count++;
    }

    rates.set(ip, userData);

    return {
        isLimited: userData.count > limit,
        current: userData.count,
        limit,
        remaining: Math.max(0, limit - userData.count),
        reset: userData.lastReset + windowMs
    };
}

/**
 * Helper to get IP address from request headers
 */
export function getIP(req: Request | NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
    return ip;
}
