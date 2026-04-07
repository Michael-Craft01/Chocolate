# 🚀 Project Chocolate: Headless Lead Generation Engine

**Chocolate** is a high-performance, fully automated "set-and-forget" lead generation pipeline. It bridges the gap between raw web data and actionable sales outreach by combining stealth scraping, AI-driven business classification, and real-time Discord dispatching.

Named for its "smooth" execution and "rich" data output, Chocolate is built to run 24/7 in a headless Docker environment, ensuring a constant stream of high-ticket leads with zero manual intervention.

---

## 🏗️ Architecture & Logic
The system operates in a linear, 5-stage pipeline orchestrated by `node-cron`:

1.  **Query Generation:** Dynamically generates search terms for Google Maps/Search based on target industries and regions.
2.  **Stealth Extraction:** Uses **Playwright** to navigate dynamic JS-heavy pages and **Cheerio** for lightning-fast HTML parsing.
3.  **AI Enrichment:** Processes raw data through **Gemini (or Gemma 3)** to classify the business, identify pain points, and verify lead quality.
4.  **Hyper-Personalization:** Generates custom sales copy tailored to the specific business's niche.
5.  **Headless Dispatch:** Pushes the finalized lead "package" to a dedicated **Discord** channel via Webhooks.

---

## 🛠️ The Tech Stack

| Layer | Technology | Key Benefit |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v20+) | High-concurrency I/O for scraping. |
| **Language** | TypeScript | Type-safety for complex AI data structures. |
| **Scraper** | Playwright + Cheerio | Bypasses bot detection; handles dynamic content. |
| **AI Layer** | Gemini API / Gemma 3 | Automated classification & copy generation. |
| **Database** | Prisma + SQLite | Zero-config, type-safe, and portable. |
| **Orchestration** | Docker + Node-Cron | Fully headless, 24/7 automated operation. |
| **Validation** | Zod | Ensures data integrity from messy web sources. |

---

## 📁 Project Structure

```text
chocolate/
├── src/
│   ├── scraper/         # Playwright & Cheerio logic
│   ├── ai/              # Gemini/OpenAI/Ollama integration
│   ├── database/        # Prisma schema & client
│   ├── dispatch/        # Discord Webhook integration
│   ├── config/          # Zod schemas & YAML loaders
│   └── index.ts         # Main orchestration entry point
├── prisma/              # Database migrations
├── data/                # SQLite persistent storage
├── Dockerfile           # Container recipe
├── docker-compose.yml   # Multi-container orchestration
└── README.md            # You are here
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Docker & Docker Compose
* Node.js v20 (for local development)
* A Gemini API Key (or local Ollama instance for Gemma 3)

### 2. Configuration
Create a `.env` file in the root:
```bash
GEMINI_API_KEY=your_key_here
DISCORD_WEBHOOK_URL=your_webhook_url
DATABASE_URL="file:./data/chocolate.db"
SCRAPE_INTERVAL="0 */6 * * *" # Every 6 hours
```

### 3. Deployment (The Docker Way)
Build and run the headless engine:
```bash
docker-compose up -d --build
```
*The engine is now running in "Detached" mode. Use `docker logs -f chocolate-engine` to watch the leads roll in.*

---

## 🛡️ Robustness Features
* **Automatic Retries:** Built-in backoff logic for 429 (Rate Limit) errors.
* **State Persistence:** SQLite ensures that if the container restarts, the engine knows which businesses it has already scraped.
* **Schema Safety:** Every lead is validated by **Zod** before reaching the database, preventing "undefined" crashes from bad HTML.

---

## 📈 Future Roadmap
- [ ] **Parallel Processing:** Integration with BullMQ + Redis for massive scale.
- [ ] **Stealth Mode:** Rotating proxy support to avoid Google IP bans.
- [ ] **A/B Testing:** AI-driven tracking of which message variants convert best.

---

### 👨‍💻 Built by
**Michael-Ragu/LogicHQ** — *AI Engineer & Full-Stack Builder*

---
