
# **Headless Lead Engine – Tech Stack**

---

## **1. Runtime & Language**

* **Node.js (v20+) + TypeScript**

  * **Reason:** Async-first runtime, perfect for I/O-heavy scraping.
  * TypeScript adds **type safety**, preventing runtime bugs.
  * Unified stack → one language for scraping, AI calls, DB, and dispatch.

---

## **2. Query Generator Layer**

* **Libraries / Tech:**

  * `fs` / JSON / YAML → store query templates
  * Optional: Gemini AI → generate query variations dynamically
* **Reason:**

  * Lightweight, flexible, allows rotating queries automatically.
  * Can scale to generate thousands of unique queries for 24/7 scraping.

---

## **3. Scraper Layer**

* **Playwright (TypeScript)**

  * Browser automation for Google Maps / Google Search
  * Handles dynamic content and JS-heavy pages
  * Headless mode → Docker-friendly
* **Cheerio**

  * Lightweight HTML parser for extracting structured content when full browser not needed
* **Reason:**

  * Playwright ensures **robust scraping** even with Google’s dynamic page layouts
  * Cheerio speeds up parsing when full browser rendering is overkill

---

## **4. AI Layer**

* **Gemini (free models)**

  * Classifies business type automatically
  * Generates assumed pain points
* **Reason:**

  * Avoids hardcoding 50+ industries
  * Free model keeps costs near-zero for MVP
  * Provides structured AI output for consistent downstream use

---

## **5. Sales Message Generation**

* **Gemini / OpenAI Node SDK**

  * Generates natural language messages from business + pain + service
* **Reason:**

  * Automatically creates persuasive outreach messages
  * Reduces manual copywriting work
  * Can evolve into multi-variant A/B testing for better conversion

---

## **6. Database Layer**

* **Prisma ORM + SQLite (MVP)**

  * Stores business info, leads, query history
  * Type-safe database access
* **Reason:**

  * SQLite is lightweight and zero-config for MVP
  * Prisma ensures **type-safe, maintainable queries**
  * Upgrade path to PostgreSQL for scale

---

## **7. Dispatcher Layer**

* **discord.js / Discord Webhook**

  * Sends leads automatically to Discord channels
* **Reason:**

  * Free, real-time notifications
  * Fully headless → no UI needed

---

## **8. Scheduler / Orchestration**

* **node-cron**

  * Executes scraper → AI → message → Discord pipeline every 6 hours
* **Reason:**

  * Simple, lightweight scheduling
  * Ensures fully automated 24/7 operation

---

## **9. Logging & Monitoring**

* **Pino** (fast, structured logging)
* Optional: Winston for more advanced logging / file persistence
* **Reason:**

  * Tracks scraping success/failures
  * Monitors AI outputs and Discord dispatch
  * Helps debug headless pipelines

---

## **10. Configuration**

* **YAML / JSON**

  * Store region lists, query templates, service lists
* **Zod** (TypeScript validation library)

  * Validates config integrity at runtime
* **Reason:**

  * Human-readable, easy to maintain
  * Ensures configs don’t break system

---

## **11. Docker / Containerization**

* **Docker + Docker Compose**

  * Containerize full headless pipeline: scraper + AI + DB + dispatcher
  * Alpine base image → lightweight and secure
* **Reason:**

  * Fully headless, portable, reproducible
  * Run on any server / cloud environment
  * Persistent volumes keep DB safe across container restarts

---

## **12. Optional / Future-Proofing**

* **BullMQ + Redis** → For parallel scraping / retries at scale
* **Grafana / Prometheus** → For monitoring scraping/AI pipelines
* **Rotating Proxies / Stealth options (Playwright)** → Avoid Google blocks at scale

---

### ✅ **Why this Stack is Optimal**

* **Costless / MVP-ready**: Uses free tools (Gemini, SQLite, Discord)
* **Robust**: Playwright handles Google’s dynamic content, retry logic ensures scraping reliability
* **Scalable**: TypeScript + Prisma + Docker → ready to expand to multiple workers or servers
* **Fully Headless**: 24/7 automated operation, no UI, only Discord output
* **Maintainable**: Single language, structured configs, type-safe DB access

---

If you want, I can now **map this tech stack to the architecture diagram**, showing **exactly which library/tool lives in each layer**, so you’ll have a **full verified blueprint** before writing a single line of code.
