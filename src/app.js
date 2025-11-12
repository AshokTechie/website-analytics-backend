import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createClient } from "redis";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Rate limiter - gentle default
const limiter = rateLimit({ windowMs: 60 * 1000, max: 300, message: { error: "Too many requests" } });
app.use(limiter);

// Optional Redis client for caching
// if (process.env.REDIS_URL) {
// 	const redisClient = createClient({ url: process.env.REDIS_URL });
// 	redisClient.on("error", (e) => console.warn("Redis error", e));
// 	redisClient.connect().then(() => console.log("Connected to Redis")).catch(() => console.warn("Redis connection failed"));
// 	app.set("redis", redisClient);
// }

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);

// Swagger docs (if provided)
try {
	const docs = YAML.load("./docs/swagger.yaml");
	app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(docs));
} catch (e) {
	console.warn("Swagger docs not available. Create docs/swagger.yaml to enable API docs.");
}

// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// error handler
app.use((err, req, res, next) => {
	console.error(err.stack || err);
	res.status(err.status || 500).json({ error: "Internal Server Error" });
});

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const shutdown = async () => {
	console.log("Shutting down...");
	server.close();
	const redisClient = app.get("redis");
	if (redisClient) await redisClient.disconnect().catch(() => {});
	process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
