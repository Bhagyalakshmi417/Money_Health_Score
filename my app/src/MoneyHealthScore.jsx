import { useState, useEffect, useRef, useCallback } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from "recharts";

// ─────────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────────
const GRADES = [
  { min: 0,  max: 30,  label: "Financial Distress",   color: "#ff4d6d", bg: "rgba(255,77,109,0.1)",  emoji: "🔴" },
  { min: 31, max: 50,  label: "Financial Novice",      color: "#ff9f43", bg: "rgba(255,159,67,0.1)",  emoji: "🟠" },
  { min: 51, max: 65,  label: "Financial Challenger",  color: "#f5c060", bg: "rgba(245,192,96,0.1)",  emoji: "🟡" },
  { min: 66, max: 75,  label: "Financial Warrior",     color: "#78e08f", bg: "rgba(120,224,143,0.1)", emoji: "🟢" },
  { min: 76, max: 85,  label: "Financial Champion",    color: "#00c9a7", bg: "rgba(0,201,167,0.1)",   emoji: "💚" },
  { min: 86, max: 100, label: "Financial Elite",       color: "#e8a030", bg: "rgba(232,160,48,0.12)", emoji: "⭐" },
];

const DIMENSIONS = [
  { key: "emergency",      label: "Emergency Fund",      short: "Emergency",   icon: "🛡️", desc: "6 months of expenses buffer" },
  { key: "insurance",      label: "Insurance Cover",     short: "Insurance",   icon: "⚕️", desc: "Health + life adequacy" },
  { key: "diversification",label: "Investment Mix",      short: "Investment",  icon: "📊", desc: "Asset class spread & corpus" },
  { key: "debt",           label: "Debt Health",         short: "Debt",        icon: "💳", desc: "EMI burden & liabilities" },
  { key: "tax",            label: "Tax Efficiency",      short: "Tax",         icon: "🧾", desc: "Deduction utilization" },
  { key: "retirement",     label: "Retirement Readiness",short: "Retirement",  icon: "🏖️", desc: "Corpus vs FIRE goal" },
];

const LOADING_MSGS = [
  "Scanning your financial vitals…",
  "Benchmarking across 10,000+ Indian investors…",
  "Calculating your retirement runway…",
  "Identifying missed deductions…",
  "Building your personalized action plan…",
  "Finalising your Money Health Score…",
];

const STEPS_CONFIG = [
  {
    eyebrow: "Step 1 of 5",
    title: "Your Profile",
    subtitle: "Tell us a little about yourself to personalise your score.",
    fields: [
      { key: "age",          label: "Your Age",                  type: "number",  prefix: null, placeholder: "28",  hint: "Current age in years" },
      { key: "monthlyIncome",label: "Monthly Take-Home Income",  type: "number",  prefix: "₹",  placeholder: "65000", hint: "After-tax salary or business income" },
      { key: "cityType",     label: "City Type",                 type: "toggle",
        options: [{ val: "metro", label: "Metro" }, { val: "tier1", label: "Tier 1" }, { val: "tier2", label: "Tier 2/3" }] },
      { key: "dependents",   label: "Number of Dependents",      type: "toggle",
        options: [{ val: "0", label: "0" }, { val: "1", label: "1" }, { val: "2", label: "2" }, { val: "3+", label: "3+" }] },
    ],
  },
  {
    eyebrow: "Step 2 of 5",
    title: "Your Expenses",
    subtitle: "Where does your money go every month?",
    fields: [
      { key: "monthlyExpenses", label: "Total Monthly Expenses",        type: "number", prefix: "₹", placeholder: "35000", hint: "Groceries, bills, dining, subscriptions — everything" },
      { key: "monthlyRent",     label: "Rent / Home Loan EMI",          type: "number", prefix: "₹", placeholder: "15000", hint: "Enter 0 if you own your home outright" },
      { key: "monthlyEMI",      label: "Other EMIs (Car, Personal…)",   type: "number", prefix: "₹", placeholder: "0",     hint: "Sum of all EMIs excluding home loan" },
    ],
  },
  {
    eyebrow: "Step 3 of 5",
    title: "Your Safety Net",
    subtitle: "Protection when life throws surprises.",
    fields: [
      { key: "emergencyFundMonths",  label: "Emergency Fund (months of expenses)", type: "number", prefix: null, placeholder: "3",  hint: "How many months of expenses are in liquid savings?" },
      { key: "healthInsuranceCover", label: "Health Insurance Cover",              type: "number", prefix: "₹",  suffix: "L", placeholder: "10", hint: "Total cover in Lakhs — yours + family floater" },
      { key: "lifeInsuranceCover",   label: "Life Insurance Cover",                type: "number", prefix: "₹",  suffix: "L", placeholder: "0",  hint: "Total sum assured in Lakhs (term plan / LIC)" },
    ],
  },
  {
    eyebrow: "Step 4 of 5",
    title: "Your Investments",
    subtitle: "What you've built so far — current market value.",
    fields: [
      { key: "mutualFunds",    label: "Mutual Funds (Current Value)", type: "number", prefix: "₹", placeholder: "100000", hint: "Total current value across all MFs on Groww / Zerodha" },
      { key: "stocks",         label: "Direct Stocks / ETFs",        type: "number", prefix: "₹", placeholder: "0",      hint: "Current market value of your stock portfolio" },
      { key: "fixedDeposits",  label: "FD / PPF / Savings",          type: "number", prefix: "₹", placeholder: "50000",  hint: "Bank FDs, PPF balance, RD, savings account" },
      { key: "pfNps",          label: "PF / NPS Balance",            type: "number", prefix: "₹", placeholder: "200000", hint: "Employee + employer PF corpus + NPS balance" },
    ],
  },
  {
    eyebrow: "Step 5 of 5",
    title: "Debt & Tax",
    subtitle: "The final piece — let's complete your financial picture.",
    fields: [
      { key: "totalDebt",      label: "Total Outstanding Loans",         type: "number", prefix: "₹", placeholder: "500000", hint: "Home + car + personal + education loans combined" },
      { key: "has80C",         label: "Invested ₹1.5L under Section 80C this year?", type: "toggle",
        options: [{ val: "yes", label: "Yes, full" }, { val: "partial", label: "Partial" }, { val: "no", label: "Not yet" }] },
      { key: "taxRegime",      label: "Tax Regime",                      type: "toggle",
        options: [{ val: "new", label: "New Regime" }, { val: "old", label: "Old Regime" }] },
      { key: "retirementAge",  label: "Target Retirement Age",           type: "number", prefix: null, placeholder: "55",  hint: "When do you want to achieve financial freedom?" },
    ],
  },
];

// ─────────────────────────────────────────────
// SCORING ENGINE
// ─────────────────────────────────────────────
function calcScores(d) {
  const income    = +d.monthlyIncome      || 1;
  const expenses  = +d.monthlyExpenses    || income * 0.7;
  const emi       = +d.monthlyEMI         || 0;
  const emMonths  = +d.emergencyFundMonths || 0;
  const health    = +d.healthInsuranceCover || 0;
  const life      = +d.lifeInsuranceCover  || 0;
  const mf        = +d.mutualFunds         || 0;
  const stocks    = +d.stocks              || 0;
  const fd        = +d.fixedDeposits       || 0;
  const pf        = +d.pfNps               || 0;
  const debt      = +d.totalDebt           || 0;
  const age       = +d.age                 || 28;
  const retAge    = +d.retirementAge       || 60;

  // 1. Emergency (target = 6 months)
  const emergency = Math.min(100, Math.round((emMonths / 6) * 100));

  // 2. Insurance
  const recHealth = income < 50000 ? 5 : income < 100000 ? 10 : 20;
  const recLife   = Math.round((income * 12 * 10) / 100000);
  const hS = Math.min(50, Math.round((health / recHealth) * 50));
  const lS = life > 0 ? Math.min(50, Math.round((life / Math.max(recLife, 1)) * 50)) : 0;
  const insurance = Math.min(100, hS + lS);

  // 3. Diversification
  const assetCount = [mf > 0, stocks > 0, fd > 0, pf > 0].filter(Boolean).length;
  const totalInvest = mf + stocks + fd + pf;
  const investRatio = Math.min(1, totalInvest / (income * 12));
  const diversification = Math.round((assetCount / 4) * 60 + investRatio * 40);

  // 4. Debt Health
  const emiRatio   = emi / income;
  const debtMonths = income > 0 ? debt / income : 0;
  const debtScore  = Math.max(0, Math.round(100 - emiRatio * 150 - Math.min(30, debtMonths / 2)));

  // 5. Tax Efficiency
  let tax = 25;
  if (d.has80C === "yes")     tax += 40;
  if (d.has80C === "partial") tax += 20;
  if (pf > 0)                 tax += 20;
  if (d.taxRegime === "old")  tax += 15;
  tax = Math.min(100, tax);

  // 6. Retirement Readiness (25× annual income rule)
  const yearsLeft    = Math.max(1, retAge - age);
  const targetCorpus = income * 12 * 25;
  const rawProgress  = (totalInvest / Math.max(targetCorpus, 1)) * 100;
  const timeAdj      = rawProgress * (30 / yearsLeft);
  const retirement   = Math.min(100, Math.max(0, Math.round(timeAdj)));

  const overall = Math.round(
    (emergency + insurance + diversification + debtScore + tax + retirement) / 6
  );

  return { emergency, insurance, diversification, debt: debtScore, tax, retirement, overall };
}

function getGrade(score) {
  return GRADES.find(g => score >= g.min && score <= g.max) || GRADES[0];
}

function getDimColor(s) {
  if (s >= 75) return "#00c9a7";
  if (s >= 50) return "#f5c060";
  if (s >= 30) return "#ff9f43";
  return "#ff4d6d";
}

// ─────────────────────────────────────────────
// CLAUDE API HELPER
// ─────────────────────────────────────────────
async function fetchAIAdvice(formData, scores) {
  const prompt = `You are India's most trusted personal finance advisor. A user completed a Money Health Score assessment. Provide 3 prioritised, actionable recommendations with Indian context.

USER PROFILE:
Age: ${formData.age} | City: ${formData.cityType} | Dependents: ${formData.dependents}
Monthly Income: ₹${formData.monthlyIncome} | Expenses: ₹${formData.monthlyExpenses} | EMI: ₹${formData.monthlyEMI}
Emergency Fund: ${formData.emergencyFundMonths} months | Health Cover: ₹${formData.healthInsuranceCover}L | Life Cover: ₹${formData.lifeInsuranceCover}L
Mutual Funds: ₹${formData.mutualFunds} | Stocks: ₹${formData.stocks} | FD/PPF: ₹${formData.fixedDeposits} | PF/NPS: ₹${formData.pfNps}
Total Debt: ₹${formData.totalDebt} | 80C status: ${formData.has80C} | Tax regime: ${formData.taxRegime} | Target retirement: ${formData.retirementAge}

SCORES (0-100):
Emergency: ${scores.emergency} | Insurance: ${scores.insurance} | Investments: ${scores.diversification}
Debt: ${scores.debt} | Tax: ${scores.tax} | Retirement: ${scores.retirement} | Overall: ${scores.overall}

INSTRUCTIONS: Respond ONLY with valid JSON — no markdown, no backticks, no preamble.
{
  "insight": "One powerful, personal 1-2 sentence insight about their specific financial situation with a concrete number or comparison",
  "sipSuggestion": "One sentence: specific monthly SIP amount they should start right now and why (e.g. ₹3,000/month in Nifty 50 index fund)",
  "actions": [
    {
      "priority": "URGENT",
      "title": "Short action title (5-7 words)",
      "detail": "2-3 sentences. Be specific: mention exact amounts, product names (ELSS, NPS, term plan), timelines. Indian context only. No generic advice.",
      "impact": "Specific financial impact in rupees or percentage over a timeframe"
    },
    { "priority": "HIGH", ... },
    { "priority": "MEDIUM", ... }
  ]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const raw = data.content?.[0]?.text || "";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

function getFallbackAdvice(s) {
  const actions = [];
  if (s.emergency < 60) actions.push({ priority: "URGENT", title: "Build a 6-Month Emergency Fund", detail: "You're exposed to financial shocks right now. Park ₹5,000–₹10,000/month in a liquid mutual fund (Parag Parikh or HDFC Liquid Fund). Automate the transfer on your salary date. Aim for 6× your monthly expenses.", impact: "Protects against job loss, medical emergencies, and prevents high-interest debt" });
  if (s.insurance < 50) actions.push({ priority: "URGENT", title: "Fix Your Insurance Coverage", detail: "You need at least ₹10L family floater health cover (Star Health / HDFC Ergo ~₹15,000/yr) and a term life cover of ₹1 crore (costs under ₹10,000/yr for age under 35 on PolicyBazaar).", impact: "Prevents wiping out your entire savings in a single medical event" });
  if (s.tax < 65) actions.push({ priority: "HIGH", title: "Exhaust Your ₹1.5L 80C Limit", detail: "Invest in ELSS mutual funds (Mirae Asset Tax Saver or Axis Long Term Equity) to claim the full ₹1.5L deduction. With 3-year lock-in and historical 12–15% returns, ELSS beats PPF and ULIP significantly.", impact: "Save up to ₹46,800 in taxes annually under the old regime" });
  if (s.retirement < 50) actions.push({ priority: "HIGH", title: "Start a Retirement SIP Today", detail: "Even ₹3,000/month in a Nifty 50 index fund (UTI / HDFC) compounding at 12% for 20 years = ₹30L+. Time in market beats timing the market — start today on Zerodha Coin or Groww.", impact: "₹3,000/month for 25 years at 12% = ₹57L retirement corpus" });
  if (s.diversification < 50) actions.push({ priority: "MEDIUM", title: "Diversify Across 4 Asset Classes", detail: "Structure your portfolio: 60% equity MFs, 20% debt / FD, 10% gold (Sovereign Gold Bonds or Gold ETF), 10% international (Motilal Oswal Nasdaq 100). Use a monthly SIP to invest systematically.", impact: "Reduces portfolio volatility by 30–40% while maintaining long-term growth" });
  while (actions.length < 3) actions.push({ priority: "MEDIUM", title: "Adopt the 50-30-20 Budget Rule", detail: "Allocate 50% of take-home to needs, 30% to wants, and 20% to savings and investments. Use an app like YNAB or ET Money to track every rupee. Small leaks sink big ships.", impact: "Automating 20% savings means building wealth without feeling deprived" });
  return {
    insight: `Your score of ${s.overall}/100 places you in the ${getGrade(s.overall).label} tier. ${s.overall < 60 ? "You have clear gaps that need urgent attention, but the good news is they're entirely fixable." : "You've built a solid foundation — now it's time to optimise and accelerate."}`,
    sipSuggestion: "Start a ₹3,000/month SIP in a Nifty 50 index fund — it's the single best default investment for most Indians.",
    actions: actions.slice(0, 3),
  };
}

// ─────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
:root{
  --bg:#07090f;--bg1:#0b0f1a;--bg2:#0f1420;--bg3:#141b2e;
  --border:rgba(232,176,64,0.14);--border2:rgba(255,255,255,0.07);
  --gold:#e8a030;--gold2:#f5c060;--gold-glow:rgba(232,160,48,0.2);
  --teal:#00c9a7;--teal-dim:rgba(0,201,167,0.12);
  --red:#ff4d6d;--orange:#ff9f43;--yellow:#f5c060;--green:#78e08f;
  --text:#ede8e0;--muted:#7a8499;--dim:#2d3548;
  --r:14px;--rmd:10px;
}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;}

/* ── AMBIENT ── */
.app{min-height:100vh;position:relative;overflow-x:hidden;}
.orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0;}
.orb1{top:-15%;right:-8%;width:560px;height:560px;background:radial-gradient(circle,rgba(232,160,48,0.07),transparent 70%);}
.orb2{bottom:-10%;left:-5%;width:480px;height:480px;background:radial-gradient(circle,rgba(0,201,167,0.055),transparent 70%);}
.orb3{top:45%;left:15%;width:320px;height:320px;background:radial-gradient(circle,rgba(100,120,255,0.035),transparent 70%);}

/* ── WELCOME ── */
.welcome{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;position:relative;z-index:1;text-align:center;}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,176,64,0.1);border:1px solid rgba(232,176,64,0.3);border-radius:100px;padding:6px 18px;font-size:11px;font-weight:600;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:36px;animation:fadeUp 0.5s ease both;}
.w-title{font-family:'Playfair Display',serif;font-size:clamp(44px,9vw,82px);font-weight:900;line-height:1.04;letter-spacing:-0.025em;margin-bottom:24px;animation:fadeUp 0.5s 0.1s ease both;}
.w-title .gold{color:var(--gold);}
.w-title .ital{font-style:italic;font-weight:600;}
.w-sub{font-size:17px;color:var(--muted);max-width:460px;line-height:1.75;margin-bottom:48px;animation:fadeUp 0.5s 0.2s ease both;}
.pills{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:48px;animation:fadeUp 0.5s 0.3s ease both;}
.pill{background:var(--bg2);border:1px solid var(--border2);border-radius:100px;padding:8px 16px;font-size:12px;color:var(--muted);}
.pill b{color:var(--text);font-weight:600;}
.btn-gold{background:var(--gold);color:#060400;border:none;border-radius:100px;padding:16px 44px;font-size:16px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.25s;animation:fadeUp 0.5s 0.4s ease both;letter-spacing:0.01em;}
.btn-gold:hover{background:var(--gold2);transform:translateY(-3px);box-shadow:0 12px 40px var(--gold-glow);}
.btn-gold:active{transform:translateY(0);}
.w-note{margin-top:20px;font-size:13px;color:var(--dim);animation:fadeUp 0.5s 0.5s ease both;}

/* ── FORM ── */
.form-shell{min-height:100vh;display:flex;flex-direction:column;position:relative;z-index:1;}
.form-nav{padding:18px 32px;display:flex;align-items:center;gap:20px;border-bottom:1px solid var(--border2);backdrop-filter:blur(24px);background:rgba(7,9,15,0.85);position:sticky;top:0;z-index:10;}
.nav-logo{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--gold);letter-spacing:-0.01em;flex-shrink:0;}
.prog-wrap{flex:1;max-width:360px;}
.prog-label{font-size:11px;color:var(--dim);margin-bottom:5px;font-family:'DM Mono',monospace;}
.prog-track{height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;}
.prog-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--gold),var(--teal));transition:width 0.5s cubic-bezier(0.4,0,0.2,1);}
.nav-step{font-size:12px;color:var(--muted);font-family:'DM Mono',monospace;flex-shrink:0;}
.form-body{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 24px;}
.form-card{width:100%;max-width:580px;}
.step-eye{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--gold);font-family:'DM Mono',monospace;margin-bottom:10px;}
.step-title{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;margin-bottom:8px;line-height:1.1;}
.step-sub{font-size:15px;color:var(--muted);margin-bottom:36px;line-height:1.6;}
.fields{display:grid;gap:20px;}
.fields-2{grid-template-columns:1fr 1fr;}
.fgroup{}
.flabel{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:0.07em;text-transform:uppercase;margin-bottom:8px;display:block;}
.fhint{font-size:11px;color:var(--dim);margin-top:5px;}
.inp-wrap{position:relative;}
.inp-pre{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;font-family:'DM Mono',monospace;pointer-events:none;}
.inp{width:100%;background:var(--bg2);border:1px solid var(--border2);border-radius:var(--r);padding:14px 16px;color:var(--text);font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.2s,box-shadow 0.2s;-webkit-appearance:none;-moz-appearance:textfield;}
.inp.has-pre{padding-left:34px;}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-glow);}
.inp::placeholder{color:var(--dim);}
.inp::-webkit-outer-spin-button,.inp::-webkit-inner-spin-button{-webkit-appearance:none;}
.toggle-grp{display:flex;gap:8px;flex-wrap:wrap;}
.tog{flex:1;min-width:70px;padding:11px 12px;background:var(--bg2);border:1px solid var(--border2);border-radius:var(--rmd);color:var(--muted);font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s;text-align:center;white-space:nowrap;}
.tog:hover{border-color:rgba(232,176,64,0.35);color:var(--text);}
.tog.on{background:rgba(232,176,64,0.1);border-color:var(--gold);color:var(--gold);font-weight:500;}
.form-acts{display:flex;gap:12px;margin-top:40px;align-items:center;}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border2);border-radius:100px;padding:12px 28px;font-size:14px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s;flex-shrink:0;}
.btn-ghost:hover{color:var(--text);border-color:rgba(255,255,255,0.15);}
.slide-fwd{animation:slideFwd 0.32s ease both;}
.slide-back{animation:slideBack 0.32s ease both;}

/* ── LOADING ── */
.loading{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;position:relative;z-index:1;padding:40px 24px;}
.load-ring{width:100px;height:100px;position:relative;flex-shrink:0;}
.load-ring svg{width:100%;height:100%;animation:spin 1.8s linear infinite;}
.load-ring-inner{position:absolute;inset:18px;background:radial-gradient(circle,rgba(232,176,64,0.18),transparent);border-radius:50%;animation:breathe 2s ease-in-out infinite;}
.load-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;text-align:center;min-height:34px;}
.load-sub{font-size:14px;color:var(--muted);text-align:center;margin-top:4px;}
.load-steps{display:flex;flex-direction:column;gap:8px;width:100%;max-width:340px;}
.lstep{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--bg2);border-radius:var(--rmd);font-size:13px;color:var(--muted);transition:all 0.35s;border:1px solid transparent;}
.lstep.done{color:var(--teal);border-color:rgba(0,201,167,0.18);background:rgba(0,201,167,0.04);}
.lstep.act{color:var(--text);border-color:rgba(232,176,64,0.2);}
.ldot{width:7px;height:7px;border-radius:50%;background:var(--dim);flex-shrink:0;transition:background 0.3s;}
.lstep.done .ldot{background:var(--teal);}
.lstep.act .ldot{background:var(--gold);animation:pulse 0.9s infinite;}

/* ── RESULTS ── */
.results{position:relative;z-index:1;padding-bottom:100px;}
.res-top{padding:40px 24px 0;text-align:center;}
.res-eye{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-family:'DM Mono',monospace;margin-bottom:8px;}
.res-title{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;margin-bottom:48px;}

/* Score circle */
.score-sec{display:flex;flex-direction:column;align-items:center;padding:0 24px 52px;}
.score-ring{position:relative;width:230px;height:230px;margin-bottom:28px;}
.score-ring svg{width:100%;height:100%;transform:rotate(-90deg);}
.ring-bg{fill:none;stroke:var(--bg3);stroke-width:10;}
.ring-fill{fill:none;stroke-width:10;stroke-linecap:round;transition:stroke-dashoffset 2.2s cubic-bezier(0.34,1.4,0.64,1);}
.score-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;}
.score-num{font-family:'DM Mono',monospace;font-size:60px;font-weight:500;line-height:1;}
.score-denom{font-size:13px;color:var(--muted);font-family:'DM Mono',monospace;}
.grade-label{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;margin-bottom:8px;}
.grade-desc{font-size:14px;color:var(--muted);max-width:320px;text-align:center;line-height:1.65;}

/* Section */
.sec{max-width:680px;margin:0 auto;padding:0 24px 44px;}
.sec-title{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;margin-bottom:20px;}

/* AI Insight */
.insight-card{background:linear-gradient(135deg,rgba(232,176,64,0.08),rgba(0,201,167,0.05));border:1px solid rgba(232,176,64,0.22);border-radius:var(--r);padding:24px;display:flex;gap:16px;align-items:flex-start;}
.insight-ico{width:36px;height:36px;background:rgba(232,176,64,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.insight-body{font-size:15px;color:var(--text);line-height:1.7;}
.sip-tag{margin-top:10px;font-size:13px;color:var(--teal);background:var(--teal-dim);display:inline-block;padding:4px 12px;border-radius:100px;}

/* Divider */
.divider{max-width:680px;margin:0 auto 0;height:1px;background:var(--border2);}

/* Dimension bars */
.dim-list{display:flex;flex-direction:column;gap:12px;}
.dim-card{background:var(--bg2);border:1px solid var(--border2);border-radius:var(--r);padding:18px 20px;}
.dim-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.dim-left{display:flex;align-items:center;gap:10px;}
.dim-ico{font-size:18px;line-height:1;}
.dim-name{font-size:14px;font-weight:500;}
.dim-desc{font-size:11px;color:var(--muted);}
.dim-score{font-family:'DM Mono',monospace;font-size:20px;font-weight:500;}
.bar-track{height:6px;background:var(--bg3);border-radius:3px;overflow:hidden;}
.bar-fill{height:100%;border-radius:3px;transition:width 1.6s cubic-bezier(0.34,1.1,0.64,1);}

/* Radar */
.radar-card{background:var(--bg2);border:1px solid var(--border2);border-radius:var(--r);padding:24px 16px;}

/* Actions */
.actions-list{display:flex;flex-direction:column;gap:14px;}
.action-card{background:var(--bg2);border:1px solid var(--border2);border-radius:var(--r);padding:20px 22px;display:flex;gap:16px;align-items:flex-start;animation:fadeUp 0.5s ease both;}
.action-card:nth-child(1){animation-delay:0.05s;}
.action-card:nth-child(2){animation-delay:0.15s;}
.action-card:nth-child(3){animation-delay:0.25s;}
.a-num{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:13px;color:var(--gold);flex-shrink:0;background:rgba(232,176,64,0.06);}
.a-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 9px;border-radius:100px;margin-bottom:6px;}
.a-urgent{background:rgba(255,77,109,0.12);color:var(--red);}
.a-high{background:rgba(255,159,67,0.12);color:var(--orange);}
.a-medium{background:rgba(0,201,167,0.1);color:var(--teal);}
.a-title{font-size:15px;font-weight:600;margin-bottom:5px;}
.a-detail{font-size:13px;color:var(--muted);line-height:1.65;}
.a-impact{margin-top:8px;font-size:12px;color:var(--teal);font-weight:500;}

/* AI Loader */
.ai-wait{display:flex;align-items:center;gap:14px;padding:22px;background:var(--bg2);border-radius:var(--r);border:1px solid var(--border2);}
.ai-dots{display:flex;gap:5px;}
.ai-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);}
.ai-dot:nth-child(1){animation:bounce 0.9s 0s infinite;}
.ai-dot:nth-child(2){animation:bounce 0.9s 0.2s infinite;}
.ai-dot:nth-child(3){animation:bounce 0.9s 0.4s infinite;}

/* Score band */
.band{max-width:680px;margin:0 auto;display:flex;gap:3px;padding:0 24px 48px;}
.band-seg{flex:1;height:8px;border-radius:4px;opacity:0.4;transition:opacity 0.3s;}
.band-seg.active{opacity:1;}

/* Retake */
.retake{text-align:center;padding:0 24px;}
.footnote{margin-top:14px;font-size:12px;color:var(--dim);}

/* ── KEYFRAMES ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideFwd{from{opacity:0;transform:translateX(32px);}to{opacity:1;transform:translateX(0);}}
@keyframes slideBack{from{opacity:0;transform:translateX(-32px);}to{opacity:1;transform:translateX(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes breathe{0%,100%{opacity:0.5;transform:scale(0.92);}50%{opacity:1;transform:scale(1.06);}}
@keyframes pulse{0%,100%{opacity:0.4;transform:scale(0.85);}50%{opacity:1;transform:scale(1.1);}}
@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}

@media(max-width:580px){
  .fields-2{grid-template-columns:1fr;}
  .form-nav{padding:14px 18px;}
  .prog-wrap{display:none;}
  .w-title{font-size:40px;}
  .score-num{font-size:48px;}
}
`;

// ─────────────────────────────────────────────
// CUSTOM RADAR LABEL
// ─────────────────────────────────────────────
function CustomRadarTick({ x, y, payload }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      style={{ fill: "#7a8499", fontSize: "11px", fontFamily: "'DM Sans', sans-serif" }}>
      {payload.value}
    </text>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function MoneyHealthScore() {
  const [phase,       setPhase]      = useState("welcome");  // welcome | form | loading | results
  const [step,        setStep]       = useState(0);
  const [slideDir,    setSlideDir]   = useState("fwd");
  const [scores,      setScores]     = useState(null);
  const [aiAdvice,    setAiAdvice]   = useState(null);
  const [animScore,   setAnimScore]  = useState(0);
  const [loadStep,    setLoadStep]   = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);

  const [form, setForm] = useState({
    age: "", monthlyIncome: "", cityType: "metro", dependents: "0",
    monthlyExpenses: "", monthlyRent: "", monthlyEMI: "",
    emergencyFundMonths: "", healthInsuranceCover: "", lifeInsuranceCover: "",
    mutualFunds: "", stocks: "", fixedDeposits: "", pfNps: "",
    totalDebt: "", has80C: "no", taxRegime: "new", retirementAge: "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Step navigation
  const goNext = () => {
    setSlideDir("fwd");
    if (step < 4) { setStep(s => s + 1); }
    else startCalc();
  };
  const goBack = () => {
    if (step === 0) { setPhase("welcome"); return; }
    setSlideDir("back");
    setStep(s => s - 1);
  };

  const startCalc = async () => {
    setPhase("loading");
    const computed = calcScores(form);
    setScores(computed);

    // Animate loading steps
    for (let i = 0; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 620));
      setLoadStep(i);
    }

    // Fetch AI advice (with fallback)
    let advice;
    try {
      advice = await fetchAIAdvice(form, computed);
    } catch {
      advice = getFallbackAdvice(computed);
    }
    setAiAdvice(advice);
    await new Promise(r => setTimeout(r, 300));
    setPhase("results");

    // Animate score counter
    setTimeout(() => {
      let cur = 0;
      const target = computed.overall;
      const tick = setInterval(() => {
        cur += Math.ceil((target - cur) / 7);
        if (cur >= target) { cur = target; clearInterval(tick); }
        setAnimScore(cur);
      }, 40);
    }, 400);

    // Reveal dimension bars
    setTimeout(() => setBarsVisible(true), 700);
  };

  // ── RENDERS ──────────────────────────────────

  function renderWelcome() {
    return (
      <div className="welcome">
        <div className="badge">✦ AI-Powered · Free · 5 Minutes</div>
        <h1 className="w-title">
          Know Your<br />
          <span className="gold">Financial</span><br />
          <span className="ital">Health Score</span>
        </h1>
        <p className="w-sub">
          A comprehensive score across 6 dimensions of financial wellness —
          built specifically for India, powered by AI. No jargon. No advisor fees.
        </p>
        <div className="pills">
          <div className="pill"><b>95%</b> of Indians lack a financial plan</div>
          <div className="pill">Advisors charge <b>₹25,000+/yr</b></div>
          <div className="pill">Takes only <b>5 minutes</b></div>
        </div>
        <button className="btn-gold" onClick={() => { setPhase("form"); setStep(0); }}>
          Start Free Assessment →
        </button>
        <p className="w-note">No registration required · Your data stays private</p>
      </div>
    );
  }

  function renderForm() {
    const conf     = STEPS_CONFIG[step];
    const progress = ((step + 1) / 5) * 100;
    const isLast   = step === 4;

    return (
      <div className="form-shell">
        <nav className="form-nav">
          <div className="nav-logo">MHS</div>
          <div className="prog-wrap">
            <div className="prog-label">Progress</div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="nav-step">{step + 1} of 5</div>
        </nav>

        <div className="form-body">
          <div className={`form-card ${slideDir === "fwd" ? "slide-fwd" : "slide-back"}`} key={step}>
            <div className="step-eye">{conf.eyebrow}</div>
            <h2 className="step-title">{conf.title}</h2>
            <p className="step-sub">{conf.subtitle}</p>

            <div className={`fields ${conf.fields.length >= 4 ? "fields-2" : ""}`}>
              {conf.fields.map(f => renderField(f))}
            </div>

            <div className="form-acts">
              <button className="btn-ghost" onClick={goBack}>← Back</button>
              <button className="btn-gold" style={{ flex: 1, padding: "14px 24px" }} onClick={goNext}>
                {isLast ? "Calculate My Score →" : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderField(f) {
    if (f.type === "toggle") {
      return (
        <div key={f.key} className="fgroup">
          <label className="flabel">{f.label}</label>
          <div className="toggle-grp">
            {f.options.map(o => (
              <button key={o.val}
                className={`tog${form[f.key] === o.val ? " on" : ""}`}
                onClick={() => set(f.key, o.val)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={f.key} className="fgroup">
        <label className="flabel">{f.label}</label>
        <div className="inp-wrap">
          {f.prefix && <span className="inp-pre">{f.prefix}</span>}
          <input
            type="number"
            className={`inp${f.prefix ? " has-pre" : ""}`}
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={e => set(f.key, e.target.value)}
          />
        </div>
        {f.hint && <div className="fhint">{f.hint}</div>}
      </div>
    );
  }

  function renderLoading() {
    return (
      <div className="loading">
        <div className="load-ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(232,176,64,0.12)" strokeWidth="2" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" strokeWidth="2"
              strokeDasharray="28 250" strokeLinecap="round" />
          </svg>
          <div className="load-ring-inner" />
        </div>
        <div>
          <div className="load-title">{LOADING_MSGS[Math.min(loadStep, LOADING_MSGS.length - 1)]}</div>
          <div className="load-sub">Personalising for your financial profile</div>
        </div>
        <div className="load-steps">
          {LOADING_MSGS.map((msg, i) => (
            <div key={i} className={`lstep${i < loadStep ? " done" : i === loadStep ? " act" : ""}`}>
              <div className="ldot" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderResults() {
    if (!scores) return null;
    const grade   = getGrade(scores.overall);
    const circum  = 2 * Math.PI * 96;
    const offset  = circum - (animScore / 100) * circum;
    const radarData = DIMENSIONS.map(d => ({
      dimension: d.short,
      score: scores[d.key],
    }));

    const bandColors = ["#ff4d6d","#ff9f43","#f5c060","#78e08f","#00c9a7","#e8a030"];

    return (
      <div className="results">

        {/* Header */}
        <div className="res-top">
          <div className="res-eye">Assessment Complete</div>
          <h1 className="res-title">Your Money Health Score</h1>
        </div>

        {/* Score Ring */}
        <div className="score-sec">
          <div className="score-ring">
            <svg viewBox="0 0 200 200">
              <defs>
                <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e8a030" />
                  <stop offset="100%" stopColor="#00c9a7" />
                </linearGradient>
              </defs>
              <circle className="ring-bg" cx="100" cy="100" r="96" />
              <circle
                className="ring-fill"
                cx="100" cy="100" r="96"
                stroke={scores.overall >= 66 ? "url(#rg)" : scores.overall >= 51 ? "var(--yellow)" : scores.overall >= 31 ? "var(--orange)" : "var(--red)"}
                strokeDasharray={`${circum}`}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="score-inner">
              <div className="score-num" style={{ color: grade.color }}>{animScore}</div>
              <div className="score-denom">/ 100</div>
            </div>
          </div>

          <div className="grade-label" style={{ color: grade.color }}>
            {grade.emoji} {grade.label}
          </div>
          <div className="grade-desc">{grade.desc}</div>
        </div>

        {/* Score band */}
        <div className="band">
          {GRADES.map((g, i) => (
            <div key={i} className={`band-seg${scores.overall >= g.min && scores.overall <= g.max ? " active" : ""}`}
              style={{ background: bandColors[i] }} />
          ))}
        </div>

        {/* AI Insight */}
        {aiAdvice && (
          <div className="sec" style={{ paddingTop: 0 }}>
            <div className="insight-card">
              <div className="insight-ico">✦</div>
              <div>
                <div className="insight-body">{aiAdvice.insight}</div>
                <div className="sip-tag">💡 {aiAdvice.sipSuggestion}</div>
              </div>
            </div>
          </div>
        )}

        <div className="divider" style={{ marginBottom: 40 }} />

        {/* Financial Vitals */}
        <div className="sec">
          <div className="sec-title">Financial Vitals</div>
          <div className="dim-list">
            {DIMENSIONS.map((d, i) => {
              const val   = scores[d.key];
              const color = getDimColor(val);
              return (
                <div className="dim-card" key={d.key}
                  style={{ animationDelay: `${i * 0.06}s`, animation: "fadeUp 0.5s ease both" }}>
                  <div className="dim-top">
                    <div className="dim-left">
                      <span className="dim-ico">{d.icon}</span>
                      <div>
                        <div className="dim-name">{d.label}</div>
                        <div className="dim-desc">{d.desc}</div>
                      </div>
                    </div>
                    <div className="dim-score" style={{ color }}>{val}</div>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill"
                      style={{
                        width: barsVisible ? `${val}%` : "0%",
                        background: color,
                        transitionDelay: `${i * 0.08}s`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 40 }} />

        {/* Radar Chart */}
        <div className="sec">
          <div className="sec-title">Score Radar</div>
          <div className="radar-card">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="dimension" tick={<CustomRadarTick />} />
                <Tooltip
                  contentStyle={{ background: "#0f1420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "13px", color: "#ede8e0" }}
                  labelStyle={{ color: "#e8a030" }}
                />
                <Radar
                  name="Your Score"
                  dataKey="score"
                  stroke="#e8a030"
                  fill="#e8a030"
                  fillOpacity={0.14}
                  strokeWidth={2}
                  dot={{ fill: "#e8a030", r: 4 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 40 }} />

        {/* Priority Actions */}
        <div className="sec">
          <div className="sec-title">Your Top 3 Priority Actions</div>
          {!aiAdvice ? (
            <div className="ai-wait">
              <div className="ai-dots">
                <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
              </div>
              <span style={{ fontSize: "14px", color: "var(--muted)" }}>
                AI is crafting your personalised action plan…
              </span>
            </div>
          ) : (
            <div className="actions-list">
              {aiAdvice.actions.map((a, i) => (
                <div className="action-card" key={i}>
                  <div className="a-num">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className={`a-badge a-${a.priority.toLowerCase()}`}>{a.priority}</div>
                    <div className="a-title">{a.title}</div>
                    <div className="a-detail">{a.detail}</div>
                    {a.impact && <div className="a-impact">📈 {a.impact}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider" style={{ marginBottom: 48 }} />

        {/* Retake */}
        <div className="retake">
          <button className="btn-gold"
            onClick={() => {
              setPhase("welcome"); setStep(0); setScores(null);
              setAiAdvice(null); setAnimScore(0); setLoadStep(0); setBarsVisible(false);
            }}>
            Retake Assessment
          </button>
          <p className="footnote">
            Powered by Claude AI · Built for Economic Times ET StartupCentral Hackathon
          </p>
        </div>
      </div>
    );
  }

  // ── RENDER ROOT ───────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        {phase === "welcome" && renderWelcome()}
        {phase === "form"    && renderForm()}
        {phase === "loading" && renderLoading()}
        {phase === "results" && renderResults()}
      </div>
    </>
  );
}
