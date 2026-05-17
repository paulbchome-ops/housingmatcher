# Housing Matcher (prototype)

This repository contains a small prototype: a Vite + React frontend and an Express backend that return mock housing listings aggregated from example sources (Realtor, Craigslist, Facebook Marketplace).

## What you can run locally

1. Install dependencies for backend and frontend separately.

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:4000`.

## How it works

- The backend exposes `GET /api/search?q=...` which currently calls mock scrapers in `backend/scrapers/mockScraper.js` and returns combined results.
- The frontend calls that endpoint and displays a price comparison table and average price per source.

## Replacing mock scrapers with real integrations

- Scraping sites like Realtor.ca, Craigslist, and Facebook Marketplace requires careful handling: respect site `robots.txt`, terms of service, rate limits, and legal/privacy rules. Prefer official APIs when available.
- A recommended approach for production:
  - Use site APIs when provided.
  - If scraping is necessary, implement server-side scrapers with rotating proxies, request throttling, and identifiable User-Agent headers.
  - Consider using third-party data providers or paid APIs that expose listings.

  - We include a basic, best-effort Craigslist scraper (`backend/scrapers/craigslistScraper.js`) using `axios` + `cheerio`.
  - Facebook Marketplace scraping is implemented as a best-effort Puppeteer script (`backend/scrapers/facebookScraper.js`) — Facebook often requires a logged-in session and actively defends against scraping; results may be limited or require additional engineering (authenticated sessions, proxies).
  - A generic helper (`backend/scrapers/genericScraper.js`) is provided to extract listings from sites when CSS selectors are known.

Puppeteer notes:

- To use the Facebook scraper, install backend dependencies (includes `puppeteer`) and ensure your environment can run headless Chromium. On some systems you may need additional OS packages or use `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer` and point to an existing Chrome/Chromium binary via `PUPPETEER_EXECUTABLE_PATH`.

Legal & operational reminder:

- Always follow site terms and `robots.txt`. Prefer official APIs or data providers for production usage. Use rate limiting, caching, and proxies if you deploy scrapers at scale.
## Files of interest

- Backend: [backend/server.js](backend/server.js)
- Mock scrapers: [backend/scrapers/mockScraper.js](backend/scrapers/mockScraper.js)
- Frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx)
- Frontend app: [frontend/src/App.jsx](frontend/src/App.jsx)

## Next steps (optional)

- Implement real scrapers or integrate official APIs.
- Add authentication, paging, advanced filtering and map views.
- Add caching and rate-limit handling on the backend.

