import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Cloud,
  Download,
  FileImage,
  FileUp,
  Leaf,
  MapPin,
  Menu,
  Moon,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sun,
  Wheat,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import fieldImage from "@/assets/crop-field-aerial.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { apiBaseUrl, demoMetrics, metricsFromAnalytics, type FarmMetrics } from "@/lib/agriculture";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fieldwatch | Crop stress early warning" },
      {
        name: "description",
        content: "Monitor crop health, inspect field imagery, and plan timely agronomist interventions.",
      },
      { property: "og:title", content: "Fieldwatch | Crop stress early warning" },
      {
        property: "og:description",
        content: "Agricultural monitoring and early crop-stress insights for field teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const fields = [
  { name: "North Ridge Demo Farm", location: "Nashik, Maharashtra", crop: "Grapes" },
  { name: "Riverbend Demo Fields", location: "Pune, Maharashtra", crop: "Sugarcane" },
  { name: "Sunrise Demo Estate", location: "Sangli, Maharashtra", crop: "Pomegranate" },
];

const ndviData = [
  { day: "Oct 04", ndvi: 0.46 },
  { day: "Oct 08", ndvi: 0.51 },
  { day: "Oct 12", ndvi: 0.49 },
  { day: "Oct 16", ndvi: 0.56 },
  { day: "Oct 20", ndvi: 0.59 },
  { day: "Oct 24", ndvi: 0.54 },
  { day: "Oct 28", ndvi: 0.62 },
];

const initialFiles = { rgb: null, nir: null } as Record<"rgb" | "nir", File | null>;

function Dashboard() {
  const [farmIndex, setFarmIndex] = useState(0);
  const [clock, setClock] = useState<Date | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [health, setHealth] = useState<"checking" | "online" | "offline">("checking");
  const [metrics, setMetrics] = useState<FarmMetrics>(demoMetrics);
  const [rgbFile, setRgbFile] = useState<File | null>(initialFiles.rgb);
  const [nirFile, setNirFile] = useState<File | null>(initialFiles.nir);
  const [threshold, setThreshold] = useState([62]);
  const [opacity, setOpacity] = useState([58]);
  const [comparison, setComparison] = useState([53]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("Latest field scan · Oct 28, 2026");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const farm = fields[farmIndex] ?? {
    name: "North Ridge Demo Farm",
    location: "Nashik, Maharashtra",
    crop: "Grapes",
  };

  useEffect(() => {
    const updateClock = () => setClock(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => document.documentElement.classList.remove("dark");
  }, [isDark]);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl()}/health`);
      setHealth(response.ok ? "online" : "offline");
    } catch {
      setHealth("offline");
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    const timer = window.setInterval(() => void refreshStatus(), 60_000);
    return () => window.clearInterval(timer);
  }, [refreshStatus]);

  useEffect(() => {
    let active = true;
    fetch(`${apiBaseUrl()}/analytics`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!active) return;
        const nextMetrics = metricsFromAnalytics(payload);
        if (nextMetrics) setMetrics(nextMetrics);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [farmIndex]);

  const onDrop = (kind: "rgb" | "nir") => (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (file) setFile(kind, file);
  };

  const setFile = (kind: "rgb" | "nir", file: File | null) => {
    if (kind === "rgb") setRgbFile(file);
    else setNirFile(file);
    if (file) setAnalysisMessage(`${kind === "rgb" ? "Aerial RGB" : "NIR"} image ready · ${file.name}`);
  };

  const runAnalysis = async () => {
    if (!rgbFile || !nirFile) {
      setAnalysisMessage("Add both aerial RGB and NIR images to run an analysis.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisMessage("Comparing imagery against the selected detection threshold…");
    const body = new FormData();
    body.append("rgb_image", rgbFile);
    body.append("nir_image", nirFile);
    body.append("threshold", String(threshold[0] ?? 62));
    try {
      const response = await fetch(`${apiBaseUrl()}/predict`, { method: "POST", body });
      if (!response.ok) throw new Error("The analysis service did not accept these images.");
      const result = (await response.json()) as { message?: string };
      setAnalysisMessage(result.message || "Analysis complete · review the updated field insights.");
      await refreshStatus();
    } catch {
      setAnalysisMessage("Could not reach the analysis service. Check that it is running and accepts image uploads.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveReport = () => window.print();

  const formatTime = clock
    ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(clock)
    : "--:--";
  const formatDate = clock
    ? new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(clock)
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className={`dashboard-sidebar ${mobileNavOpen ? "dashboard-sidebar-open" : ""}`}>
          <a className="brand-lockup" href="#overview" onClick={() => setMobileNavOpen(false)}>
            <span className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></span>
            <span className="brand-name">fieldwatch<span>®</span></span>
          </a>
          <div className="farm-switcher-wrap">
            <label className="field-label" htmlFor="farm-select">YOUR FARM</label>
            <div className="farm-select-wrap">
              <Wheat size={16} aria-hidden="true" />
              <select id="farm-select" value={farmIndex} onChange={(event) => setFarmIndex(Number(event.target.value))}>
                {fields.map((option, index) => <option key={option.name} value={index}>{option.name}</option>)}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
            <p className="farm-location"><MapPin size={13} />{farm.location}</p>
          </div>

          <div className="nav-label">WORKSPACE</div>
          <nav className="main-nav" aria-label="Main navigation">
            <a className="nav-link nav-link-active" href="#overview" onClick={() => setMobileNavOpen(false)}><Activity size={17} />Overview</a>
            <a className="nav-link" href="#imagery" onClick={() => setMobileNavOpen(false)}><ScanLine size={17} />Field analysis</a>
            <a className="nav-link" href="#health" onClick={() => setMobileNavOpen(false)}><Leaf size={17} />Crop health</a>
            <a className="nav-link" href="#advisory" onClick={() => setMobileNavOpen(false)}><CalendarDays size={17} />Advisories<span className="nav-count">3</span></a>
          </nav>

          <div className="sidebar-bottom">
            <div className="season-note">
              <span className="season-icon"><Sun size={16} /></span>
              <div><strong>Kharif season</strong><span>Week 32 · Active</span></div>
              <span className="season-dot" />
            </div>
            <Button variant="ghost" className="sidebar-settings" type="button" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
              {isDark ? "Light appearance" : "Dark appearance"}
            </Button>
            <div className="team-profile">
              <div className="profile-avatar">FO</div>
              <div className="profile-copy"><strong>Field officer</strong><span>Farm team</span></div>
              <Settings2 size={17} className="profile-settings" />
            </div>
          </div>
        </aside>

        {mobileNavOpen && <button className="nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

        <main id="overview" className="dashboard-main">
          <header className="topbar">
            <div className="topbar-left">
              <Button variant="ghost" size="icon" className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu /></Button>
              <span className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></span>
            </div>
            <div className="topbar-right">
              <div className="live-time"><span>{formatDate}</span><strong>{formatTime}</strong></div>
              <span className={`service-status service-${health}`}><span className="status-dot" />{health === "checking" ? "Connecting" : health === "online" ? "Systems live" : "Demo mode"}</span>
              <Button variant="outline" size="sm" className="export-top" onClick={saveReport}><Download size={15} />Export report</Button>
            </div>
          </header>

          <div className="dashboard-content">
            <section className="welcome-row">
              <div>
                <p className="eyebrow"><span className="eyebrow-line" />CROP INTELLIGENCE <span className="eyebrow-date">· {formatDate || "Field monitoring"}</span></p>
                <h1>Good morning <span className="wave">✳</span></h1>
                <p className="welcome-subtitle">Your crops are looking steady. Here’s the latest from <strong>{farm.name}</strong>.</p>
              </div>
              <div className="field-condition"><span className="condition-icon"><ShieldCheck size={17} /></span><span><strong>Field conditions</strong><small>Monitoring normally</small></span></div>
            </section>

            <section className="kpi-grid" aria-label="Farm monitoring overview">
              <MetricCard icon={<ScanLine size={18} />} iconTone="green" label="Fields monitored" value={metrics.fieldsMonitored.toLocaleString()} unit="fields" trend="2 added this week" trendUp />
              <MetricCard icon={<AlertTriangle size={18} />} iconTone="red" label="Critical stress alerts" value={metrics.criticalAlerts.toLocaleString()} unit="need review" trend="1 new since yesterday" />
              <MetricCard icon={<Wheat size={18} />} iconTone="gold" label="Nitrogen deficiency index" value={metrics.nitrogenIndex.toFixed(1)} unit="index" trend="−2.3% across your fields" trendUp />
              <MetricCard icon={<Activity size={18} />} iconTone="blue" label="Model confidence score" value={metrics.modelConfidence.toFixed(1)} unit="%" trend="High confidence · last scan" trendUp />
            </section>
            <p className="demo-notice"><span className="demo-mark">i</span>Sample metrics and recommendations are illustrative. Live farm data appears when your monitoring service is connected.</p>

            <section id="imagery" className="analysis-section">
              <div className="section-heading">
                <div><p className="eyebrow section-eyebrow">FIELD INSPECTION</p><h2>See what your crops are telling you</h2><p className="section-subtitle">Compare aerial imagery with AI-detected areas of crop stress.</p></div>
                <span className="scan-timestamp"><span className="status-dot" />{analysisMessage}</span>
              </div>

              <div className="analysis-grid">
                <div className="imagery-panel">
                  <div className="panel-topline"><div className="panel-title"><div className="section-icon"><ScanLine size={17} /></div><div><h3>Field image comparison</h3><p>Block A · 12.8 hectares · {farm.crop}</p></div></div><Badge variant="outline" className="scan-badge"><span className="mini-dot" />Sample scan</Badge></div>
                  <div className="comparison-frame" style={{ "--wipe": `${comparison[0] ?? 53}%` } as CSSProperties}>
                    <img src={fieldImage} alt="Aerial view of crop rows at North Ridge Farm" width={1536} height={1024} />
                    <div className="comparison-right"><img src={fieldImage} alt="Aerial crop view with AI crop stress heatmap overlay" width={1536} height={1024} /><div className="stress-mask comparison-mask" style={{ opacity: (opacity[0] ?? 58) / 100 }}><div className="stress-patch stress-patch-one" /><div className="stress-patch stress-patch-two" /><div className="stress-patch stress-patch-three" /></div></div>
                    <div className="comparison-divider" />
                    <div className="image-label image-label-left">AERIAL RGB</div><div className="image-label image-label-right">STRESS DETECTION</div>
                    <div className="image-coordinates"><MapPin size={12} />20.005° N&nbsp; 73.789° E</div>
                    <div className="comparison-control" aria-hidden="true"><span>↔</span></div>
                    <input className="comparison-range" aria-label="Adjust before and after comparison" type="range" min="0" max="100" value={comparison[0]} onChange={(event) => setComparison([Number(event.target.value)])} />
                  </div>
                  <div className="image-caption"><div><span className="caption-indicator" />Illustrative stress overlay <strong>3 sample zones</strong></div><span>Sample aerial imagery</span></div>
                  <div className="imagery-tools">
                    <div className="slider-control"><div><span>Detection threshold</span><strong>{threshold[0]}%</strong></div><Slider aria-label="Detection threshold" min={20} max={90} step={1} value={threshold} onValueChange={setThreshold} /></div>
                    <div className="slider-control"><div><span>Mask opacity</span><strong>{opacity[0]}%</strong></div><Slider aria-label="Overlay mask opacity" min={10} max={100} step={1} value={opacity} onValueChange={setOpacity} /></div>
                  </div>
                </div>

                <div className="upload-panel">
                  <div className="panel-topline"><div className="panel-title"><div className="section-icon upload-icon"><FileImage size={17} /></div><div><h3>Run a field analysis</h3><p>Upload recent imagery to check for stress.</p></div></div><CircleHelp size={17} className="help-icon" aria-label="Upload both RGB and NIR images" /></div>
                  <div className="upload-dropzones">
                    <UploadZone kind="rgb" label="Aerial RGB" description="Standard drone image" file={rgbFile} onFile={(file) => setFile("rgb", file)} onDrop={onDrop("rgb")} />
                    <UploadZone kind="nir" label="NIR imagery" description="Near-infrared image" file={nirFile} onFile={(file) => setFile("nir", file)} onDrop={onDrop("nir")} />
                  </div>
                  <div className="upload-note"><Cloud size={15} />Images stay with your field analysis</div>
                  <Button className="analyze-button" onClick={runAnalysis} disabled={isAnalyzing}>{isAnalyzing ? <RefreshCw size={16} className="animate-spin" /> : <ScanLine size={16} />}{isAnalyzing ? "Analyzing field" : "Analyze this field"}</Button>
                  <p className="upload-caption">Both image types are needed for a crop health estimate.</p>
                  <div className="recent-scan"><div className="recent-scan-icon"><Check size={15} /></div><div><strong>Example scan</strong><span>Sample imagery · North Ridge</span></div><ArrowUpRight size={15} className="recent-arrow" /></div>
                </div>
              </div>
            </section>

            <section id="health" className="insights-section">
              <div className="section-heading compact-heading"><div><p className="eyebrow section-eyebrow">SPECTRAL &amp; HEALTH INSIGHTS</p><h2>A clearer picture of field health</h2></div><Button variant="outline" size="sm" onClick={() => void refreshStatus()}><RefreshCw size={14} />Refresh data</Button></div>
              <div className="insights-grid">
                <div className="insight-panel ndvi-panel"><div className="insight-header"><div><h3>NDVI trend</h3><p>Normalized Difference Vegetation Index</p></div><div className="ndvi-stat"><strong>0.62</strong><span><ArrowUpRight size={13} /> +0.08 this month</span></div></div><div className="chart-legend"><span /><span>Average NDVI</span><small>Healthy range &gt; 0.60</small></div><div className="ndvi-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={ndviData} margin={{ top: 14, right: 4, bottom: 0, left: -25 }}><defs><linearGradient id="ndviFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 5" /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} dy={8} /><YAxis domain={[0.3, 0.8]} ticks={[0.4, 0.5, 0.6, 0.7]} tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} /><Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, color: "var(--color-foreground)", fontSize: 12 }} /><Area type="monotone" dataKey="ndvi" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#ndviFill)" activeDot={{ r: 4, strokeWidth: 0, fill: "var(--color-primary)" }} /></AreaChart></ResponsiveContainer></div><div className="chart-footer"><span><span className="chart-dot" />North Ridge average</span><span>Last 28 days</span></div></div>

                <div className="insight-panel severity-panel"><div className="insight-header"><div><h3>Field severity</h3><p>Distribution across monitored area</p></div><Button variant="ghost" size="icon" className="icon-only-button" title="Refresh severity data" onClick={() => void refreshStatus()}><RefreshCw size={15} /></Button></div><div className="severity-body"><div className="severity-ring"><svg viewBox="0 0 144 144" role="img" aria-label="Severity: 71% healthy, 21% mild stress, 8% critical"><circle className="ring-track" cx="72" cy="72" r="54" /><circle className="ring-healthy" cx="72" cy="72" r="54" /><circle className="ring-mild" cx="72" cy="72" r="54" /><circle className="ring-critical" cx="72" cy="72" r="54" /></svg><div className="ring-center"><strong>71<span>%</span></strong><small>Healthy</small></div></div><div className="severity-legend"><div><i className="severity-dot healthy-dot" /><span>Healthy</span><strong>71%</strong></div><div><i className="severity-dot mild-dot" /><span>Mild stress</span><strong>21%</strong></div><div><i className="severity-dot critical-dot" /><span>Critical</span><strong>8%</strong></div><p>Based on <strong>24 fields</strong> · 12.8 ha</p></div></div><div className="severity-note"><span className="note-check"><Check size={13} /></span>Most of your monitored area is in good health.</div></div>
              </div>
            </section>

            <section id="advisory" className="advisory-section">
              <div className="section-heading compact-heading"><div><p className="eyebrow section-eyebrow">YOUR NEXT STEPS</p><h2>Agronomist recommendations</h2></div><Badge variant="secondary" className="advisory-count">3 actions suggested</Badge></div>
              <div className="advisory-grid">
                <div className="advisory-main"><div className="advisory-alert"><div className="alert-symbol"><AlertTriangle size={17} /></div><div><strong>Example: nitrogen stress in Block A</strong><p>Three illustrative zones show possible deficiency; verify with a field inspection.</p></div><Badge variant="outline" className="priority-badge">SAMPLE</Badge></div>
                  <ol className="recommendation-list"><li><span className="step-number">01</span><div><strong>Review nitrogen treatment options</strong><p>Discuss a suitable fertilizer and application rate with your local agronomist before treating.</p><span className="recommendation-meta"><Wheat size={13} />Example fertilizer guidance <span>·</span> Confirm for your crop</span></div></li><li><span className="step-number">02</span><div><strong>Inspect three example zones</strong><p>Use the eastern edge and center irrigation line as sample points for an on-ground check.</p><span className="recommendation-meta"><MapPin size={13} />20.005° N, 73.789° E <span>·</span> Example location</span></div></li><li><span className="step-number">03</span><div><strong>Plan a follow-up scan</strong><p>Recheck after your field inspection and any agronomist-approved treatment.</p><span className="recommendation-meta"><CalendarDays size={13} />Suggested interval <strong>7 days</strong></span></div></li></ol>
                  <div className="advisory-footer"><span><ShieldCheck size={15} />Example guidance only · confirm crop treatment with a local agronomist.</span><Button variant="outline" size="sm" onClick={saveReport}><Download size={15} />Export PDF report</Button></div>
                </div>
                <aside className="field-note-panel"><div className="field-note-head"><div className="section-icon note-icon"><Leaf size={16} /></div><span>FIELD NOTE</span><span className="note-date">EXAMPLE</span></div><p>Check irrigation near the center access lane during your next field visit.</p><div className="note-author"><div className="profile-avatar small-avatar">FT</div><span><strong>Farm team</strong><small>Example field note</small></span><ArrowDownRight size={16} /></div><div className="weather-strip"><Sun size={17} /><span><strong>Local conditions</strong><small>Check before scheduling fieldwork</small></span></div></aside>
              </div>
            </section>
            <footer className="dashboard-footer"><span>Fieldwatch <span>·</span> Crop intelligence for every field</span><span>Illustrative dashboard content · Confirm all treatment advice and field conditions locally.</span></footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ icon, iconTone, label, value, unit, trend, trendUp }: { icon: ReactNode; iconTone: string; label: string; value: string; unit: string; trend: string; trendUp?: boolean }) {
  return <div className="metric-card"><div className={`metric-icon metric-${iconTone}`}>{icon}</div><div className="metric-label">{label}</div><div className="metric-value-row"><strong>{value}</strong><span>{unit}</span></div><div className={`metric-trend ${trendUp ? "trend-positive" : "trend-attention"}`}>{trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend}</div></div>;
}

function UploadZone({ kind, label, description, file, onFile, onDrop }: { kind: "rgb" | "nir"; label: string; description: string; file: File | null; onFile: (file: File | null) => void; onDrop: (event: DragEvent<HTMLLabelElement>) => void }) {
  const inputId = `${kind}-image-upload`;
  return <div className={`upload-zone ${file ? "upload-zone-filled" : ""}`}>
    <label htmlFor={inputId} className="upload-zone-label" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <input id={inputId} type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.item(0) ?? null)} />
      {file ? <><div className="upload-file-icon"><Check size={16} /></div><strong>{label}</strong><span className="upload-file-name">{file.name}</span></> : <><div className="upload-zone-icon"><FileUp size={18} /></div><strong>{label}</strong><span>{description}</span><em>Choose file or drop here</em></>}
    </label>
    {file && <Button type="button" variant="ghost" size="icon" className="remove-upload" aria-label={`Remove ${label} image`} onClick={() => onFile(null)}><X size={14} /></Button>}
  </div>;
}