import { redis } from "./redis.client";

export async function getOrSetCache<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
): Promise<T> {
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached) as T;
    }

    const fresh = await fetchFn();
    await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
    return fresh;
}