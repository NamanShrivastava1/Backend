const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,                // required for Upstash
        rejectUnauthorized: false // allow self-signed certs
    }
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));
redisClient.on("connect", () => console.log("✅ Redis connected"));

(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;
