# **Headless Lead Engine Architecture (Google-Only MVP)**

---

## **1. Query Generator (Input Layer)**

**Purpose:** Produce unique search queries to scrape new businesses every 6 hours.

**Critical Points:**

* Input:

  * List of **locations / cities** (e.g., Harare, Bulawayo)
  * Query templates per industry type (e.g., “best [industry] in [city]”)
* Output:

  * Unique search URL for Google Maps or Google Search
* Requirements:

  * Ensure queries **rotate every 6 hours** to avoid scraping duplicates
  * Randomize order to mimic human search behavior
  * Maintain a **history table** to prevent repeats in 24h cycles

**Optional Future Enhancements:**

* AI-generated queries using synonyms (e.g., “top-rated restaurants” → “popular eateries”)

---

## **2. Scraper Layer (Data Extraction)**

**Purpose:** Extract raw business information from Google Search / Google Maps.

**Critical Points:**

* Fields to extract for every business:

  * Name
  * Address / Location
  * Category (if available)
  * Website URL
  * Phone number (if available)
  * Business description / reviews (optional)
* Requirements:

  * **Headless browser** (Playwright TypeScript recommended)
  * Handle dynamic content & scrolling
  * Retry failed requests automatically
  * Implement **rate limiting / human-like delays** to avoid Google blocks
* Output: Structured JSON object per business

**Notes:**

* At this stage, no AI interaction yet.
* The scraper is **headless** and runs automatically every 6 hours.

---

## **3. AI Layer (Gemini Model)**

**Purpose:** Identify business type and infer assumed pain points dynamically.

**Critical Points:**

* Input to Gemini:

  * Business name
  * Extracted category (if any)
  * Description / website text / reviews
* Output from Gemini:

  * **Industry classification** (standardized type)
  * **Assumed pain point** (e.g., “Low online visibility”, “Missed bookings”)
* Requirements:

  * Use **Gemini free model** (lightweight and costless)
  * Include **prompt templates** for consistency:

    ```
    Classify this business and suggest a major pain point it likely faces:
    {businessName}, {category}, {description}
    ```
* Validation:

  * AI output must be **structured** (industry + pain text)
  * If AI is uncertain, fallback: categorize as “General Business”

**Optional Future Enhancements:**

* Multi-step classification: industry → pain → best service

---

## **4. Sales Message Generator**

**Purpose:** Create a personalized outreach message automatically.

**Critical Points:**

* Input:

  * Business name
  * Industry type
  * Pain point (from AI)
  * List of your services
* Output:

  * Concise, persuasive sales message
* Requirements:

  * Use AI (Gemini / OpenAI API) for natural language generation
  * Include **business name + pain + proposed service**
  * Optional: make **multiple variations** for A/B testing

**Example Output:**

```
Hi [Business Name], we noticed your [pain point]. Our [service] can help you improve it. Let’s discuss!
```

---

## **5. Database / Storage Layer**

**Purpose:** Persist businesses, leads, queries, and AI outputs.

**Critical Points:**

* Tables / collections:

  1. **Businesses**: name, category, location, website, phone, last scraped
  2. **Leads**: businessId, industry, pain, generated message, sentAt
  3. **Query History**: tracks queries executed per cycle
* Requirements:

  * Type-safe ORM (Prisma) with SQLite for MVP
  * Bind to Docker volume for persistence
  * Ensure **idempotency**: don’t send duplicate leads to Discord

---

## **6. Discord Dispatch Layer**

**Purpose:** Send lead information to your Discord channel automatically.

**Critical Points:**

* Input: lead object (business info + pain + message)
* Output: formatted Discord message
* Requirements:

  * Use **Discord Webhook** or `discord.js`
  * Message format example:

    ```
    Lead Found:
    Name: Awesome Restaurant
    Industry: Restaurant
    Pain: Low online visibility
    Location: Harare
    Phone: +263 777 777 777
    Website: https://www.awesomrestaurant.com
    Suggested Message: Hi Awesome Restaurant, we noticed...
    ```
  * Optional: Attach timestamp and region
* Validation: Ensure **no duplicates** are sent

---

## **7. Scheduler / Orchestrator Layer**

**Purpose:** Keep the system fully automated, running continuously.

**Critical Points:**

* Cycle: Every 6 hours
* Steps per cycle:

  1. Generate new search queries
  2. Scrape businesses (headless)
  3. Pass scraped data to AI → classify industry + pain
  4. Generate sales message per business
  5. Persist to database
  6. Dispatch lead to Discord
* Requirements:

  * Handle failures gracefully (retry on network error / AI timeout)
  * Log all steps for debugging
  * Prevent **duplicate processing**

**Optional Future Enhancements:**

* Dynamic query adjustment based on success rate
* Multi-worker scraping for scale

---

## **8. Logging & Monitoring**

**Purpose:** Visibility into system behavior without UI.

**Critical Points:**

* Log scraping success/failure
* Log AI classification outputs
* Log dispatched leads
* Store logs in console + optional file for persistence
* Alert if scraping fails repeatedly

---

## **9. Dockerization**

**Purpose:** Make the entire system **headless, portable, and 24/7 runnable**.

**Critical Points:**

* Base image: `node:20-alpine`
* Container runs scraper + AI + message generation + Discord dispatch
* Bind mount for database persistence
* Cron inside container or external scheduler triggers run every 6 hours
* Include environment variables: Discord webhook, Gemini API keys

---

## **10. Data Flow Diagram (Textual)**

```
[Query Generator] 
        ↓
[Google Scraper] → [Raw Business JSON]
        ↓
[Gemini AI] → [Industry Type + Pain]
        ↓
[Sales Message Generator] → [Message]
        ↓
[Database / Prisma] → Store business + lead
        ↓
[Discord Dispatcher] → Send lead to channel
        ↓
Cycle repeats every 6 hours
```

---

## ✅ Critical Points to Verify

1. **AI-driven industry detection** replaces hardcoding → scalable
2. **6-hour query rotation** for continuous lead discovery
3. **Headless operation** → Dockerized, no UI needed
4. **Full automation** → Scraper → AI → Message → Discord
5. **Persistence and deduplication** → DB ensures no duplicate leads
6. **Scalable and maintainable stack** → TypeScript, Prisma, Playwright, Discord, Gemini

---

This is **everything you need to confirm before coding**. Once verified, we can start implementing **query generation + scraping first**, then integrate Gemini AI for industry detection and pain classification.
