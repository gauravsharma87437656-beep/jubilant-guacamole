// Recently viewed products utility - per-user using localStorage

export interface RecentlyViewedItem {
    id: string;
    name: string;
    slug?: string;
    image: string;
    dailyPrice: number;
    viewedAt: number;
}

const KEY_PREFIX = "recently_viewed";
const MAX_ITEMS = 15;

function getStorageKey(userId?: string | null): string {
    if (userId) return `${KEY_PREFIX}_${userId}`;
    return `${KEY_PREFIX}_guest`;
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">, userId?: string | null) {
    try {
        const key = getStorageKey(userId);
        const existing = getRecentlyViewed(userId);
        // Remove if already exists
        const filtered = existing.filter((p) => p.id !== item.id);
        // Add to front
        filtered.unshift({ ...item, viewedAt: Date.now() });
        // Limit to MAX_ITEMS
        const trimmed = filtered.slice(0, MAX_ITEMS);
        localStorage.setItem(key, JSON.stringify(trimmed));
    } catch {
        // localStorage might be unavailable
    }
}

export function getRecentlyViewed(userId?: string | null): RecentlyViewedItem[] {
    try {
        const key = getStorageKey(userId);
        const data = localStorage.getItem(key);
        if (!data) return [];
        return JSON.parse(data) as RecentlyViewedItem[];
    } catch {
        return [];
    }
}
