# 💰 Money Health Score
### AI-Powered Personal Finance Mentor for India · ET StartupCentral Hackathon 2025

<p align="center">
  <img src="https://img.shields.io/badge/Built%20for-ET%20StartupCentral%20Hackathon-e8a030?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Powered%20by-Claude%20AI-00c9a7?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Recharts-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Deploy-Netlify-00AD9F?style=for-the-badge&logo=netlify" />
</p>

---

> **95% of Indians don't have a financial plan.** Financial advisors charge ₹25,000+/year and serve only HNIs. Money Health Score makes expert-level financial assessment free, instant, and deeply personalised — living right inside your browser.

---

## ✨ What It Does

**Money Health Score** is a 5-minute AI-powered financial wellness assessment that scores users across **6 critical dimensions** of financial health — the same dimensions a ₹25,000/year advisor would evaluate — and delivers a personalised action plan powered by Claude AI.

### The 6 Dimensions

| Dimension | What It Measures |
|-----------|-----------------|
| 🛡️ **Emergency Preparedness** | Liquid buffer vs 6-month expense target |
| ⚕️ **Insurance Coverage** | Health & life cover adequacy vs income |
| 📊 **Investment Diversification** | Asset class spread and total corpus ratio |
| 💳 **Debt Health** | EMI-to-income burden and loan load |
| 🧾 **Tax Efficiency** | 80C utilisation, NPS, regime optimisation |
| 🏖️ **Retirement Readiness** | Current corpus vs FIRE target (25× annual income rule) |

---

## 🎯 User Flow

```
Welcome Screen → 5-Step Onboarding → AI Scoring Engine → Results Dashboard
```

1. **Step 1 — Profile** · Age, income, city tier, dependents  
2. **Step 2 — Expenses** · Monthly spend, rent, EMIs  
3. **Step 3 — Safety Net** · Emergency fund, health + life insurance cover  
4. **Step 4 — Investments** · Mutual funds, stocks, FD/PPF, PF/NPS  
5. **Step 5 — Debt & Tax** · Total loans, 80C status, tax regime, retirement age  

---

## 🖥️ Results Dashboard

- **Animated score ring** (0–100) with grade: Financial Distress → Financial Novice → Challenger → Warrior → Champion → **Financial Elite**
- **6 dimension bars** with colour-coded health indicators
- **Radar chart** (Recharts) for visual portfolio shape
- **AI-generated insight** — personalised 2-sentence financial observation with a concrete number
- **SIP recommendation** — specific fund and amount to start this week
- **3 Priority Action Cards** — URGENT / HIGH / MEDIUM with ₹ impact estimates, Indian product recommendations (ELSS, NPS, term plan, Nifty 50 index)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 (single-file JSX) |
| Charts | Recharts (RadarChart) |
| AI / LLM | Anthropic Claude claude-sonnet-4-20250514 |
| Fonts | Playfair Display + DM Sans + DM Mono (Google Fonts) |
| Deployment | Netlify (free tier) |
| Auth | None required — zero friction |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- An Anthropic API key ([get one free](https://console.anthropic.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/money-health-score.git
cd money-health-score

# Install dependencies
npm install

# Add your Anthropic API key
echo "VITE_ANTHROPIC_KEY=your_key_here" > .env
```

### Run Locally

```bash
npm run dev
# App available at http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in /dist — deploy to Netlify by drag-dropping this folder
```

---

## 📁 Project Structure

```
money-health-score/
├── src/
│   ├── MoneyHealthScore.jsx   # Main app (scoring engine + UI)
│   └── main.jsx               # React entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🧮 Scoring Algorithm

Each dimension is scored 0–100 using Indian personal finance benchmarks:

```
Emergency Score     = min(100, (months_saved / 6) × 100)
Insurance Score     = health_cover_score(50) + life_cover_score(50)
Diversification     = (asset_class_count/4 × 60) + (invest_ratio × 40)
Debt Score          = 100 − (EMI_ratio × 150) − debt_load_penalty
Tax Score           = base(25) + 80C_bonus + NPS_bonus + regime_bonus
Retirement Score    = (corpus / FIRE_target) × (30 / years_left)

Overall Score       = mean(all 6 dimensions)
```

**FIRE Target** = 25 × Annual Income (standard Indian FIRE benchmark)

---

## 🤖 AI Integration

The app calls the Anthropic Claude API with the user's complete financial profile and computed scores. Claude returns:

1. A **personalised insight** with a concrete number or benchmark comparison
2. A **specific SIP recommendation** (fund name + amount)
3. **3 priority actions** with exact ₹ figures, product names, and timelines

If the API call fails, a deterministic fallback engine generates context-aware advice.

---

## 📊 Sample Output

> *"Your score of 52/100 places you in the Financial Challenger tier. With ₹2.4L invested and no emergency fund, a single medical event could wipe out your entire corpus — that gap needs to be your priority before any market exposure."*
>
> 💡 Start a ₹3,000/month SIP in UTI Nifty 50 Index Fund — it's the single best default for your risk profile.

---

## 🌐 Deploy to Netlify (Free)

1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com) → "Deploy manually"
3. Drag the `/dist` folder
4. Go to **Site settings → Environment variables** → add `VITE_ANTHROPIC_KEY`
5. Done — live URL in 60 seconds ✅

---

## 🏆 Hackathon Context

**Event:** ET StartupCentral × Economic Times AI Hackathon  
**Track:** AI-Powered Personal Finance Mentor  
**Problem:** 95% of Indians lack a financial plan; advisors are inaccessible at ₹25,000+/yr  
**Solution:** A free, 5-minute AI assessment that democratises financial planning for 1.4B Indians

---

## 📜 License

MIT — free to use, fork, and build upon.

---

<p align="center">Built with ❤️ for India's 1.4 billion future investors</p>
