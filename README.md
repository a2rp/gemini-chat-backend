# Gemini Chat Backend

Express API for the Gemini Smart Chat frontend. It accepts the app's Gemini-style conversation history, converts it to Groq Chat Completions messages, and returns the assistant reply without exposing the provider key to the browser.

## Stack

- Node.js 18 or later
- Express 5
- Groq Chat Completions API (`openai/gpt-oss-20b`)
- Axios, Helmet, CORS, and express-rate-limit

## Run locally

```bash
npm install
cp .env.example .env
npm run start:dev
```

Set `GROQ_API_KEY` in `.env` before starting the server. The API listens on port `1198` by default, matching the frontend's local API URL. `PORT` can override it.

`CLIENT_ORIGINS` is a comma-separated list of allowed browser origins. The defaults allow `http://localhost:5173`, the GitHub Pages site, and the Netlify frontend.

## API

`POST /api/chat` accepts the recent conversation in the frontend's existing format:

```json
{
  "contents": [
    { "role": "user", "parts": [{ "text": "What is machine learning?" }] }
  ]
}
```

Successful responses have this shape:

```json
{ "reply": "..." }
```

The API validates message roles and sizes, sends at most the 20 most recent messages to Groq, limits each user message to 500 characters, and rate-limits each IP to 10 requests per minute.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `GROQ_API_KEY` | Secret key for Groq Chat Completions | Required |
| `PORT` | Local/server port | `1198` |
| `CLIENT_ORIGINS` | Comma-separated CORS allowlist | localhost, GitHub Pages, and Netlify frontend |

Never commit `.env` or expose `GROQ_API_KEY` in frontend code.

## Links

- Frontend: [Gemini Smart Chat](https://gemini-smart-chat.netlify.app/)
- Portfolio: [ashishranjan.net](https://www.ashishranjan.net/)
- GitHub: [a2rp](https://github.com/a2rp)
