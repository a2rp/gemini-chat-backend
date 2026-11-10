const express = require("express");
const axios = require("axios");

const router = express.Router();
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";
const MAX_CONTEXT_MESSAGES = 20;
const MAX_USER_MESSAGE_LENGTH = 500;
const MAX_MESSAGE_LENGTH = 12_000;
const MAX_CONTEXT_LENGTH = 30_000;

router.post("/", async (req, res) => {
    const { contents } = req.body || {};

    if (!Array.isArray(contents) || contents.length === 0) {
        return res
            .status(400)
            .json({ error: "A non-empty contents array is required." });
    }

    const recentContents = contents.slice(-MAX_CONTEXT_MESSAGES);
    const messages = [];
    let contextLength = 0;

    for (const entry of recentContents) {
        const role = entry?.role;
        const text = entry?.parts?.[0]?.text;

        if (
            (role !== "user" && role !== "model" && role !== "assistant") ||
            typeof text !== "string" ||
            !text.trim()
        ) {
            return res.status(400).json({
                error: "Each message needs a supported role and non-empty text.",
            });
        }

        if (role === "user" && text.length > MAX_USER_MESSAGE_LENGTH) {
            return res.status(400).json({
                error: `User messages must be ${MAX_USER_MESSAGE_LENGTH} characters or fewer.`,
            });
        }

        if (text.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ error: "A message in the recent conversation is too long." });
        }

        contextLength += text.length;
        if (contextLength > MAX_CONTEXT_LENGTH) {
            return res.status(400).json({
                error: "The recent conversation is too long. Clear some chat history and try again.",
            });
        }

        messages.push({
            role: role === "user" ? "user" : "assistant",
            content: text,
        });
    }

    if (messages[messages.length - 1].role !== "user") {
        return res
            .status(400)
            .json({ error: "The latest message must be from the user." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ error: "The chat service is not configured." });
    }

    try {
        const { data } = await axios.post(
            GROQ_URL,
            {
                model: MODEL,
                messages,
                temperature: 0.7,
                max_completion_tokens: 1024,
            },
            {
                timeout: 45_000,
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = data?.choices?.[0]?.message?.content;
        if (typeof reply !== "string" || !reply.trim()) {
            return res.status(502).json({ error: "The chat provider returned an empty response." });
        }

        return res.json({ reply });
    } catch (error) {
        console.error("Groq chat request failed", {
            status: error.response?.status || null,
            code: error.code || null,
        });
        return res.status(502).json({ error: "The chat provider could not complete the request." });
    }
});

module.exports = router;
