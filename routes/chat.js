// const express = require("express");
// const dotenv = require("dotenv");
// const axios = require("axios");

// dotenv.config();
// const router = express.Router();

// // const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
// const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// router.post("/", async (req, res) => {
//     const { contents } = req.body;

//     // ✅ Input shape check
//     if (!contents || !Array.isArray(contents)) {
//         return res.status(400).json({ error: "Contents array is required" });
//     }

//     // ✅ Optional text length limit (security)
//     const lastText = contents[contents.length - 1]?.parts?.[0]?.text || "";
//     if (lastText.length > 500) {
//         return res
//             .status(400)
//             .json({ error: "Message too long (max 500 chars)" });
//     }

//     try {
//         const { data } = await axios.post(
//             GEMINI_URL,
//             { contents },
//             {
//                 headers: { "Content-Type": "application/json" },
//             }
//         );

//         const reply =
//             data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
//         res.json({ reply });
//     } catch (err) {
//         console.error("Gemini API Error:", err?.response?.data || err.message);
//         res.status(500).json({ error: "Gemini API call failed" });
//     }
// });

// module.exports = router;

const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const router = express.Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

router.post("/", async (req, res) => {
    const { contents } = req.body;

    // ✅ Validate input
    if (!contents || !Array.isArray(contents)) {
        return res.status(400).json({ error: "Contents array is required" });
    }

    // ✅ Optional: Check message length
    const lastText = contents[contents.length - 1]?.parts?.[0]?.text || "";
    if (lastText.length > 500) {
        return res
            .status(400)
            .json({ error: "Message too long (max 500 chars)" });
    }

    // ✅ Convert Gemini-style contents to OpenAI-style messages
    // const messages = contents.map((entry) => ({
    //     role: entry.role,
    //     content: entry.parts?.[0]?.text || "",
    // }));
    const messages = contents.map((entry) => {
        const role =
            entry.role === "user"
                ? "user"
                : entry.role === "model" || entry.role === "assistant"
                ? "assistant"
                : "user"; // fallback
        return {
            role,
            content: entry.parts?.[0]?.text || "",
        };
    });

    try {
        const { data } = await axios.post(
            GROQ_URL,
            {
                // model: "mixtral-8x7b-32768",
                model: "llama3-70b-8192",
                messages,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = data?.choices?.[0]?.message?.content || "No response.";
        res.json({ reply });
    } catch (err) {
        console.error("Groq API Error:", err?.response?.data || err.message);
        res.status(500).json({ error: "Groq API call failed" });
    }
});

module.exports = router;
