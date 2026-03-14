const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const db = require("../database/init");
const logger = require("./utils/logger");
const limiter = require("./middleware/rateLimit");

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(limiter);

// ============ ROUTES ============

// Health check
app.get("/health", (req, res) => {
    res.json({ 
        status: "✅ Server running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

// Trip endpoints
const tripController = require("./controllers/tripController");
const { validateTrip } = require("./middleware/validation");

app.get("/api/trips", tripController.getAll);
app.get("/api/trips/:id", tripController.getById);
app.post("/api/trips", validateTrip, tripController.create);
app.put("/api/trips/:id", validateTrip, tripController.update);
app.delete("/api/trips/:id", tripController.delete);
app.get("/api/search", tripController.search);
app.get("/api/stats", tripController.stats);
app.get("/api/stats/daily", tripController.dailyStats);
app.get("/api/export/csv", tripController.exportCSV);

// ============ 404 HANDLER ============
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found" });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
    logger.error("Unhandled error", err);
    res.status(500).json({ 
        success: false, 
        error: process.env.NODE_ENV === "production" 
            ? "Internal server error" 
            : err.message
    });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📍 Health: http://localhost:${PORT}/health`);
    logger.info(`🔗 API: http://localhost:${PORT}/api`);
});

module.exports = app;