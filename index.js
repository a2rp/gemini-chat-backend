require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const chatRoute = require("./routes/chat.js");

const app = express();

// ✅ Helmet for secure HTTP headers
app.use(helmet());

// ✅ CORS – restrict origin (use your domain in prod)
// app.use(cors({ origin: "http://localhost:5173" }));
const allowedOrigins = [
    "http://localhost:5173",
    "https://gemini-smart-chat.netlify.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error("CORS not allowed from this origin"));
            }
        },
    })
);

// ✅ Limit body size
// app.use(express.json({ limit: "2kb" }));
app.use(express.json({ limit: "1mb" }));

// ✅ Rate limit – max 20 reqs per IP per min
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many requests, please try again later.",
});
app.use("/api/chat", limiter);

// ✅ Main chat route
app.use("/api/chat", chatRoute);

// ✅ Start server
const PORT = process.env.PORT || 1190;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
