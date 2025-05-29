const redis = require("redis");

let client = null;

const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      client = redis.createClient({
        url: process.env.REDIS_URL,
      });

      client.on("error", (err) => {
        console.log("Redis Client Error", err);
      });

      await client.connect();
      console.log("Connected to Redis");
    }
  } catch (error) {
    console.log("Redis connection failed:", error.message);
  }
};

const getCache = async (key) => {
  if (!client) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log("Cache get error:", error);
    return null;
  }
};

const setCache = async (key, data, expireTime = 3600) => {
  if (!client) return;
  try {
    await client.setEx(key, expireTime, JSON.stringify(data));
  } catch (error) {
    console.log("Cache set error:", error);
  }
};

const deleteCache = async (key) => {
  if (!client) return;
  try {
    await client.del(key);
  } catch (error) {
    console.log("Cache delete error:", error);
  }
};

connectRedis();

module.exports = {
  getCache,
  setCache,
  deleteCache,
};
