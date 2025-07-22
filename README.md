# Gemini Chatbot – Backend (Node.js + Express)

This is the Node.js + Express backend server for handling secure requests to the Gemini API. It supports multi-turn memory using `contents[]`, protects against abuse, and returns clean replies.

## 🔐 Key Features

-   Rate limiting (20 req/min/IP)
-   Body size control (max 2kb)
-   Input validation and sanitization
-   Helmet for secure headers
-   CORS enabled (frontend only)
-   Axios-based Gemini API calls

## 🧠 Gemini Model

Using: `gemini-1.5-flash` via `v1beta` REST API

## 🧪 How to Run (Backend)

```bash
cd backend
npm install
npm run dev   # or node index.js
```
