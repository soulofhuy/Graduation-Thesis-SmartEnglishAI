import { createClient } from "redis";
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not defined");
}

export const redis = createClient({
    url: redisUrl,
});

redis.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

redis.on("connect", () => {
    console.log("Redis connected");
});

(async () => {
    try {
        await redis.connect();
    } catch (error) {
        console.error("Failed to connect Redis:", error);
    }
})();