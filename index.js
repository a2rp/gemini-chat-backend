require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const chatRoute = require("./routes/chat.js");

const app = express();
const defaultOrigins = [
    "http://localhost:5173",
    "https://gemini-smart-chat.netlify.app",
];
const allowedOrigins = new Set(
    (process.env.CLIENT_ORIGINS || defaultOrigins.join(","))
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
);

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            callback(null, !origin || allowedOrigins.has(origin));
        },
    })
);
app.use(express.json({ limit: "1mb" }));

const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again in a minute." },
});

app.use("/api/chat", chatLimiter, chatRoute);

const port = Number(process.env.PORT) || 1198;
app.listen(port, () => console.log(`Chat API listening on port ${port}`));
