# SellerPulse

**An AI-powered weekly business briefing for small business owners.**

Built by Heather Zechter | [Live Demo](https://sellerpulse.vercel.app) | Square APM Work Sample, February 2026

---

## The Problem

Small business owners sit on a ton of data they never use. Square processes billions of transactions every year, and sellers can pull up dashboards full of numbers whenever they want. But most of them don't. They're too busy running the register, managing staff, and dealing with vendors. So the data just sits there, and business decisions get made on instinct instead of evidence.

Square AI (launched in beta in 2025) takes a step toward fixing this by letting sellers ask questions about their data in plain English. It's a good product. But it still puts the burden on the seller to open the dashboard and figure out what to ask. For the cafe owner who's been on her feet since 5 AM, that's a big ask.

> "Before Square AI, I was pasting data into ChatGPT and asking it to explain trends." — Square seller, square.com/ai

## The Insight

The most useful piece of business intelligence isn't the answer to a question you asked. It's the question you didn't think to ask. What if the data came to the seller, instead of the other way around?

That's what SellerPulse does. It reads a seller's sales data and writes them a weekly briefing: what's selling, what's not, and what to actually do about it. No dashboard to open, no filters to set, no queries to type. Just a Monday morning briefing that tells you the three things you need to know about your business this week.

## How It Works

| Step | What Happens | Why It Matters |
|------|-------------|----------------|
| **1. Upload** | Seller drops in their sales CSV (works with Square exports) | Zero setup, no integrations. They're already exporting this data. |
| **2. Analyze** | System crunches the numbers: revenue, margins, trends, top sellers | Turns rows of data into the few metrics that actually matter |
| **3. Brief** | AI writes a short briefing with findings and specific next steps | The seller doesn't have to know what questions to ask |
| **4. Act** | Briefing ends with 3 concrete things to do this week | Closes the gap between "what happened" and "now what" |

## Why I Built It This Way

**1. Push, don't pull.** Square AI waits for the seller to come to it. SellerPulse goes the other direction: it reads the data and shows up with answers. I think for the busiest sellers, the best tool is one that does the thinking before they have to.

**2. Tell them what to do, not just what happened.** Most reporting tools stop at "here are your numbers." That's not enough for a seller who doesn't have an MBA. Each briefing ends with 3 specific things to do. Not "consider adjusting your menu" but "your Matcha Latte has a 62% margin and grew 40% this week. Put it on your menu board and bundle it with your top pastry."

**3. Charts + words together.** Some people look at a line going up and instantly get it. Others need someone to tell them "your weekend revenue is 35% higher than weekdays, so that's where you should focus your staffing." SellerPulse gives both, so the insight lands no matter how the seller processes information.

**4. No friction to start.** The first version takes a CSV upload. No account creation, no OAuth, no onboarding flow. A seller can go from curiosity to their first briefing in under a minute. If the product works, then we can add integrations. But first I wanted to see if the core idea holds up.

## How I'd Know If It's Working

If this shipped inside Square, I'd watch three things:

**Do they try it?** Upload completion rate, time from first visit to first briefing (goal: under 90 seconds), drop-off points in the flow.

**Do they come back?** Weekly return rate is the main thing. If sellers open their briefing every Monday, we're doing something right. If they don't, the briefings aren't useful enough.

**Does it help their business?** Correlation between briefing usage and revenue growth over time, seller-reported time saved on data analysis, NPS scores on briefing quality.

The north star: **weekly return rate.** Everything else is secondary. If sellers keep coming back, the product is working.

## Roadmap

**V1 (this):** CSV upload, instant briefing. Tests whether sellers find proactive AI briefings useful at all.

**V2:** Plug directly into Square Dashboard. The briefing shows up every Monday without the seller lifting a finger. Add a push notification ("Your weekly briefing is ready") and let them ask follow-up questions.

**V3:** Pull in outside data. Weather, local events, holidays, new competitors nearby. Instead of just saying "revenue was up Saturday," say "revenue was up Saturday because of the street fair two blocks away, and there's another one next month." Square AI started adding neighborhood data in October 2025, so this fits where the product is heading.

**V4:** Go from "here's what to do" to "want me to do it?" The briefing says to feature a menu item, and one tap updates the online menu. It flags a slow seller, and one tap creates a discount. The briefing stops being a report and starts being an operating system.

## Why This Matters for Square

Square exists to help small businesses succeed. The ones who need the most help are the ones with the least time: the cafe owner who opens at 5 AM, the boutique owner who's also the cashier, the food truck operator who doesn't have anyone on staff to look at spreadsheets. SellerPulse is for them.

Building this project followed the same process I use at my current job. At Rocket EMS, I saw that production managers were drowning in test data they didn't have time to read, so I built an automated reporting system that told them what mattered. At Seoul National University, I saw that robot operators couldn't use the control systems because they required coding, so I built a plain-language interface. The pattern is the same every time: find the person who's stuck, figure out what's blocking them, and build the thing that gets them unstuck.

---

**Heather Zechter** | heatherzechter@gmail.com | (702) 497-5840
