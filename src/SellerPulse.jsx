import { useState, useRef, useCallback, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// sample data from a fake cafe so people can test without uploading anything
// I based the numbers on what a mid-size coffee shop might actually do in a week
const SAMPLE_CSV = `date,item,category,quantity,revenue,cost
2025-02-03,Oat Milk Latte,Beverages,45,247.50,90.00
2025-02-03,Croissant,Pastries,32,128.00,48.00
2025-02-03,Avocado Toast,Food,18,198.00,72.00
2025-02-03,Drip Coffee,Beverages,62,186.00,43.40
2025-02-03,Blueberry Muffin,Pastries,24,84.00,28.80
2025-02-04,Oat Milk Latte,Beverages,52,286.00,104.00
2025-02-04,Croissant,Pastries,28,112.00,42.00
2025-02-04,Avocado Toast,Food,22,242.00,88.00
2025-02-04,Drip Coffee,Beverages,58,174.00,40.60
2025-02-04,Blueberry Muffin,Pastries,19,66.50,22.80
2025-02-04,Chai Latte,Beverages,15,82.50,30.00
2025-02-05,Oat Milk Latte,Beverages,48,264.00,96.00
2025-02-05,Croissant,Pastries,35,140.00,52.50
2025-02-05,Avocado Toast,Food,25,275.00,100.00
2025-02-05,Drip Coffee,Beverages,70,210.00,49.00
2025-02-05,Blueberry Muffin,Pastries,22,77.00,26.40
2025-02-05,Chai Latte,Beverages,18,99.00,36.00
2025-02-05,Breakfast Burrito,Food,14,154.00,56.00
2025-02-06,Oat Milk Latte,Beverages,41,225.50,82.00
2025-02-06,Croissant,Pastries,30,120.00,45.00
2025-02-06,Avocado Toast,Food,20,220.00,80.00
2025-02-06,Drip Coffee,Beverages,55,165.00,38.50
2025-02-06,Blueberry Muffin,Pastries,26,91.00,31.20
2025-02-06,Chai Latte,Beverages,12,66.00,24.00
2025-02-06,Breakfast Burrito,Food,16,176.00,64.00
2025-02-07,Oat Milk Latte,Beverages,58,319.00,116.00
2025-02-07,Croissant,Pastries,42,168.00,63.00
2025-02-07,Avocado Toast,Food,28,308.00,112.00
2025-02-07,Drip Coffee,Beverages,78,234.00,54.60
2025-02-07,Blueberry Muffin,Pastries,30,105.00,36.00
2025-02-07,Chai Latte,Beverages,22,121.00,44.00
2025-02-07,Breakfast Burrito,Food,20,220.00,80.00
2025-02-07,Matcha Latte,Beverages,8,52.00,20.00
2025-02-08,Oat Milk Latte,Beverages,65,357.50,130.00
2025-02-08,Croissant,Pastries,48,192.00,72.00
2025-02-08,Avocado Toast,Food,32,352.00,128.00
2025-02-08,Drip Coffee,Beverages,85,255.00,59.50
2025-02-08,Blueberry Muffin,Pastries,35,122.50,42.00
2025-02-08,Chai Latte,Beverages,25,137.50,50.00
2025-02-08,Breakfast Burrito,Food,24,264.00,96.00
2025-02-08,Matcha Latte,Beverages,12,78.00,30.00
2025-02-09,Oat Milk Latte,Beverages,60,330.00,120.00
2025-02-09,Croissant,Pastries,44,176.00,66.00
2025-02-09,Avocado Toast,Food,30,330.00,120.00
2025-02-09,Drip Coffee,Beverages,80,240.00,56.00
2025-02-09,Blueberry Muffin,Pastries,32,112.00,38.40
2025-02-09,Chai Latte,Beverages,20,110.00,40.00
2025-02-09,Breakfast Burrito,Food,22,242.00,88.00
2025-02-09,Matcha Latte,Beverages,10,65.00,25.00`;

// green palette for charts - wanted something that felt "money" without being too corporate
const COLORS = ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC", "#1B4332"];

// super basic CSV parser. doesn't handle quoted commas or anything fancy
// but works fine for square exports which are pretty clean
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      // try to parse as number, fall back to string
      obj[h] = isNaN(vals[i]) ? vals[i] : parseFloat(vals[i]);
    });
    return obj;
  });
}

// crunches all the numbers we need for the dashboard + the AI prompt
// probably could split this up but it runs fast enough on any reasonable dataset
function analyzeData(data) {
  const totalRevenue = data.reduce((s, r) => s + (r.revenue || 0), 0);
  const totalCost = data.reduce((s, r) => s + (r.cost || 0), 0);
  const totalQty = data.reduce((s, r) => s + (r.quantity || 0), 0);
  const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100) : 0;

  // group by date for the line chart
  const byDate = {};
  data.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = 0;
    byDate[r.date] += r.revenue || 0;
  });
  const dailyRevenue = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date: new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      revenue: Math.round(revenue * 100) / 100
    }));

  // group by category for the pie chart
  const byCat = {};
  data.forEach(r => {
    const cat = r.category || "Other";
    if (!byCat[cat]) byCat[cat] = { revenue: 0, cost: 0, qty: 0 };
    byCat[cat].revenue += r.revenue || 0;
    byCat[cat].cost += r.cost || 0;
    byCat[cat].qty += r.quantity || 0;
  });
  const categoryData = Object.entries(byCat)
    .map(([name, d]) => ({ name, revenue: Math.round(d.revenue), margin: Math.round((d.revenue - d.cost) / d.revenue * 100) }))
    .sort((a, b) => b.revenue - a.revenue);

  // group by item for the bar chart + top sellers list
  const byItem = {};
  data.forEach(r => {
    const item = r.item || "Unknown";
    if (!byItem[item]) byItem[item] = { revenue: 0, cost: 0, qty: 0 };
    byItem[item].revenue += r.revenue || 0;
    byItem[item].cost += r.cost || 0;
    byItem[item].qty += r.quantity || 0;
  });
  const topItems = Object.entries(byItem)
    .map(([name, d]) => ({ name, revenue: Math.round(d.revenue), qty: d.qty, margin: Math.round((d.revenue - d.cost) / d.revenue * 100) }))
    .sort((a, b) => b.revenue - a.revenue);

  // find best and worst days
  const sortedDays = Object.entries(byDate).sort(([, a], [, b]) => b - a);
  const bestDay = sortedDays[0];
  const worstDay = sortedDays[sortedDays.length - 1];

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalQty,
    margin: Math.round(margin * 10) / 10,
    dailyRevenue,
    categoryData,
    topItems,
    bestDay: bestDay ? { date: bestDay[0], revenue: Math.round(bestDay[1]) } : null,
    worstDay: worstDay ? { date: worstDay[0], revenue: Math.round(worstDay[1]) } : null,
    numDays: Object.keys(byDate).length,
    numItems: Object.keys(byItem).length,
    avgDaily: Math.round(totalRevenue / Math.max(Object.keys(byDate).length, 1)),
  };
}

// little reusable stat card component
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? "#2D6A4F" : "#FAFAF8",
      borderRadius: 14,
      padding: "22px 24px",
      border: accent ? "none" : "1px solid #E8E6E1",
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: accent ? "#95D5B2" : "#8A8778", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ? "#fff" : "#1A1A18", fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: accent ? "#B7E4C7" : "#8A8778", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// wrapper for chart sections so they all look consistent
function ChartCard({ title, children }) {
  return (
    <div style={{
      background: "#FAFAF8",
      borderRadius: 14,
      border: "1px solid #E8E6E1",
      padding: "20px 24px",
      flex: 1,
      minWidth: 300,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: "#8A8778", marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

export default function SellerPulse() {
  const [stage, setStage] = useState("upload"); // upload -> analyzing -> briefing
  const [csvText, setCsvText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [briefing, setBriefing] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const briefingRef = useRef(null);

  // handles the CSV file upload
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file);
  };

  const loadSample = () => setCsvText(SAMPLE_CSV);

  // this is the main function - parses data, runs analysis, then calls claude
  const runAnalysis = useCallback(async () => {
    setError("");
    try {
      const data = parseCSV(csvText);
      if (data.length === 0) { setError("No data rows found. Check your CSV format."); return; }
      const stats = analyzeData(data);
      setAnalysis(stats);
      setStage("analyzing");

      // build the prompt for claude
      // I spent a while tuning this to get briefings that actually feel useful
      // and not just generic "your revenue was X" stuff
      const prompt = `You are SellerPulse, an AI business advisor for small business owners who use Square. Analyze this sales data and produce a concise, actionable weekly briefing.

DATA SUMMARY:
- Period: ${stats.numDays} days
- Total Revenue: $${stats.totalRevenue.toLocaleString()}
- Total Cost: $${stats.totalCost.toLocaleString()}
- Gross Margin: ${stats.margin}%
- Average Daily Revenue: $${stats.avgDaily.toLocaleString()}
- Items Sold: ${stats.totalQty} units across ${stats.numItems} products
- Best Day: ${stats.bestDay?.date} ($${stats.bestDay?.revenue})
- Slowest Day: ${stats.worstDay?.date} ($${stats.worstDay?.revenue})

TOP ITEMS BY REVENUE:
${stats.topItems.slice(0, 8).map(i => `- ${i.name}: $${i.revenue} revenue, ${i.qty} units, ${i.margin}% margin`).join("\n")}

CATEGORIES:
${stats.categoryData.map(c => `- ${c.name}: $${c.revenue} revenue, ${c.margin}% margin`).join("\n")}

DAILY REVENUE TREND:
${stats.dailyRevenue.map(d => `- ${d.date}: $${d.revenue}`).join("\n")}

Write the briefing in this EXACT format using markdown:

## Your Week at a Glance
A 2-3 sentence summary of how the week went overall.

## What's Working
3 specific things that are going well, backed by actual numbers from the data.

## Watch List
2-3 items or trends that need attention, with the specific numbers.

## This Week's Action Items
3 concrete things the owner should do THIS week. Be direct. Don't say "consider" or "think about", say "do this because X."

## Growth Opportunity
One bigger idea based on patterns in the data. Be specific and practical.

Keep it conversational. Talk to them like a friend who happens to be really good with numbers. Use the actual data. Keep it under 400 words.`;

      setStreaming(true);
      setBriefing("");

      // call the AI to generate the briefing
      // goes through our serverless function so the API key stays server-side
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      const text = result.content?.map(b => b.text || "").join("") || "Something went wrong generating the briefing.";
      
      // fake the streaming effect because it feels way better than a loading spinner
      // then a wall of text appearing all at once
      let i = 0;
      const interval = setInterval(() => {
        i += Math.floor(Math.random() * 3) + 2;
        if (i >= text.length) {
          setBriefing(text);
          setStreaming(false);
          setStage("briefing");
          clearInterval(interval);
        } else {
          setBriefing(text.slice(0, i));
        }
      }, 12);
    } catch (err) {
      setError("Analysis failed: " + err.message);
      setStreaming(false);
    }
  }, [csvText]);

  // auto-scroll the briefing div as text streams in
  useEffect(() => {
    if (briefingRef.current) {
      briefingRef.current.scrollTop = briefingRef.current.scrollHeight;
    }
  }, [briefing]);

  // quick and dirty markdown renderer
  // only handles the stuff claude actually outputs - h3s, bullets, bold, paragraphs
  // not trying to build a full markdown parser here lol
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) {
        return <h3 key={i} style={{ fontSize: 18, fontWeight: 700, color: "#1A1A18", margin: "24px 0 8px", fontFamily: "'DM Serif Display', Georgia, serif", borderBottom: "1px solid #E8E6E1", paddingBottom: 8 }}>{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const content = line.replace(/^[-*]\s/, "");
        const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
        if (boldMatch) {
          return <div key={i} style={{ padding: "4px 0 4px 16px", fontSize: 14, lineHeight: 1.65, color: "#3A3A35", borderLeft: "2px solid #95D5B2", marginBottom: 4, marginLeft: 4 }}><strong>{boldMatch[1]}</strong>{boldMatch[2]}</div>;
        }
        return <div key={i} style={{ padding: "4px 0 4px 16px", fontSize: 14, lineHeight: 1.65, color: "#3A3A35", borderLeft: "2px solid #95D5B2", marginBottom: 4, marginLeft: 4 }}>{content}</div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
      return <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: "#3A3A35", margin: "4px 0" }}>{line}</p>;
    });
  };

  // ========== UPLOAD SCREEN ==========
  if (stage === "upload") {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F4F0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
          {/* logo + title */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2D6A4F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>S</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#1A1A18", fontFamily: "'DM Serif Display', Georgia, serif" }}>SellerPulse</span>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: "#1A1A18", lineHeight: 1.15, margin: "0 0 12px", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Your AI Business<br />Briefing, Every Week
            </h1>
            <p style={{ fontSize: 16, color: "#6B6960", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              Upload your sales data and get a briefing with real insights and specific next steps. Like having someone who reads your numbers every Monday morning.
            </p>
          </div>

          {/* drag and drop zone */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            border: "2px dashed #D4D1C9",
            padding: 40,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
            marginBottom: 16,
          }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#2D6A4F"; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = "#D4D1C9"; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "#D4D1C9";
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setCsvText(ev.target.result);
                reader.readAsText(file);
              }
            }}
          >
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" style={{ display: "none" }} onChange={handleFile} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1A18", marginBottom: 4 }}>Drop your CSV here or click to upload</div>
            <div style={{ fontSize: 13, color: "#8A8778" }}>Accepts .csv files with columns like date, item, quantity, revenue</div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "#8A8778" }}>or</span>
          </div>

          {/* sample data button */}
          <button onClick={loadSample} style={{
            display: "block", width: "100%", padding: "14px", background: "#fff", border: "1px solid #D4D1C9",
            borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#2D6A4F", cursor: "pointer", marginBottom: 20,
            transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.target.style.background = "#F0FAF4"; e.target.style.borderColor = "#2D6A4F"; }}
            onMouseLeave={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "#D4D1C9"; }}
          >
            Try with sample cafe data
          </button>

          {/* show the raw CSV so they can edit it if needed */}
          {csvText && (
            <div style={{ marginBottom: 20 }}>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                style={{
                  width: "100%", height: 140, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 11,
                  padding: 16, borderRadius: 12, border: "1px solid #D4D1C9", background: "#FAFAF8",
                  color: "#3A3A35", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5,
                }}
              />
              <div style={{ fontSize: 12, color: "#8A8778", marginTop: 4 }}>
                {parseCSV(csvText).length} rows detected
              </div>
            </div>
          )}

          {error && <div style={{ color: "#C1121F", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "#FFF5F5", borderRadius: 8 }}>{error}</div>}

          {/* go button */}
          <button
            onClick={runAnalysis}
            disabled={!csvText.trim()}
            style={{
              display: "block", width: "100%", padding: "16px", background: csvText.trim() ? "#2D6A4F" : "#D4D1C9",
              border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, color: "#fff", cursor: csvText.trim() ? "pointer" : "default",
              transition: "all 0.2s", letterSpacing: 0.3,
            }}
            onMouseEnter={(e) => { if (csvText.trim()) e.target.style.background = "#1B4332"; }}
            onMouseLeave={(e) => { if (csvText.trim()) e.target.style.background = "#2D6A4F"; }}
          >
            Generate My Briefing
          </button>

          {/* how it works section */}
          <div style={{ display: "flex", gap: 24, marginTop: 48, flexWrap: "wrap" }}>
            {[
              { icon: "📤", title: "Upload", desc: "Drop in your Square CSV export or paste sales data" },
              { icon: "🧠", title: "Analyze", desc: "AI finds patterns, trends, and margin opportunities" },
              { icon: "📋", title: "Act", desc: "Get a briefing with specific things to do this week" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 180, textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A18", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#8A8778", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40, fontSize: 12, color: "#B0AD9F" }}>
            Built by Heather Zechter // Square APM Work Sample // 2026
          </div>
        </div>
      </div>
    );
  }

  // ========== RESULTS SCREEN (charts + briefing) ==========
  return (
    <div style={{ minHeight: "100vh", background: "#F5F4F0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2D6A4F", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>S</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", fontFamily: "'DM Serif Display', Georgia, serif" }}>SellerPulse</span>
          </div>
          <button onClick={() => { setStage("upload"); setAnalysis(null); setBriefing(""); setCsvText(""); }}
            style={{ padding: "8px 16px", background: "#fff", border: "1px solid #D4D1C9", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#6B6960", cursor: "pointer" }}>
            New Analysis
          </button>
        </div>

        {/* KPI cards across the top */}
        {analysis && (
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard label="Total Revenue" value={`$${analysis.totalRevenue.toLocaleString()}`} sub={`${analysis.numDays}-day period`} accent />
            <StatCard label="Gross Margin" value={`${analysis.margin}%`} sub={`$${(analysis.totalRevenue - analysis.totalCost).toLocaleString()} profit`} />
            <StatCard label="Avg Daily" value={`$${analysis.avgDaily.toLocaleString()}`} sub={`${analysis.totalQty} units sold`} />
            <StatCard label="Best Day" value={`$${analysis.bestDay?.revenue.toLocaleString()}`} sub={new Date(analysis.bestDay?.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })} />
          </div>
        )}

        {/* charts row */}
        {analysis && (
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <ChartCard title="Daily Revenue Trend">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={analysis.dailyRevenue}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A8778" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8A8778" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v) => [`$${v}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid #E8E6E1", fontSize: 13 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2.5} dot={{ fill: "#2D6A4F", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Revenue by Category">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={analysis.categoryData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {analysis.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `$${v}`} contentStyle={{ borderRadius: 8, border: "1px solid #E8E6E1", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {analysis.categoryData.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#3A3A35", flex: 1 }}>{c.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18" }}>${c.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>
        )}

        {/* horizontal bar chart for top items */}
        {analysis && (
          <div style={{ marginBottom: 24 }}>
            <ChartCard title="Top Items by Revenue">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analysis.topItems.slice(0, 8)} layout="vertical" margin={{ left: 100 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#8A8778" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#3A3A35" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip formatter={(v) => `$${v}`} contentStyle={{ borderRadius: 8, border: "1px solid #E8E6E1", fontSize: 13 }} />
                  <Bar dataKey="revenue" fill="#2D6A4F" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* the AI briefing - this is the main event */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E8E6E1",
          padding: "28px 32px",
          minHeight: 200,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#2D6A4F", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 12 }}>✦</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18" }}>AI Weekly Briefing</span>
            {streaming && <span style={{ fontSize: 12, color: "#2D6A4F", fontWeight: 600, marginLeft: 8 }}>● Generating...</span>}
          </div>

          <div ref={briefingRef} style={{ maxHeight: 500, overflowY: "auto" }}>
            {briefing ? renderMarkdown(briefing) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", border: "3px solid #E8E6E1",
                  borderTopColor: "#2D6A4F", animation: "spin 1s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ fontSize: 14, color: "#8A8778", marginTop: 16 }}>Crunching your numbers...</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "#B0AD9F" }}>
          Built by Heather Zechter // Square APM Work Sample // 2026
        </div>
      </div>
    </div>
  );
}
