import { useState, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#0C0F1A",
  surface:  "#111827",
  card:     "#161D2E",
  border:   "#1F2A3D",
  borderHi: "#2D3F5C",
  gold:     "#C9A84C",
  goldDim:  "#7A6130",
  blue:     "#3B6FD4",
  blueDim:  "#1E3A6E",
  blueHi:   "#5A8FEE",
  text:     "#E8EDF5",
  textMid:  "#8A96AA",
  textDim:  "#4A5568",
  red:      "#E05252",
  redDim:   "#5C1F1F",
  orange:   "#D97B3A",
  green:    "#3DAD7A",
  greenDim: "#1A4A35",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
`;

// ─── ROLE DEFINITIONS ──────────────────────────────────────────────────────────
const ROLES = {
  Investigator: {
    color: C.blue,
    platforms: ["Web", "Desktop", "Mobile"],
    modules: ["dashboard","cases","evidence","osint","network","crypto","audit"],
    mobileModules: ["cases","evidence","audit"],
    description: "Initiate & manage cases, collect evidence, OSINT & network analysis",
  },
  "Financial Analyst": {
    color: C.gold,
    platforms: ["Web", "Desktop"],
    modules: ["dashboard","financial","audit"],
    description: "Transaction analysis, pattern identification, analytical support",
  },
  Prosecutor: {
    color: "#A78BFA",
    platforms: ["Web", "Desktop"],
    modules: ["dashboard","cases","evidence","audit"],
    description: "Review case files, evidentiary completeness, court preparation",
  },
  Supervisor: {
    color: C.orange,
    platforms: ["Web", "Desktop"],
    modules: ["dashboard","cases","financial","audit","integrations"],
    description: "Oversee workloads, approve actions and referrals",
  },
  "System Admin": {
    color: C.green,
    platforms: ["Web", "Desktop"],
    modules: ["dashboard","cases","financial","evidence","osint","network","crypto","audit","admin","integrations"],
    description: "Manage users, roles and system configurations",
  },
};

const USERS = [
  { id:1, name:"Amina Hassan",   initials:"AH", role:"Investigator",      unit:"Financial Crimes Unit" },
  { id:2, name:"David Kimani",   initials:"DK", role:"Financial Analyst", unit:"FIU Analysis Division" },
  { id:3, name:"Sarah Mensah",   initials:"SM", role:"Prosecutor",        unit:"Economic Crimes Prosecution" },
  { id:4, name:"Omar Farah",     initials:"OF", role:"Supervisor",        unit:"Case Oversight & Management" },
  { id:5, name:"Liu Chen",       initials:"LC", role:"System Admin",      unit:"IT Security & Infrastructure" },
];

const ALL_MODULES = [
  { id:"dashboard",    label:"Dashboard",       icon:"▦" },
  { id:"cases",        label:"Cases",           icon:"◫" },
  { id:"financial",    label:"Financial",       icon:"◈" },
  { id:"evidence",     label:"Evidence",        icon:"◉" },
  { id:"osint",        label:"OSINT",           icon:"◎" },
  { id:"network",      label:"Network",         icon:"⬡" },
  { id:"crypto",       label:"Crypto",          icon:"◆" },
  { id:"audit",        label:"Audit Log",       icon:"≡" },
  { id:"admin",        label:"Admin",           icon:"⊕" },
  { id:"integrations", label:"Integrations",    icon:"⊞" },
];

// ─── SAMPLE DATA ───────────────────────────────────────────────────────────────
const CASES_DATA = [
  { id:"ECS-2024-0047", title:"Operation Phantom Shell",    type:"Money Laundering", stage:"Investigation",          risk:"Critical", entities:12, txns:847,  assignee:"Amina Hassan",  opened:"2024-01-15", lastUpdate:"2h ago" },
  { id:"ECS-2024-0051", title:"Sunrise Import Fraud",       type:"Trade Fraud",      stage:"Analysis",               risk:"High",     entities:6,  txns:234,  assignee:"David Kimani",  opened:"2024-01-18", lastUpdate:"5h ago" },
  { id:"ECS-2024-0039", title:"Meridian Bank SAR",          type:"AML",              stage:"Prosecution Referral",   risk:"High",     entities:4,  txns:512,  assignee:"Sarah Mensah",  opened:"2024-01-10", lastUpdate:"1d ago" },
  { id:"ECS-2024-0063", title:"CryptoSwap Exchange Ring",   type:"Crypto Crime",     stage:"Intake",                 risk:"Medium",   entities:8,  txns:1203, assignee:"Amina Hassan",  opened:"2024-01-22", lastUpdate:"3h ago" },
  { id:"ECS-2024-0071", title:"Gov Procurement Kickback",   type:"Corruption",       stage:"Preliminary Assessment", risk:"Critical", entities:15, txns:98,   assignee:"Omar Farah",    opened:"2024-01-25", lastUpdate:"30m ago" },
];

const TXN_DATA = [
  { id:"TXN-8821", from:"Phoenix Trading LLC",  to:"Stellar Holdings",       amount:245000, currency:"USD", date:"2024-01-14", flag:"Structuring", risk:92, case:"ECS-2024-0047" },
  { id:"TXN-8822", from:"Stellar Holdings",     to:"BVI Account 4421",       amount:240000, currency:"USD", date:"2024-01-14", flag:"Layering",     risk:88, case:"ECS-2024-0047" },
  { id:"TXN-8823", from:"Oceanic Imports",      to:"Phoenix Trading LLC",    amount:18500,  currency:"USD", date:"2024-01-13", flag:null,            risk:23, case:"ECS-2024-0047" },
  { id:"TXN-8824", from:"BVI Account 4421",     to:"Nakamura Real Estate",   amount:230000, currency:"USD", date:"2024-01-15", flag:"Integration",  risk:95, case:"ECS-2024-0047" },
  { id:"TXN-8825", from:"Meridian Bank Wire",   to:"Phoenix Trading LLC",    amount:9800,   currency:"USD", date:"2024-01-12", flag:"Structuring",  risk:76, case:"ECS-2024-0047" },
  { id:"TXN-8826", from:"J. Okafor Personal",   to:"Phoenix Trading LLC",    amount:4900,   currency:"USD", date:"2024-01-11", flag:"Structuring",  risk:71, case:"ECS-2024-0047" },
];

const EVIDENCE_DATA = [
  { id:"EV-0041", name:"meridian_bank_stmt_jan24.pdf",  type:"PDF",   size:"2.4 MB", sha256:"a3f8c1d2e9b4...", uploaded:"2024-01-20 08:33", by:"Amina Hassan", locked:true,  coc:3 },
  { id:"EV-0042", name:"company_registry_extract.png",  type:"Image", size:"0.8 MB", sha256:"b7e2d4f1a6c8...", uploaded:"2024-01-21 14:05", by:"David Kimani", locked:false, coc:1 },
  { id:"EV-0043", name:"transaction_export_q4.xlsx",    type:"Excel", size:"1.1 MB", sha256:"f2a9b8c3d5e7...", uploaded:"2024-01-22 09:17", by:"Amina Hassan", locked:true,  coc:4 },
  { id:"EV-0044", name:"osint_capture_linkedin.pdf",    type:"PDF",   size:"0.3 MB", sha256:"e6c4a1f8b2d9...", uploaded:"2024-01-23 11:44", by:"Amina Hassan", locked:false, coc:1 },
];

const NETWORK_NODES = [
  { id:"n1", label:"Phoenix Trading LLC",  type:"company", x:300, y:190, risk:"high" },
  { id:"n2", label:"Stellar Holdings",     type:"company", x:500, y:120, risk:"high" },
  { id:"n3", label:"BVI Account 4421",     type:"account", x:650, y:240, risk:"critical" },
  { id:"n4", label:"Nakamura Real Estate", type:"company", x:540, y:360, risk:"medium" },
  { id:"n5", label:"James Okafor",         type:"person",  x:170, y:120, risk:"high" },
  { id:"n6", label:"Oceanic Imports",      type:"company", x:130, y:280, risk:"low" },
  { id:"n7", label:"0x4f2...a81c",         type:"wallet",  x:730, y:150, risk:"critical" },
];

const NETWORK_EDGES = [
  { from:"n1", to:"n2", label:"$245K",    type:"transaction" },
  { from:"n2", to:"n3", label:"$240K",    type:"transaction" },
  { from:"n3", to:"n4", label:"$230K",    type:"transaction" },
  { from:"n5", to:"n1", label:"Director", type:"ownership" },
  { from:"n6", to:"n1", label:"$18.5K",   type:"transaction" },
  { from:"n3", to:"n7", label:"0.8 BTC",  type:"crypto" },
];

const AUDIT_DATA = [
  { time:"09:42", user:"Amina Hassan",  role:"Investigator",      action:"Uploaded evidence: meridian_bank_stmt_jan24.pdf (SHA-256 verified)", case:"ECS-2024-0047", type:"upload" },
  { time:"09:31", user:"David Kimani",  role:"Financial Analyst", action:"Flagged TXN-8824 as Integration pattern — risk score: 95",           case:"ECS-2024-0047", type:"flag" },
  { time:"08:55", user:"Omar Farah",    role:"Supervisor",        action:"Approved case advancement: Intake → Preliminary Assessment",          case:"ECS-2024-0051", type:"approve" },
  { time:"08:20", user:"Amina Hassan",  role:"Investigator",      action:"Added OSINT capture: Company registration extract, OpenCorporates",   case:"ECS-2024-0047", type:"osint" },
  { time:"07:50", user:"Sarah Mensah",  role:"Prosecutor",        action:"Reviewed prosecution readiness — 3 evidence gaps flagged",            case:"ECS-2024-0039", type:"review" },
  { time:"Yesterday", user:"Liu Chen", role:"System Admin",       action:"User role updated: David Kimani promoted to Senior Analyst",          case:"SYSTEM",        type:"admin" },
];

const STAGES = ["Intake","Preliminary Assessment","Investigation","Analysis","Prosecution Referral","Court Tracking","Closure"];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const riskMeta = (r) => {
  const map = { Critical:{ color:C.red, bg:C.redDim }, High:{ color:C.orange, bg:"#4A2A10" }, Medium:{ color:"#D4C14A", bg:"#3A3510" }, Low:{ color:C.green, bg:C.greenDim } };
  if (typeof r === "number") {
    if (r>=85) return map.Critical; if (r>=65) return map.High; if (r>=40) return map.Medium; return map.Low;
  }
  return map[r] || map.Low;
};

const nodeStyle = (type) => ({ company:"#5A8FEE", person:"#A78BFA", account:C.gold, wallet:C.green, device:C.orange }[type] || C.textMid);

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize:11, fontWeight:500, padding:"2px 10px", borderRadius:20, background:bg||"#1F2A3D", color:color||C.textMid, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>{label}</span>
);

const Btn = ({ children, onClick, variant="primary", size="md", disabled }) => {
  const base = { fontFamily:"inherit", fontWeight:500, cursor:disabled?"not-allowed":"pointer", border:"none", borderRadius:6, letterSpacing:"0.02em", transition:"all 0.15s", opacity:disabled?0.5:1 };
  const variants = {
    primary: { background:C.blue, color:"#fff", padding: size==="sm"?"5px 14px":"8px 20px", fontSize: size==="sm"?12:13 },
    secondary: { background:C.card, color:C.textMid, border:`1px solid ${C.border}`, padding: size==="sm"?"4px 12px":"7px 18px", fontSize: size==="sm"?12:13 },
    ghost: { background:"transparent", color:C.textMid, border:`1px solid ${C.border}`, padding: size==="sm"?"4px 12px":"7px 18px", fontSize: size==="sm"?12:13 },
    danger: { background:C.redDim, color:C.red, border:`1px solid ${C.red}44`, padding: size==="sm"?"4px 12px":"7px 18px", fontSize: size==="sm"?12:13 },
    gold: { background:"#2A2010", color:C.gold, border:`1px solid ${C.goldDim}`, padding: size==="sm"?"4px 12px":"7px 18px", fontSize: size==="sm"?12:13 },
  };
  return <button style={{...base,...variants[variant]}} onClick={onClick}>{children}</button>;
};

const Card = ({ children, style }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, ...style }}>{children}</div>
);

const SectionHeader = ({ label, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderBottom:`1px solid ${C.border}` }}>
    <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", color:C.textMid, textTransform:"uppercase" }}>{label}</span>
    {action}
  </div>
);

const Input = ({ placeholder, value, onChange, style }) => (
  <input placeholder={placeholder} value={value} onChange={onChange}
    style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 14px", color:C.text, fontFamily:"inherit", fontSize:13, outline:"none", ...style }}
  />
);

const RiskBar = ({ score, width=60 }) => {
  const m = riskMeta(score);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width, height:4, background:C.surface, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${score}%`, background:m.color, borderRadius:2 }} />
      </div>
      <span style={{ fontSize:12, fontWeight:600, color:m.color, minWidth:24 }}>{score}</span>
    </div>
  );
};

// ─── TOAST ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, visible }) => (
  <div style={{
    position:"fixed", bottom:24, right:24, zIndex:9999,
    background:C.card, border:`1px solid ${C.borderHi}`,
    borderLeft:`3px solid ${C.gold}`,
    borderRadius:8, padding:"12px 20px",
    fontSize:13, color:C.text,
    boxShadow:"0 8px 30px rgba(0,0,0,0.4)",
    transition:"all 0.25s",
    opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(10px)",
    pointerEvents:"none", maxWidth:360,
  }}>{msg}</div>
);

// ─── STAGE PROGRESS ────────────────────────────────────────────────────────────
const StagePipeline = ({ stage }) => {
  const idx = STAGES.indexOf(stage);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto", padding:"12px 20px", borderBottom:`1px solid ${C.border}` }}>
      {STAGES.map((s, i) => {
        const done = i < idx, current = i === idx;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
            <div style={{
              padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:current?600:400,
              background: current?C.blue : done?"#1A2A40":"transparent",
              color: current?"#fff" : done?C.blueHi : C.textDim,
              border: current?`1px solid ${C.blue}` : done?`1px solid ${C.blueDim}`:`1px solid ${C.border}`,
              transition:"all 0.2s",
            }}>{s}</div>
            {i < STAGES.length-1 && <div style={{ width:20, height:1, background:i<idx?C.blueDim:C.border, flexShrink:0 }} />}
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, cases, txns, log, onCaseClick }) {
  const role = user.role;
  const roleColor = ROLES[role]?.color || C.blue;

  const stats = role === "Financial Analyst"
    ? [{ l:"Flagged Transactions", v:41, d:"+8", c:C.red }, { l:"Alerts Today", v:12, d:"+3", c:C.orange }, { l:"Analysed Cases", v:6, d:"+1", c:C.blue }, { l:"Avg Risk Score", v:74, d:"+4", c:C.gold }]
    : role === "Prosecutor"
    ? [{ l:"Cases Under Review", v:8, d:"+2", c:C.blue }, { l:"Prosecution Ready", v:3, d:"+1", c:C.green }, { l:"Evidence Gaps", v:5, d:"-1", c:C.red }, { l:"Court Scheduled", v:2, d:"—", c:C.gold }]
    : role === "Supervisor"
    ? [{ l:"Active Cases", v:23, d:"+3", c:C.blue }, { l:"Pending Approvals", v:5, d:"+2", c:C.orange }, { l:"Critical Risk", v:2, d:"+1", c:C.red }, { l:"Team Members", v:14, d:"—", c:C.green }]
    : [{ l:"Active Cases", v:23, d:"+3", c:C.blue }, { l:"Critical Risk", v:2, d:"+1", c:C.red }, { l:"Flagged TXNs", v:41, d:"+8", c:C.orange }, { l:"Pending Review", v:7, d:"-2", c:C.green }];

  return (
    <div style={{ padding:28, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:6, textTransform:"uppercase" }}>Welcome back</div>
        <h1 style={{ margin:0, fontSize:26, fontFamily:"'Playfair Display', serif", fontWeight:600, color:C.text }}>
          {user.name.split(" ")[0]}'s Overview
        </h1>
        <div style={{ marginTop:6, fontSize:13, color:C.textMid }}>
          <span style={{ color:roleColor, fontWeight:500 }}>{role}</span>
          <span style={{ color:C.textDim }}> · {user.unit} · </span>
          <span style={{ color:C.textDim }}>Friday, 25 January 2024</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {stats.map(s => (
          <Card key={s.l} style={{ padding:"18px 20px", borderTop:`2px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.06em", marginBottom:10, textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
              <span style={{ fontSize:32, fontWeight:600, color:C.text, fontFamily:"'Playfair Display', serif" }}>{s.v}</span>
              <span style={{ fontSize:12, color:s.d.startsWith("+")?C.red:C.green }}>{s.d}</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18 }}>
        {/* Recent Cases */}
        <Card>
          <SectionHeader label="Recent Cases" action={<Badge label="View All" color={C.blueHi} bg={C.blueDim} />} />
          {cases.slice(0,4).map(c => {
            const rm = riskMeta(c.risk);
            const stageIdx = STAGES.indexOf(c.stage);
            return (
              <div key={c.id} onClick={() => onCaseClick(c)}
                style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, cursor:"pointer", display:"flex", gap:14, alignItems:"center", transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{ width:3, height:40, borderRadius:2, background:rm.color, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
                  <div style={{ fontSize:11, color:C.textDim, marginTop:3 }}>{c.id} · {c.type}</div>
                  <div style={{ marginTop:6, height:2, background:C.border, borderRadius:1 }}>
                    <div style={{ height:"100%", width:`${((stageIdx+1)/STAGES.length)*100}%`, background:C.blue, borderRadius:1 }} />
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <Badge label={c.risk} color={rm.color} bg={rm.bg} />
                  <div style={{ fontSize:11, color:C.textDim, marginTop:4 }}>{c.lastUpdate}</div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Activity Feed */}
        <Card>
          <SectionHeader label="Activity Feed" />
          {log.slice(0,5).map((l,i) => {
            const typeColor = { upload:C.blue, flag:C.red, approve:C.green, osint:C.gold, review:"#A78BFA", admin:C.textMid }[l.type] || C.textMid;
            return (
              <div key={i} style={{ padding:"11px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:12 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:typeColor, marginTop:5, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:12, color:C.blueHi, fontWeight:500 }}>{l.user} <span style={{ color:C.textDim, fontWeight:400 }}>· {l.role}</span></div>
                  <div style={{ fontSize:12, color:C.textMid, marginTop:2, lineHeight:1.4 }}>{l.action}</div>
                  <div style={{ fontSize:11, color:C.textDim, marginTop:3 }}>{l.time} · {l.case}</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Flagged TXN summary — only for analysts/admins */}
      {(role === "Financial Analyst" || role === "System Admin" || role === "Supervisor") && (
        <Card style={{ marginTop:18 }}>
          <SectionHeader label="Top Flagged Transactions" action={<Badge label="4 Active Alerts" color={C.red} bg={C.redDim} />} />
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.surface }}>
                  {["Transaction ID","From","To","Amount","Flag","Risk Score"].map(h=>(
                    <th key={h} style={{ padding:"9px 18px", textAlign:"left", fontSize:11, fontWeight:600, color:C.textDim, letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.filter(t=>t.flag).map(t=>{
                  const rm = riskMeta(t.risk);
                  return (
                    <tr key={t.id}
                      onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      style={{ borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}>
                      <td style={{ padding:"11px 18px", fontSize:12, color:C.blueHi }}>{t.id}</td>
                      <td style={{ padding:"11px 18px", fontSize:12, color:C.textMid, maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.from}</td>
                      <td style={{ padding:"11px 18px", fontSize:12, color:C.textMid }}>{t.to}</td>
                      <td style={{ padding:"11px 18px", fontSize:13, fontWeight:600, color:C.text }}>${t.amount.toLocaleString()}</td>
                      <td style={{ padding:"11px 18px" }}><Badge label={t.flag} color={C.red} bg={C.redDim} /></td>
                      <td style={{ padding:"11px 18px" }}><RiskBar score={t.risk} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CASES
// ══════════════════════════════════════════════════════════════════════════════
function Cases({ user, toast }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("overview");
  const [filterType, setFilterType] = useState("All");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(["Spoke with Meridian compliance team. Confirmed the $9,800 transfer was flagged internally but not reported.", "Director James Okafor has known links to BVI entity registered 2021-03-14."]);
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([
    { id:1, text:"Obtain bank records for Stellar Holdings", done:false, assignee:"Amina Hassan" },
    { id:2, text:"OSINT profile: BVI Account 4421 beneficiary", done:false, assignee:"Amina Hassan" },
    { id:3, text:"Transaction flow analysis — Q4 period", done:true, assignee:"David Kimani" },
  ]);

  const canCreate = user.role === "Investigator" || user.role === "Supervisor" || user.role === "System Admin";
  const canAdvance = user.role === "Supervisor" || user.role === "System Admin";

  const types = ["All","AML","Money Laundering","Crypto Crime","Corruption","Trade Fraud","Cyber-Enabled Crime"];
  const filtered = filterType === "All" ? CASES_DATA : CASES_DATA.filter(c=>c.type===filterType);

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      {/* List Panel */}
      <div style={{ width:selected?300:460, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0, background:C.surface }}>
        <div style={{ padding:"16px 18px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <h3 style={{ margin:0, fontSize:16, fontFamily:"'Playfair Display', serif", color:C.text }}>Case Registry</h3>
            {canCreate && <Btn size="sm" onClick={()=>toast("New case created: ECS-2024-0072")}>+ New Case</Btn>}
          </div>
          <Input placeholder="Search cases..." style={{ width:"100%", boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
            {types.map(t=>(
              <button key={t} onClick={()=>setFilterType(t)}
                style={{ padding:"3px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:filterType===t?600:400,
                  background:filterType===t?C.blue:C.card, color:filterType===t?"#fff":C.textDim }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto" }}>
          {filtered.map(c=>{
            const rm = riskMeta(c.risk);
            const isSelected = selected?.id === c.id;
            return (
              <div key={c.id} onClick={()=>{setSelected(c);setTab("overview");}}
                style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, cursor:"pointer",
                  background:isSelected?C.card:C.surface, borderLeft:`3px solid ${isSelected?C.blue:"transparent"}`,
                  transition:"all 0.15s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, color:C.blueHi, fontWeight:500 }}>{c.id}</span>
                  <Badge label={c.risk} color={rm.color} bg={rm.bg} />
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:5 }}>{c.title}</div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:11, color:C.textDim }}>{c.type}</span>
                  <span style={{ fontSize:11, color:C.textDim }}>{c.stage}</span>
                </div>
                <div style={{ marginTop:8, height:2, background:C.border, borderRadius:1 }}>
                  <div style={{ height:"100%", borderRadius:1, background:C.blue, width:`${((STAGES.indexOf(c.stage)+1)/STAGES.length)*100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {selected ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"16px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:11, color:C.blueHi, marginBottom:4 }}>{selected.id}</div>
              <h2 style={{ margin:0, fontSize:20, fontFamily:"'Playfair Display', serif", color:C.text }}>{selected.title}</h2>
              <div style={{ fontSize:12, color:C.textDim, marginTop:4 }}>{selected.type} · Assigned to {selected.assignee} · Opened {selected.opened}</div>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              {canAdvance && <Btn size="sm" onClick={()=>toast("Stage advanced — approval logged to audit trail")}>Advance Stage</Btn>}
              <Btn size="sm" variant="secondary" onClick={()=>toast("Case exported as PDF package")}>Export</Btn>
            </div>
          </div>

          <StagePipeline stage={selected.stage} />

          {/* Tabs */}
          <div style={{ display:"flex", padding:"0 24px", borderBottom:`1px solid ${C.border}`, background:C.surface }}>
            {["overview","transactions","entities","tasks","notes","timeline"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{ padding:"11px 14px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit",
                  fontSize:12, fontWeight:tab===t?600:400, letterSpacing:"0.04em",
                  color:tab===t?C.text:C.textDim, borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent",
                  textTransform:"capitalize" }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:24 }}>
            {tab==="overview" && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
                  {[
                    { l:"Risk Level", v:selected.risk, color:riskMeta(selected.risk).color },
                    { l:"Stage", v:selected.stage },
                    { l:"Entities", v:selected.entities },
                    { l:"Transactions", v:selected.txns.toLocaleString() },
                    { l:"Opened", v:selected.opened },
                    { l:"Last Updated", v:selected.lastUpdate },
                  ].map(s=>(
                    <Card key={s.l} style={{ padding:"14px 16px" }}>
                      <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.06em", marginBottom:6, textTransform:"uppercase" }}>{s.l}</div>
                      <div style={{ fontSize:15, fontWeight:600, color:s.color||C.text }}>{s.v}</div>
                    </Card>
                  ))}
                </div>
                <Card style={{ padding:"16px 20px" }}>
                  <div style={{ fontSize:12, color:C.textDim, marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Case Summary</div>
                  <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.7 }}>
                    Investigation into suspected money laundering through layered corporate structures. Key suspect entity Phoenix Trading LLC identified as primary conduit, with funds routed through Stellar Holdings and BVI Account 4421 before integration via Nakamura Real Estate. 3 transactions flagged for structuring below reporting thresholds.
                  </p>
                </Card>
              </div>
            )}

            {tab==="transactions" && (
              <div>
                {TXN_DATA.map(t=>{
                  const rm = riskMeta(t.risk);
                  return (
                    <Card key={t.id} style={{ padding:"14px 18px", marginBottom:10, display:"flex", alignItems:"center", gap:16 }}>
                      <div style={{ width:3, height:44, background:rm.color, borderRadius:2, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:4 }}>
                          <span style={{ fontSize:13, fontWeight:500, color:C.text }}>{t.from}</span>
                          <span style={{ color:C.textDim, fontSize:13 }}>→</span>
                          <span style={{ fontSize:13, color:C.textMid }}>{t.to}</span>
                        </div>
                        <div style={{ fontSize:11, color:C.textDim }}>{t.date} · {t.id}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:16, fontWeight:600, color:C.text }}>${t.amount.toLocaleString()}</div>
                        {t.flag && <Badge label={t.flag} color={C.red} bg={C.redDim} />}
                      </div>
                      <div style={{ width:80 }}><RiskBar score={t.risk} width={50} /></div>
                    </Card>
                  );
                })}
              </div>
            )}

            {tab==="entities" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                {NETWORK_NODES.map(n=>(
                  <Card key={n.id} style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:nodeStyle(n.type) }} />
                      <span style={{ fontSize:11, color:C.textDim, textTransform:"capitalize" }}>{n.type}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:8 }}>{n.label}</div>
                    <Badge label={n.risk} color={riskMeta(n.risk).color} bg={riskMeta(n.risk).bg} />
                  </Card>
                ))}
              </div>
            )}

            {tab==="tasks" && (
              <div>
                <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                  <Input placeholder="Add new task..." value={taskInput} onChange={e=>setTaskInput(e.target.value)} style={{ flex:1 }} />
                  <Btn onClick={()=>{if(taskInput.trim()){setTasks([...tasks,{id:Date.now(),text:taskInput,done:false,assignee:user.name}]);setTaskInput("");toast("Task added");}}} >Add</Btn>
                </div>
                {tasks.map(t=>(
                  <Card key={t.id} style={{ padding:"13px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
                    <input type="checkbox" checked={t.done} onChange={()=>setTasks(tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}
                      style={{ width:16, height:16, cursor:"pointer", accentColor:C.blue }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:t.done?C.textDim:C.text, textDecoration:t.done?"line-through":"none" }}>{t.text}</div>
                      <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>Assigned to {t.assignee}</div>
                    </div>
                    {t.done && <Badge label="Complete" color={C.green} bg={C.greenDim} />}
                  </Card>
                ))}
              </div>
            )}

            {tab==="notes" && (
              <div>
                <div style={{ marginBottom:16 }}>
                  <textarea value={newNote} onChange={e=>setNewNote(e.target.value)}
                    placeholder="Add a secure case note — all notes are logged and immutable..."
                    rows={4}
                    style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:14, color:C.text, fontFamily:"inherit", fontSize:13, resize:"vertical", boxSizing:"border-box", outline:"none" }} />
                  <Btn style={{ marginTop:8 }} onClick={()=>{if(newNote.trim()){setNotes([newNote,...notes]);setNewNote("");toast("Note saved — logged to audit trail");}}}>Save Note</Btn>
                </div>
                {notes.map((n,i)=>(
                  <Card key={i} style={{ padding:"14px 18px", marginBottom:10 }}>
                    <div style={{ fontSize:11, color:C.textDim, marginBottom:6 }}>Amina Hassan · {i===0?"Just now":"2 days ago"} · Encrypted</div>
                    <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.6 }}>{n}</p>
                  </Card>
                ))}
              </div>
            )}

            {tab==="timeline" && (
              <div>
                {AUDIT_DATA.filter(a=>a.case===selected.id||a.case==="ECS-2024-0047").map((a,i)=>(
                  <div key={i} style={{ display:"flex", gap:14, marginBottom:16 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:C.blue, border:`2px solid ${C.bg}`, marginTop:3 }} />
                      {i < 5 && <div style={{ width:1, flex:1, background:C.border, marginTop:4 }} />}
                    </div>
                    <Card style={{ flex:1, padding:"12px 16px", marginBottom:0 }}>
                      <div style={{ fontSize:12, color:C.blueHi, fontWeight:500 }}>{a.user}</div>
                      <div style={{ fontSize:13, color:C.textMid, marginTop:3 }}>{a.action}</div>
                      <div style={{ fontSize:11, color:C.textDim, marginTop:4 }}>{a.time}</div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", color:C.textDim, gap:10 }}>
          <div style={{ fontSize:32 }}>◫</div>
          <div style={{ fontSize:14 }}>Select a case to view details</div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FINANCIAL ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════
function Financial({ user, toast }) {
  const [threshold, setThreshold] = useState(10000);
  const [txns, setTxns] = useState(TXN_DATA);
  const [manualForm, setManualForm] = useState({ from:"", to:"", amount:"", date:"", type:"Wire" });
  const [showManual, setShowManual] = useState(false);
  const [rules, setRules] = useState([
    { id:1, name:"Structuring Detection", condition:"< $10,000 within 48h", enabled:true, triggered:3 },
    { id:2, name:"Large Cash", condition:"> $10,000 single", enabled:true, triggered:1 },
    { id:3, name:"Rapid Layering", condition:"3+ hops within 24h", enabled:true, triggered:2 },
    { id:4, name:"Unusual Geography", condition:"Cross-border > $50K", enabled:false, triggered:0 },
  ]);

  const addManual = () => {
    if (!manualForm.from || !manualForm.to || !manualForm.amount) { toast("Please fill all required fields"); return; }
    const amt = parseFloat(manualForm.amount);
    const risk = amt > 200000 ? 91 : amt > 50000 ? 72 : 35;
    const flag = amt < 10000 ? "Structuring" : amt > 200000 ? "Layering" : null;
    setTxns([{ id:`TXN-${9000+txns.length}`, ...manualForm, amount:amt, currency:"USD", risk, flag, case:"ECS-2024-0047" }, ...txns]);
    setManualForm({ from:"", to:"", amount:"", date:"", type:"Wire" });
    setShowManual(false);
    toast(`Transaction logged${flag ? ` — ${flag} alert triggered!` : ""}`);
  };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>Financial Analysis</h2>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn size="sm" variant="ghost" onClick={()=>toast("CSV/Excel upload dialog opened")}>↑ Upload File</Btn>
          <Btn size="sm" onClick={()=>setShowManual(!showManual)}>+ Manual Entry</Btn>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <Card style={{ padding:20, marginBottom:20, borderColor:C.gold }}>
          <div style={{ fontSize:12, color:C.gold, fontWeight:600, letterSpacing:"0.06em", marginBottom:14, textTransform:"uppercase" }}>Manual Transaction Entry</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:14 }}>
            <div><div style={{ fontSize:11, color:C.textDim, marginBottom:5 }}>From Entity *</div><Input placeholder="Entity name" value={manualForm.from} onChange={e=>setManualForm({...manualForm,from:e.target.value})} style={{ width:"100%", boxSizing:"border-box" }} /></div>
            <div><div style={{ fontSize:11, color:C.textDim, marginBottom:5 }}>To Entity *</div><Input placeholder="Entity name" value={manualForm.to} onChange={e=>setManualForm({...manualForm,to:e.target.value})} style={{ width:"100%", boxSizing:"border-box" }} /></div>
            <div><div style={{ fontSize:11, color:C.textDim, marginBottom:5 }}>Amount (USD) *</div><Input placeholder="0.00" value={manualForm.amount} onChange={e=>setManualForm({...manualForm,amount:e.target.value})} style={{ width:"100%", boxSizing:"border-box" }} /></div>
            <div><div style={{ fontSize:11, color:C.textDim, marginBottom:5 }}>Date</div><Input placeholder="2024-01-25" value={manualForm.date} onChange={e=>setManualForm({...manualForm,date:e.target.value})} style={{ width:"100%", boxSizing:"border-box" }} /></div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={addManual}>Submit & Flag Check</Btn>
            <Btn variant="secondary" onClick={()=>setShowManual(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Alert Rules */}
      <Card style={{ marginBottom:20 }}>
        <SectionHeader label="Alert Rules Engine" action={<Btn size="sm" variant="ghost" onClick={()=>toast("Rules configuration opened")}>Configure</Btn>} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
          {rules.map((r,i)=>(
            <div key={r.id} style={{ padding:"14px 18px", borderRight: i<3?`1px solid ${C.border}`:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:r.enabled?C.text:C.textDim }}>{r.name}</span>
                <div onClick={()=>setRules(rules.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x))}
                  style={{ width:34, height:18, borderRadius:9, background:r.enabled?C.blue:C.border, cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:2, left:r.enabled?16:2, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
                </div>
              </div>
              <div style={{ fontSize:11, color:C.textDim, marginBottom:8 }}>{r.condition}</div>
              <div style={{ fontSize:12, color:r.triggered>0?C.red:C.textDim }}>
                {r.triggered > 0 ? `${r.triggered} triggered` : "No alerts"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Threshold Slider */}
      <Card style={{ padding:"14px 20px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <span style={{ fontSize:12, color:C.textDim, minWidth:140 }}>Reporting Threshold</span>
          <input type="range" min={5000} max={50000} step={1000} value={threshold} onChange={e=>setThreshold(+e.target.value)}
            style={{ flex:1, accentColor:C.blue }} />
          <span style={{ fontSize:14, fontWeight:600, color:C.gold, minWidth:80 }}>${threshold.toLocaleString()}</span>
        </div>
      </Card>

      {/* Transaction Table */}
      <Card>
        <SectionHeader label={`Transaction Ledger (${txns.length})`} action={
          <div style={{ display:"flex", gap:8 }}>
            <Btn size="sm" variant="ghost" onClick={()=>toast("Exported to Excel")}>↓ Export XLS</Btn>
            <Btn size="sm" variant="ghost" onClick={()=>toast("Linked to case")}>Link to Case</Btn>
          </div>
        } />
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.surface }}>
                {["ID","Date","From","To","Amount","Risk Score","Flag","Actions"].map(h=>(
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:C.textDim, letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(t=>{
                const rm = riskMeta(t.risk);
                return (
                  <tr key={t.id}
                    onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    style={{ borderBottom:`1px solid ${C.border}`, transition:"background 0.1s" }}>
                    <td style={{ padding:"11px 16px", fontSize:12, color:C.blueHi, fontWeight:500 }}>{t.id}</td>
                    <td style={{ padding:"11px 16px", fontSize:12, color:C.textDim, whiteSpace:"nowrap" }}>{t.date}</td>
                    <td style={{ padding:"11px 16px", fontSize:12, color:C.textMid, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.from}</td>
                    <td style={{ padding:"11px 16px", fontSize:12, color:C.textMid, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.to}</td>
                    <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600, color:C.text, whiteSpace:"nowrap" }}>${t.amount.toLocaleString()}</td>
                    <td style={{ padding:"11px 16px" }}><RiskBar score={t.risk} /></td>
                    <td style={{ padding:"11px 16px" }}>{t.flag ? <Badge label={t.flag} color={rm.color} bg={rm.bg} /> : <span style={{ color:C.textDim, fontSize:12 }}>—</span>}</td>
                    <td style={{ padding:"11px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <Btn size="sm" variant="ghost" onClick={()=>toast(`Traced ${t.id} to case`)}>Trace</Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>toast(`${t.id} linked to ECS-2024-0047`)}>Link</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NETWORK ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════
function Network({ user, toast }) {
  const [hovered, setHovered] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [annInput, setAnnInput] = useState("");
  const [filter, setFilter] = useState("All");

  const nodeFilters = ["All","person","company","account","wallet"];

  const visibleNodes = filter === "All" ? NETWORK_NODES : NETWORK_NODES.filter(n=>n.type===filter);
  const visibleIds = new Set(visibleNodes.map(n=>n.id));
  const visibleEdges = NETWORK_EDGES.filter(e=>visibleIds.has(e.from)&&visibleIds.has(e.to));

  const hNode = hovered ? NETWORK_NODES.find(n=>n.id===hovered) : null;

  const edgeColor = (e) => {
    const map = { transaction:C.blue, ownership:C.gold, crypto:C.green };
    return map[e.type] || C.border;
  };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>Network Analysis</h2>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ display:"flex", gap:8 }}>
            {[{t:"transaction",c:C.blue},{t:"ownership",c:C.gold},{t:"crypto",c:C.green}].map(l=>(
              <div key={l.t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.textDim }}>
                <div style={{ width:20, height:2, background:l.c, borderRadius:1 }} />{l.t}
              </div>
            ))}
          </div>
          <Btn size="sm" variant="ghost" onClick={()=>toast("Network view exported as PNG")}>↓ Export</Btn>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {nodeFilters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"4px 14px", borderRadius:20, border:`1px solid ${filter===f?nodeStyle(f):C.border}`, cursor:"pointer",
              fontFamily:"inherit", fontSize:12, background:filter===f?nodeStyle(f)+"22":"transparent",
              color:filter===f?nodeStyle(f):C.textDim }}>
            {f === "All" ? "All Entities" : f.charAt(0).toUpperCase()+f.slice(1)+"s"}
          </button>
        ))}
      </div>

      {/* Graph Canvas */}
      <Card style={{ overflow:"hidden", marginBottom:16 }}>
        <svg width="100%" viewBox="0 0 880 430" style={{ display:"block", background:C.bg }}>
          <defs>
            <marker id="arrowB" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={C.blue} opacity="0.6" />
            </marker>
            <marker id="arrowG" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={C.gold} opacity="0.6" />
            </marker>
            <marker id="arrowGr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={C.green} opacity="0.6" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Grid */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F2A3D" strokeWidth="0.5" />
          </pattern>
          <rect width="880" height="430" fill="url(#grid)" />

          {/* Edges */}
          {visibleEdges.map((e,i)=>{
            const from = NETWORK_NODES.find(n=>n.id===e.from);
            const to = NETWORK_NODES.find(n=>n.id===e.to);
            if(!from||!to) return null;
            const mx=(from.x+to.x)/2, my=(from.y+to.y)/2;
            const markerMap = { transaction:"url(#arrowB)", ownership:"url(#arrowG)", crypto:"url(#arrowGr)" };
            return (
              <g key={i}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={edgeColor(e)} strokeWidth={1.5} opacity={0.5}
                  strokeDasharray={e.type==="ownership"?"5,3":"none"}
                  markerEnd={markerMap[e.type]} />
                <text x={mx} y={my-8} textAnchor="middle" fontSize="10" fill={C.textDim} fontFamily="DM Sans, sans-serif">{e.label}</text>
              </g>
            );
          })}

          {/* Nodes */}
          {visibleNodes.map(n=>{
            const nc = nodeStyle(n.type);
            const rm = riskMeta(n.risk);
            const isHov = hovered===n.id;
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`}
                onMouseEnter={()=>setHovered(n.id)} onMouseLeave={()=>setHovered(null)}
                style={{ cursor:"pointer" }}>
                {(n.risk==="critical"||n.risk==="high") && (
                  <circle r={24} fill="none" stroke={rm.color} strokeWidth={1} opacity={isHov?0.5:0.15} />
                )}
                <circle r={18} fill={C.card} stroke={nc} strokeWidth={isHov?2.5:1.5} filter={isHov?"url(#glow)":""} />
                <text textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={nc} fontFamily="DM Sans, sans-serif" fontWeight="600">
                  {n.type==="company"?"C":n.type==="person"?"P":n.type==="wallet"?"W":"A"}
                </text>
                <rect x={-52} y={22} width={104} height={18} rx={4} fill={C.card} opacity={0.92} />
                <text x={0} y={32} textAnchor="middle" fontSize="9" fill={isHov?C.text:C.textMid} fontFamily="DM Sans, sans-serif">
                  {n.label.length>16?n.label.slice(0,15)+"…":n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>

      {/* Hover info + annotation */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:"16px 20px" }}>
          <div style={{ fontSize:12, color:C.textDim, fontWeight:600, letterSpacing:"0.06em", marginBottom:12, textTransform:"uppercase" }}>
            {hNode ? "Entity Profile" : "Hover an entity"}
          </div>
          {hNode ? (
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:8 }}>{hNode.label}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div><div style={{ fontSize:11, color:C.textDim }}>Type</div><div style={{ fontSize:13, color:nodeStyle(hNode.type), marginTop:2 }}>{hNode.type}</div></div>
                <div><div style={{ fontSize:11, color:C.textDim }}>Risk</div><div style={{ fontSize:13, color:riskMeta(hNode.risk).color, marginTop:2, fontWeight:600 }}>{hNode.risk.toUpperCase()}</div></div>
              </div>
              <div style={{ marginTop:12 }}>
                <Btn size="sm" onClick={()=>toast(`Full profile opened: ${hNode.label}`)}>View Full Profile</Btn>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:12, color:C.textDim }}>Select any node on the graph to view entity details and link to cases.</div>
          )}
        </Card>

        <Card style={{ padding:"16px 20px" }}>
          <div style={{ fontSize:12, color:C.textDim, fontWeight:600, letterSpacing:"0.06em", marginBottom:12, textTransform:"uppercase" }}>Whiteboard Annotations</div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <Input placeholder="Add annotation..." value={annInput} onChange={e=>setAnnInput(e.target.value)} style={{ flex:1 }} />
            <Btn size="sm" onClick={()=>{if(annInput.trim()){setAnnotations([{text:annInput,time:"Now"},...annotations]);setAnnInput("");toast("Annotation saved");}}}>Add</Btn>
          </div>
          {annotations.length===0 && <div style={{ fontSize:12, color:C.textDim }}>No annotations yet.</div>}
          {annotations.map((a,i)=>(
            <div key={i} style={{ padding:"8px 0", borderBottom:`1px solid ${C.border}`, fontSize:12, color:C.textMid }}>
              <span style={{ color:C.textDim, fontSize:11 }}>{a.time} · </span>{a.text}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OSINT
// ══════════════════════════════════════════════════════════════════════════════
function OSINT({ user, toast }) {
  const [query, setQuery] = useState("");
  const [captures, setCaptures] = useState([
    { id:1, source:"OpenCorporates", title:"Phoenix Trading LLC — Company Filing", url:"opencorporates.com/companies/...", date:"2024-01-20 08:33", reliability:8, notes:"Registered 2021-03-14, Director: James Okafor. Status Active. Shares outstanding: 1,000.", linked:"ECS-2024-0047" },
    { id:2, source:"ICIJ Offshore Leaks", title:"BVI Cross-Reference — Pandora Papers", url:"offshoreleaks.icij.org/nodes/...", date:"2024-01-20 09:11", reliability:9, notes:"Shell structure identified in 2022 Pandora Papers dataset. Linked nominee director.", linked:"ECS-2024-0047" },
    { id:3, source:"LinkedIn", title:"James Okafor — Professional Profile", url:"linkedin.com/in/james-okafor...", date:"2024-01-21 14:05", reliability:5, notes:"CEO Phoenix Trading since 2021. Previously: Meridian Bank 2015–2021 (Compliance Officer).", linked:"ECS-2024-0047" },
  ]);
  const [newCapture, setNewCapture] = useState({ source:"", url:"", notes:"" });
  const [showCapture, setShowCapture] = useState(false);

  const SOURCES = ["OpenCorporates","ICIJ Offshore Leaks","UN Sanctions","Interpol Notices","LinkedIn","World Bank Debarred","OpenSanctions","Companies House","Wikidata"];

  const saveCapture = () => {
    if (!newCapture.source || !newCapture.url) { toast("Source and URL are required"); return; }
    setCaptures([{ id:Date.now(), ...newCapture, title:`OSINT Capture — ${newCapture.source}`, date:"2024-01-25 "+new Date().toLocaleTimeString(), reliability:6, linked:"ECS-2024-0047" }, ...captures]);
    setNewCapture({ source:"", url:"", notes:"" });
    setShowCapture(false);
    toast("OSINT capture saved — metadata logged (URL, date, time)");
  };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>OSINT Collection</h2>
          <div style={{ fontSize:12, color:C.textDim, marginTop:4 }}>Free, non-commercial sources only</div>
        </div>
        <Btn size="sm" onClick={()=>setShowCapture(!showCapture)}>+ New Capture</Btn>
      </div>

      {/* Search */}
      <Card style={{ padding:"16px 20px", marginBottom:20 }}>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <Input placeholder="Search: person name, company, identifier, address..." value={query} onChange={e=>setQuery(e.target.value)} style={{ flex:1 }} />
          <Btn onClick={()=>toast(`Querying ${SOURCES.length} OSINT sources for: "${query || 'Phoenix Trading LLC'}"`)}>Search All Sources</Btn>
        </div>
        <div style={{ fontSize:12, color:C.textDim, marginBottom:8 }}>Available sources:</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {SOURCES.map(s=>(
            <div key={s} style={{ padding:"4px 12px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, fontSize:11, color:C.textMid }}>{s}</div>
          ))}
        </div>
      </Card>

      {/* New Capture Form */}
      {showCapture && (
        <Card style={{ padding:20, marginBottom:20, borderColor:C.gold }}>
          <div style={{ fontSize:12, color:C.gold, fontWeight:600, letterSpacing:"0.06em", marginBottom:14, textTransform:"uppercase" }}>Manual OSINT Capture</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, color:C.textDim, marginBottom:5 }}>Source *</div>
              <select value={newCapture.source} onChange={e=>setNewCapture({...newCapture,source:e.target.value})}
                style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color:newCapture.source?C.text:C.textDim, fontFamily:"inherit", fontSize:13 }}>
                <option value="">Select source</option>
                {SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:11, color:C.textDim, marginBottom:5 }}>URL *</div>
              <Input placeholder="https://..." value={newCapture.url} onChange={e=>setNewCapture({...newCapture,url:e.target.value})} style={{ width:"100%", boxSizing:"border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:C.textDim, marginBottom:5 }}>Analyst Notes</div>
            <textarea value={newCapture.notes} onChange={e=>setNewCapture({...newCapture,notes:e.target.value})}
              rows={3} placeholder="Key findings from this source..."
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color:C.text, fontFamily:"inherit", fontSize:13, resize:"none", boxSizing:"border-box", outline:"none" }} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn onClick={saveCapture}>Save & Screenshot</Btn>
            <Btn variant="secondary" onClick={()=>setShowCapture(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Captures */}
      {captures.map(c=>(
        <Card key={c.id} style={{ padding:"16px 20px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <Badge label={c.source} color={C.blueHi} bg={C.blueDim} />
              <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{c.title}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <span style={{ fontSize:11, color:C.textDim }}>Reliability</span>
              <div style={{ display:"flex", gap:2 }}>
                {Array.from({length:10}).map((_,i)=>(
                  <div key={i} style={{ width:8, height:8, borderRadius:1, background:i<c.reliability?C.green:C.border }} />
                ))}
              </div>
              <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>{c.reliability}/10</span>
            </div>
          </div>
          <p style={{ margin:"0 0 10px", fontSize:13, color:C.textMid, lineHeight:1.6 }}>{c.notes}</p>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:11, color:C.textDim }}>
              <span style={{ color:C.blueHi }}>{c.url}</span> · Captured {c.date}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {c.linked && <Badge label={`Linked: ${c.linked}`} color={C.green} bg={C.greenDim} />}
              <Btn size="sm" variant="ghost" onClick={()=>toast(`Linked to ${c.linked}`)}>Link to Case</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>toast("Added to entity profile")}>Add to Entity</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CRYPTO
// ══════════════════════════════════════════════════════════════════════════════
function Crypto({ user, toast }) {
  const [walletInput, setWalletInput] = useState("");
  const [wallets, setWallets] = useState([
    { address:"0x4f2c9a81c3bd2e14...", chain:"ETH", balance:"12.4 ETH", label:"Mixer Output", risk:"Critical", txCount:47, flagged:["Tornado Cash interaction","Multiple rapid hops"] },
    { address:"bc1qxy2kgdygjrsqt...", chain:"BTC", balance:"0.82 BTC", label:"Exchange Deposit", risk:"High", txCount:12, flagged:["KYC-unverified exchange"] },
    { address:"0x9b1fa320e4c8d71b...", chain:"ETH", balance:"3.1 ETH", label:"Untagged Wallet", risk:"Medium", txCount:8, flagged:[] },
  ]);

  const addWallet = () => {
    if(!walletInput.trim()) { toast("Enter a wallet address"); return; }
    setWallets([{ address:walletInput, chain:"ETH", balance:"?? ETH", label:"Untagged Wallet", risk:"Medium", txCount:0, flagged:[] },...wallets]);
    setWalletInput("");
    toast("Wallet added — blockchain scan initiated");
  };

  const chainColors = { ETH:"#627EEA", BTC:"#F7931A" };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>Cryptocurrency Analysis</h2>
          <div style={{ fontSize:12, color:C.textDim, marginTop:4 }}>Bitcoin · Ethereum</div>
        </div>
        <Btn size="sm" variant="ghost" onClick={()=>toast("Crypto summary exported")}>↓ Export Summary</Btn>
      </div>

      {/* Wallet lookup */}
      <Card style={{ padding:20, marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textDim, fontWeight:600, letterSpacing:"0.06em", marginBottom:12, textTransform:"uppercase" }}>Wallet Lookup & Tracing</div>
        <div style={{ display:"flex", gap:10 }}>
          <Input placeholder="Enter wallet address or transaction hash..." value={walletInput} onChange={e=>setWalletInput(e.target.value)} style={{ flex:1, fontFamily:"monospace" }} />
          <Btn onClick={addWallet}>Trace</Btn>
          <Btn variant="ghost" onClick={()=>toast("Bulk upload opened")}>Bulk Upload</Btn>
        </div>
      </Card>

      {/* Wallets */}
      {wallets.map((w,i)=>{
        const rm = riskMeta(w.risk);
        const cc = chainColors[w.chain] || C.blueHi;
        return (
          <Card key={i} style={{ padding:"18px 20px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:6 }}>
                  <div style={{ padding:"3px 10px", borderRadius:20, background:cc+"22", border:`1px solid ${cc}55`, color:cc, fontSize:11, fontWeight:600 }}>{w.chain}</div>
                  <span style={{ fontSize:15, fontWeight:600, color:C.text }}>{w.label}</span>
                  <Badge label={w.risk} color={rm.color} bg={rm.bg} />
                </div>
                <div style={{ fontSize:12, color:C.textDim, fontFamily:"monospace" }}>{w.address}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:18, fontWeight:600, color:C.text }}>{w.balance}</div>
                <div style={{ fontSize:12, color:C.textDim, marginTop:2 }}>{w.txCount} transactions</div>
              </div>
            </div>

            {/* Mini bar chart */}
            <div style={{ height:32, background:C.bg, borderRadius:6, overflow:"hidden", display:"flex", alignItems:"flex-end", padding:"4px 8px", gap:2, marginBottom:12 }}>
              {Array.from({length:24}).map((_,j)=>{
                const h = Math.floor(Math.random()*24+4);
                const flagged = j===3||j===8||j===15||j===20;
                return <div key={j} style={{ flex:1, height:h, borderRadius:2, background:flagged?rm.color:C.blueDim, opacity:flagged?1:0.5 }} />;
              })}
            </div>

            {w.flagged.length>0 && (
              <div style={{ marginBottom:12 }}>
                {w.flagged.map((f,j)=>(
                  <span key={j} style={{ display:"inline-block", marginRight:6, marginBottom:4, padding:"2px 10px", borderRadius:20, background:C.redDim, color:C.red, fontSize:11, border:`1px solid ${C.red}33` }}>⚠ {f}</span>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:8 }}>
              <Btn size="sm" onClick={()=>toast(`Tracing transaction hops for ${w.address.slice(0,12)}...`)}>Trace Hops</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>toast("Wallet tagged")}>Tag Wallet</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>toast("Linked to case ECS-2024-0047")}>Link to Case</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>toast("Checking against known services...")}>Check Services</Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EVIDENCE
// ══════════════════════════════════════════════════════════════════════════════
function Evidence({ user, toast }) {
  const [evidence, setEvidence] = useState(EVIDENCE_DATA);
  const [hashInput, setHashInput] = useState("");
  const [hashResult, setHashResult] = useState(null);
  const [verifyInput, setVerifyInput] = useState("");
  const [showOCR, setShowOCR] = useState(false);
  const [ocrResult, setOCRResult] = useState(null);

  const canUpload = user.role === "Investigator" || user.role === "System Admin";
  const canLock = user.role === "Supervisor" || user.role === "System Admin" || user.role === "Prosecutor";

  const simulateHash = (algo) => {
    const chars = "0123456789abcdef";
    const len = algo==="MD5"?32:64;
    const h = Array.from({length:len}).map(()=>chars[Math.floor(Math.random()*16)]).join("");
    setHashResult({ algo, hash:h });
    toast(`${algo} hash generated`);
  };

  const typeIcon = { PDF:"📄", Image:"🖼", Excel:"📊" };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>Digital Evidence</h2>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {canUpload && <Btn size="sm" onClick={()=>{toast("File uploaded — SHA-256 auto-generated and stored");setEvidence([{id:`EV-00${evidence.length+45}`,name:"new_upload_jan25.pdf",type:"PDF",size:"0.5 MB",sha256:"d1c2e3f4a5b6...",uploaded:"2024-01-25 09:47",by:user.name,locked:false,coc:1},...evidence]);}}>↑ Upload Evidence</Btn>}
          <Btn size="sm" variant="ghost" onClick={()=>setShowOCR(!showOCR)}>PDF Extraction / OCR</Btn>
        </div>
      </div>

      {/* OCR/PDF Section */}
      {showOCR && (
        <Card style={{ padding:20, marginBottom:20, borderColor:C.gold }}>
          <div style={{ fontSize:12, color:C.gold, fontWeight:600, letterSpacing:"0.06em", marginBottom:14, textTransform:"uppercase" }}>PDF Extraction & OCR</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <div style={{ background:C.bg, border:`2px dashed ${C.border}`, borderRadius:8, padding:"28px", textAlign:"center", cursor:"pointer", marginBottom:12 }}
                onClick={()=>{ setOCRResult({ tables:3, rows:47, confidence:94 }); toast("PDF processed — 3 tables extracted, 94% OCR confidence"); }}>
                <div style={{ fontSize:24, marginBottom:8 }}>📄</div>
                <div style={{ fontSize:13, color:C.textDim }}>Drop PDF or click to upload</div>
                <div style={{ fontSize:11, color:C.textDim, marginTop:4 }}>Supports scanned & digital PDFs</div>
              </div>
              <Btn size="sm" variant="ghost" onClick={()=>toast("Converted to Excel — 47 rows extracted")}>Convert to Excel</Btn>
            </div>
            <div>
              {ocrResult ? (
                <div>
                  <div style={{ fontSize:12, color:C.green, fontWeight:600, marginBottom:10 }}>✓ Extraction Complete</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                    {[{l:"Tables Found",v:ocrResult.tables},{l:"Rows Extracted",v:ocrResult.rows},{l:"OCR Confidence",v:`${ocrResult.confidence}%`},{l:"Status",v:"Pending Validation"}].map(s=>(
                      <Card key={s.l} style={{ padding:"10px 12px" }}>
                        <div style={{ fontSize:11, color:C.textDim }}>{s.l}</div>
                        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginTop:2 }}>{s.v}</div>
                      </Card>
                    ))}
                  </div>
                  <Btn size="sm" onClick={()=>toast("Extraction validated and saved")}>Validate & Save</Btn>
                </div>
              ) : (
                <div style={{ padding:"28px", textAlign:"center", color:C.textDim, fontSize:13 }}>Upload a PDF to begin extraction</div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Hash Tool */}
      <Card style={{ padding:"16px 20px", marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textDim, fontWeight:600, letterSpacing:"0.06em", marginBottom:12, textTransform:"uppercase" }}>Hash Generator & Verifier</div>
        <div style={{ display:"flex", gap:10, marginBottom:12 }}>
          <Input placeholder="Paste content or file path to hash..." value={hashInput} onChange={e=>setHashInput(e.target.value)} style={{ flex:1 }} />
          <Btn size="sm" variant="ghost" onClick={()=>simulateHash("MD5")}>MD5</Btn>
          <Btn size="sm" variant="ghost" onClick={()=>simulateHash("SHA-128")}>SHA-128</Btn>
          <Btn size="sm" onClick={()=>simulateHash("SHA-256")}>SHA-256</Btn>
        </div>
        {hashResult && (
          <div style={{ background:C.bg, borderRadius:6, padding:"10px 14px", fontFamily:"monospace", fontSize:12 }}>
            <span style={{ color:C.textDim }}>{hashResult.algo}: </span>
            <span style={{ color:C.green }}>{hashResult.hash}</span>
          </div>
        )}
        <div style={{ marginTop:12, display:"flex", gap:10 }}>
          <Input placeholder="Paste expected hash to verify..." value={verifyInput} onChange={e=>setVerifyInput(e.target.value)} style={{ flex:1, fontFamily:"monospace" }} />
          <Btn size="sm" variant="gold" onClick={()=>toast(verifyInput.length>20?"✓ Hash verified — evidence integrity confirmed":"Enter a valid hash to verify")}>Verify</Btn>
        </div>
      </Card>

      {/* Evidence List */}
      <Card>
        <SectionHeader label={`Evidence Repository (${evidence.length})`} action={<Badge label="Chain of Custody Active" color={C.green} bg={C.greenDim} />} />
        {evidence.map(ev=>(
          <div key={ev.id} style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:16 }}
            onMouseEnter={e=>e.currentTarget.style.background=C.surface}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{ fontSize:20, flexShrink:0 }}>{typeIcon[ev.type]||"📁"}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:500, color:C.text }}>{ev.name}</span>
                {ev.locked && <Badge label="Locked" color={C.green} bg={C.greenDim} />}
              </div>
              <div style={{ fontSize:11, color:C.textDim }}>{ev.id} · {ev.type} · {ev.size}</div>
              <div style={{ fontSize:11, color:C.textDim, fontFamily:"monospace", marginTop:2 }}>SHA-256: {ev.sha256}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:12, color:C.textMid }}>{ev.uploaded}</div>
              <div style={{ fontSize:11, color:C.textDim }}>by {ev.by}</div>
              <div style={{ fontSize:11, color:C.blueHi, marginTop:2 }}>CoC events: {ev.coc}</div>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              <Btn size="sm" variant="ghost" onClick={()=>toast(`Hash verified ✓ — ${ev.sha256}`)}>Verify</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>toast(`Chain of custody: ${ev.coc} events logged`)}>CoC Log</Btn>
              {canLock && !ev.locked && <Btn size="sm" variant="gold" onClick={()=>{setEvidence(evidence.map(x=>x.id===ev.id?{...x,locked:true}:x));toast("Evidence locked — access restricted");}}>Lock</Btn>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ══════════════════════════════════════════════════════════════════════════════
function AuditLog({ user, toast }) {
  const [filter, setFilter] = useState("All");
  const types = ["All","upload","flag","approve","osint","review","admin"];

  const filtered = filter==="All" ? AUDIT_DATA : AUDIT_DATA.filter(a=>a.type===filter);
  const typeColor = { upload:C.blue, flag:C.red, approve:C.green, osint:C.gold, review:"#A78BFA", admin:C.textMid };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>Immutable Audit Log</h2>
          <div style={{ fontSize:12, color:C.textDim, marginTop:4 }}>All entries are cryptographically sealed and tamper-evident</div>
        </div>
        <Btn size="sm" variant="ghost" onClick={()=>toast("Audit log exported")}>↓ Export Log</Btn>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <Input placeholder="Filter by user, action, case..." style={{ flex:1 }} />
        <div style={{ display:"flex", gap:6 }}>
          {types.map(t=>(
            <button key={t} onClick={()=>setFilter(t)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===t?(typeColor[t]||C.border):C.border}`, cursor:"pointer",
                fontFamily:"inherit", fontSize:11, background:filter===t?(typeColor[t]||C.blue)+"22":"transparent",
                color:filter===t?(typeColor[t]||C.blue):C.textDim }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <SectionHeader label={`${filtered.length} Audit Entries`} action={<Badge label="Immutable" color={C.green} bg={C.greenDim} />} />
        {filtered.map((l,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"80px 140px 140px 1fr 100px", gap:0, padding:"12px 20px", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.surface}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:typeColor[l.type]||C.textMid, flexShrink:0 }} />
              <span style={{ fontSize:11, color:C.textDim }}>{l.time}</span>
            </div>
            <div style={{ fontSize:12, color:C.blueHi, fontWeight:500 }}>{l.user}</div>
            <div><Badge label={l.role} color={ROLES[l.role]?.color||C.textMid} bg={C.surface} /></div>
            <div style={{ fontSize:12, color:C.textMid, paddingRight:16 }}>{l.action}</div>
            <div style={{ fontSize:11, color:C.textDim, textAlign:"right" }}>{l.case}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ══════════════════════════════════════════════════════════════════════════════
function Integrations({ user, toast }) {
  const integrations = [
    { id:1, name:"Meridian Bank API",    type:"Banking",        status:"Connected",    lastSync:"09:40", calls:1243, health:99 },
    { id:2, name:"FIU National Database",type:"FIU",            status:"Connected",    lastSync:"08:15", calls:87,   health:100 },
    { id:3, name:"Customs & Tax System", type:"Government",     status:"Disconnected", lastSync:"N/A",   calls:0,    health:0 },
    { id:4, name:"Court Case Registry",  type:"Court",          status:"Pending",      lastSync:"N/A",   calls:0,    health:0 },
    { id:5, name:"Interpol I-24/7",      type:"Law Enforcement",status:"Connected",    lastSync:"07:00", calls:12,   health:97 },
  ];
  const [keys, setKeys] = useState([
    { id:1, name:"FIU Inbound Feed",    key:"ecs-k-****-****-8a2f", scope:"Read", created:"2024-01-01", active:true },
    { id:2, name:"Prosecution Export",  key:"ecs-k-****-****-3c7d", scope:"Write",created:"2024-01-10", active:true },
  ]);

  const statusColor = { Connected:C.green, Disconnected:C.red, Pending:C.gold };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
        <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>API & System Integrations</h2>
      </div>

      <Card style={{ marginBottom:20 }}>
        <SectionHeader label="External System Connections" action={<Btn size="sm" onClick={()=>toast("New integration setup wizard opened")}>+ Add Integration</Btn>} />
        {integrations.map(intg=>(
          <div key={intg.id} style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:16 }}
            onMouseEnter={e=>e.currentTarget.style.background=C.surface}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:statusColor[intg.status]||C.textMid, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{intg.name}</div>
              <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>{intg.type} · Last sync: {intg.lastSync} · {intg.calls.toLocaleString()} calls</div>
            </div>
            {intg.health>0 && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, color:C.green, fontWeight:600 }}>{intg.health}% uptime</div>
              </div>
            )}
            <Badge label={intg.status} color={statusColor[intg.status]} bg={statusColor[intg.status]+"22"} />
            <div style={{ display:"flex", gap:6 }}>
              {intg.status==="Connected" ? (
                <Btn size="sm" variant="ghost" onClick={()=>toast(`Disconnecting ${intg.name}...`)}>Disconnect</Btn>
              ) : (
                <Btn size="sm" onClick={()=>toast(`Connecting ${intg.name}... OAuth initiated`)}>Connect</Btn>
              )}
              <Btn size="sm" variant="ghost" onClick={()=>toast("Viewing API logs")}>Logs</Btn>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <SectionHeader label="API Key Management" action={<Btn size="sm" onClick={()=>{setKeys([...keys,{id:Date.now(),name:"New API Key",key:"ecs-k-****-****-"+Math.random().toString(16).slice(2,6),scope:"Read",created:"2024-01-25",active:true}]);toast("New API key generated");}}>Generate Key</Btn>} />
        {keys.map(k=>(
          <div key={k.id} style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{k.name}</div>
              <div style={{ fontSize:12, color:C.textDim, fontFamily:"monospace", marginTop:3 }}>{k.key}</div>
              <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>Scope: {k.scope} · Created: {k.created}</div>
            </div>
            <Badge label={k.active?"Active":"Revoked"} color={k.active?C.green:C.red} bg={k.active?C.greenDim:C.redDim} />
            <Btn size="sm" variant="danger" onClick={()=>{setKeys(keys.map(x=>x.id===k.id?{...x,active:false}:x));toast("API key revoked");}}>Revoke</Btn>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════════════════════
function Admin({ toast }) {
  const [users, setUsers] = useState(USERS.map(u=>({...u,active:true,lastLogin:"2024-01-25"})));

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", boxSizing:"border-box" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textDim, letterSpacing:"0.08em", marginBottom:4, textTransform:"uppercase" }}>Module</div>
        <h2 style={{ margin:0, fontSize:22, fontFamily:"'Playfair Display', serif", color:C.text }}>Administration</h2>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[{l:"Total Users",v:users.length,c:C.blue},{l:"Active Sessions",v:3,c:C.green},{l:"DB Size",v:"4.2 GB",c:C.gold},{l:"Uptime",v:"99.8%",c:C.green}].map(s=>(
          <Card key={s.l} style={{ padding:"16px 18px", borderTop:`2px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.06em", marginBottom:8, textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:26, fontWeight:600, color:C.text, fontFamily:"'Playfair Display', serif" }}>{s.v}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom:20 }}>
        <SectionHeader label="User Management" action={<Btn size="sm" onClick={()=>toast("New user invitation sent")}>+ Invite User</Btn>} />
        {users.map(u=>{
          const rc = ROLES[u.role]?.color || C.textMid;
          return (
            <div key={u.id} style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`${rc}22`, border:`1.5px solid ${rc}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:rc, flexShrink:0 }}>{u.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{u.name}</div>
                <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>{u.unit} · Last login: {u.lastLogin}</div>
              </div>
              <Badge label={u.role} color={rc} bg={rc+"22"} />
              <div style={{ display:"flex", gap:6 }}>
                <Btn size="sm" variant="ghost" onClick={()=>toast("Edit user dialog opened")}>Edit</Btn>
                <Btn size="sm" variant="ghost" onClick={()=>toast("Permissions matrix opened")}>Permissions</Btn>
                <Btn size="sm" variant="danger" onClick={()=>toast("User account suspended")}>Suspend</Btn>
              </div>
            </div>
          );
        })}
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:20 }}>
          <div style={{ fontSize:12, color:C.textDim, fontWeight:600, letterSpacing:"0.06em", marginBottom:14, textTransform:"uppercase" }}>System Configuration</div>
          {[["Case ID Prefix","ECS"],["Password Policy","90-day rotation"],["Session Timeout","30 minutes"],["MFA Required","Yes"],["Backup Schedule","Daily 02:00"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.textMid }}>{k}</span>
              <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop:14 }}><Btn size="sm" onClick={()=>toast("Configuration saved")}>Save Settings</Btn></div>
        </Card>
        <Card style={{ padding:20 }}>
          <div style={{ fontSize:12, color:C.textDim, fontWeight:600, letterSpacing:"0.06em", marginBottom:14, textTransform:"uppercase" }}>Workflow Stages</div>
          {STAGES.map((s,i)=>(
            <div key={s} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:11, color:C.textDim, width:16 }}>{i+1}.</span>
              <span style={{ fontSize:13, color:C.text, flex:1 }}>{s}</span>
              <Btn size="sm" variant="ghost" onClick={()=>toast("Stage config opened")}>Edit</Btn>
            </div>
          ))}
          <div style={{ marginTop:14 }}><Btn size="sm" variant="ghost" onClick={()=>toast("New stage added")}>+ Add Stage</Btn></div>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE VIEW (Case Initiator — Investigator only)
// ══════════════════════════════════════════════════════════════════════════════
function MobileView({ user, toast }) {
  const [mTab, setMTab] = useState("cases");
  const [form, setForm] = useState({ title:"", type:"AML", description:"" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ width:375, margin:"0 auto", height:"100%", display:"flex", flexDirection:"column", background:C.bg, overflow:"hidden", borderLeft:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}` }}>
      {/* Mobile Status Bar */}
      <div style={{ padding:"10px 20px 6px", display:"flex", justifyContent:"space-between", alignItems:"center", background:C.surface }}>
        <span style={{ fontSize:11, color:C.textDim }}>9:41</span>
        <span style={{ fontSize:12, fontWeight:700, color:C.text, letterSpacing:"0.05em" }}>ECS Mobile</span>
        <span style={{ fontSize:11, color:C.textDim }}>●●●</span>
      </div>

      {/* User badge */}
      <div style={{ padding:"12px 20px 10px", background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:"50%", background:`${ROLES[user.role]?.color||C.blue}33`, border:`2px solid ${ROLES[user.role]?.color||C.blue}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:ROLES[user.role]?.color||C.blue }}>{user.initials}</div>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{user.name}</div>
          <div style={{ fontSize:11, color:C.textDim }}>{user.role} · {user.unit}</div>
        </div>
        <div style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%", background:C.green }} />
      </div>

      {/* Tab Content */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {mTab==="cases" && (
          <div style={{ padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ margin:0, fontSize:17, fontFamily:"'Playfair Display',serif", color:C.text }}>My Cases</h3>
              <Btn size="sm" onClick={()=>setMTab("new")}>+ New</Btn>
            </div>
            {CASES_DATA.filter(c=>c.assignee===user.name).map(c=>{
              const rm = riskMeta(c.risk);
              return (
                <Card key={c.id} style={{ padding:"14px 16px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, color:C.blueHi }}>{c.id}</span>
                    <Badge label={c.risk} color={rm.color} bg={rm.bg} />
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>{c.title}</div>
                  <div style={{ fontSize:12, color:C.textDim, marginBottom:8 }}>{c.type} · {c.stage}</div>
                  <div style={{ height:3, background:C.border, borderRadius:2 }}>
                    <div style={{ height:"100%", background:C.blue, borderRadius:2, width:`${((STAGES.indexOf(c.stage)+1)/STAGES.length)*100}%` }} />
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <Btn size="sm" variant="secondary" onClick={()=>toast("Case opened")}>Open</Btn>
                    <Btn size="sm" variant="ghost" onClick={()=>toast("↑ Evidence upload")}>Upload Evidence</Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {mTab==="new" && (
          <div style={{ padding:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <button onClick={()=>setMTab("cases")} style={{ background:"none", border:"none", color:C.blue, cursor:"pointer", fontSize:16, padding:0 }}>←</button>
              <h3 style={{ margin:0, fontSize:17, fontFamily:"'Playfair Display',serif", color:C.text }}>New Case</h3>
            </div>
            {submitted ? (
              <Card style={{ padding:24, textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>✓</div>
                <div style={{ fontSize:16, fontWeight:600, color:C.green, marginBottom:8 }}>Case Submitted</div>
                <div style={{ fontSize:13, color:C.textDim, marginBottom:16 }}>ECS-2024-0072 has been created and assigned for review.</div>
                <Btn onClick={()=>{setSubmitted(false);setForm({title:"",type:"AML",description:""});setMTab("cases");}}>Back to Cases</Btn>
              </Card>
            ) : (
              <Card style={{ padding:16 }}>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:C.textDim, marginBottom:6 }}>Case Title *</div>
                  <Input placeholder="Brief case title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{ width:"100%", boxSizing:"border-box" }} />
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:C.textDim, marginBottom:6 }}>Case Type *</div>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
                    style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color:C.text, fontFamily:"inherit", fontSize:13 }}>
                    {["AML","Money Laundering","Trade Fraud","Crypto Crime","Corruption","Cyber-Enabled Crime","Fraud"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, color:C.textDim, marginBottom:6 }}>Description</div>
                  <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                    rows={4} placeholder="Brief description of the suspected crime..."
                    style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color:C.text, fontFamily:"inherit", fontSize:13, resize:"none", boxSizing:"border-box", outline:"none" }} />
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:C.textDim, marginBottom:6 }}>Initial Evidence</div>
                  <div style={{ background:C.bg, border:`2px dashed ${C.border}`, borderRadius:8, padding:16, textAlign:"center", cursor:"pointer" }}
                    onClick={()=>toast("File picker opened — select evidence")}>
                    <div style={{ fontSize:13, color:C.textDim }}>↑ Upload evidence file</div>
                  </div>
                </div>
                <Btn style={{ width:"100%" }} onClick={()=>{ if(!form.title){toast("Case title required");return;} setSubmitted(true);toast("Case ECS-2024-0072 submitted"); }}>Submit Case</Btn>
              </Card>
            )}
          </div>
        )}

        {mTab==="evidence" && (
          <div style={{ padding:16 }}>
            <h3 style={{ margin:"0 0 14px", fontSize:17, fontFamily:"'Playfair Display',serif", color:C.text }}>Evidence Uploads</h3>
            {EVIDENCE_DATA.filter((_,i)=>i<2).map(ev=>(
              <Card key={ev.id} style={{ padding:"13px 15px", marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:4 }}>{ev.name}</div>
                <div style={{ fontSize:11, color:C.textDim }}>{ev.id} · {ev.size}</div>
                <div style={{ fontSize:11, color:C.textDim, fontFamily:"monospace", marginTop:3 }}>SHA-256: {ev.sha256}</div>
                {ev.locked && <Badge label="Locked" color={C.green} bg={C.greenDim} />}
              </Card>
            ))}
            <div style={{ background:C.bg, border:`2px dashed ${C.border}`, borderRadius:8, padding:24, textAlign:"center", cursor:"pointer", marginTop:8 }}
              onClick={()=>toast("File picker opened — SHA-256 will be auto-generated")}>
              <div style={{ fontSize:20, marginBottom:6 }}>↑</div>
              <div style={{ fontSize:13, color:C.textDim }}>Upload New Evidence</div>
              <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>Auto-hashed on upload</div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div style={{ display:"flex", borderTop:`1px solid ${C.border}`, background:C.surface }}>
        {[{id:"cases",label:"Cases",icon:"◫"},{id:"new",label:"New Case",icon:"+"},{id:"evidence",label:"Evidence",icon:"◉"}].map(t=>(
          <button key={t.id} onClick={()=>setMTab(t.id)}
            style={{ flex:1, padding:"12px 4px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit",
              color:mTab===t.id?ROLES[user.role]?.color||C.blue:C.textDim,
              borderTop:`2px solid ${mTab===t.id?ROLES[user.role]?.color||C.blue:"transparent"}`,
              display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:mTab===t.id?600:400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function ECS() {
  const [user, setUser] = useState(USERS[0]);
  const [platform, setPlatform] = useState("Web");
  const [module, setModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState({ msg:"", visible:false });
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, visible:true });
    toastTimer.current = setTimeout(() => setToast(t=>({...t,visible:false})), 3000);
  }, []);

  const roleData = ROLES[user.role];
  const availableModules = ALL_MODULES.filter(m => roleData.modules.includes(m.id));
  const availablePlatforms = roleData.platforms;

  // Ensure current platform is valid for role
  const effectivePlatform = availablePlatforms.includes(platform) ? platform : availablePlatforms[0];

  const isMobile = effectivePlatform === "Mobile";
  const roleColor = roleData.color;

  const switchUser = (u) => {
    setUser(u);
    const newRole = ROLES[u.role];
    if (!newRole.modules.includes(module)) setModule("dashboard");
    setPlatform(newRole.platforms[0]);
    showToast(`Switched to ${u.name} · ${u.role}`);
  };

  const renderModule = () => {
    const props = { user, toast:showToast, cases:CASES_DATA, txns:TXN_DATA, log:AUDIT_DATA };
    switch(module) {
      case "dashboard":    return <Dashboard {...props} onCaseClick={(c)=>{setModule("cases");}}/>;
      case "cases":        return <Cases {...props} />;
      case "financial":    return <Financial {...props} />;
      case "evidence":     return <Evidence {...props} />;
      case "osint":        return <OSINT {...props} />;
      case "network":      return <Network {...props} />;
      case "crypto":       return <Crypto {...props} />;
      case "audit":        return <AuditLog {...props} />;
      case "integrations": return <Integrations {...props} />;
      case "admin":        return <Admin toast={showToast} />;
      default:             return <Dashboard {...props} onCaseClick={(c)=>{setModule("cases");}}/>;
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:C.bg, color:C.text, height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{FONTS}{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:${C.borderHi}; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        input:focus, textarea:focus, select:focus { border-color:${C.blue} !important; }
        button:hover { opacity:0.88; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ height:52, background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 20px", gap:20, flexShrink:0, zIndex:10 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:32, height:32, background:`linear-gradient(135deg, ${C.blue}, ${C.blueDim})`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:14, height:14, border:`2px solid #fff`, borderRadius:2 }} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, letterSpacing:"0.06em" }}>ECS</div>
            <div style={{ fontSize:9, color:C.textDim, letterSpacing:"0.12em", lineHeight:1 }}>ECONOMIC CRIMES</div>
          </div>
        </div>

        {/* Platform Switcher */}
        <div style={{ display:"flex", gap:2, background:C.bg, borderRadius:8, padding:3, border:`1px solid ${C.border}` }}>
          {availablePlatforms.map(p=>(
            <button key={p} onClick={()=>setPlatform(p)}
              style={{ padding:"4px 14px", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:500,
                background:effectivePlatform===p?C.card:"transparent",
                color:effectivePlatform===p?C.text:C.textDim,
                boxShadow:effectivePlatform===p?`0 0 0 1px ${C.border}`:"none",
                transition:"all 0.15s" }}>
              {p === "Mobile" ? "📱 Mobile" : p === "Web" ? "🌐 Web" : "🖥 Desktop"}
            </button>
          ))}
        </div>

        <div style={{ flex:1 }} />

        {/* Sync */}
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.green }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }} />
          Online · Synced
        </div>

        {/* User Switcher */}
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:11, color:C.textDim }}>Switch role:</span>
          {USERS.map(u=>{
            const rc = ROLES[u.role]?.color || C.blue;
            return (
              <div key={u.id} onClick={()=>switchUser(u)} title={`${u.name} · ${u.role}`}
                style={{ width:32, height:32, borderRadius:"50%", background:`${rc}22`, border:`2px solid ${user.id===u.id?rc:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:11, fontWeight:700, color:rc, transition:"all 0.15s" }}>
                {u.initials}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* SIDEBAR (desktop/web only) */}
        {!isMobile && (
          <div style={{ width:sidebarOpen?220:56, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transition:"width 0.2s ease", flexShrink:0, overflow:"hidden" }}>
            {/* Role pill */}
            <div style={{ padding:"14px 14px 10px", borderBottom:`1px solid ${C.border}` }}>
              {sidebarOpen ? (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:`${roleColor}22`, border:`2px solid ${roleColor}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:roleColor, flexShrink:0 }}>{user.initials}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
                    <div style={{ fontSize:10, color:roleColor, fontWeight:500, letterSpacing:"0.04em" }}>{user.role}</div>
                  </div>
                </div>
              ) : (
                <div style={{ width:36, height:36, borderRadius:"50%", background:`${roleColor}22`, border:`2px solid ${roleColor}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:roleColor, margin:"0 auto" }}>{user.initials}</div>
              )}
            </div>

            {/* Nav items */}
            <div style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
              {sidebarOpen && (
                <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.1em", padding:"4px 8px 8px", textTransform:"uppercase" }}>Navigation</div>
              )}
              {availableModules.map(m=>{
                const active = module===m.id;
                return (
                  <div key={m.id} onClick={()=>setModule(m.id)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 10px", borderRadius:8, cursor:"pointer", marginBottom:2,
                      background:active?`${roleColor}15`:"transparent",
                      color:active?roleColor:C.textMid,
                      transition:"all 0.12s",
                      borderLeft:active?`2px solid ${roleColor}`:"2px solid transparent" }}>
                    <span style={{ fontSize:16, flexShrink:0, width:18, textAlign:"center" }}>{m.icon}</span>
                    {sidebarOpen && <span style={{ fontSize:13, fontWeight:active?600:400, whiteSpace:"nowrap" }}>{m.label}</span>}
                  </div>
                );
              })}
            </div>

            {/* Collapse */}
            <div onClick={()=>setSidebarOpen(!sidebarOpen)}
              style={{ padding:"12px 14px", borderTop:`1px solid ${C.border}`, cursor:"pointer", display:"flex", justifyContent:sidebarOpen?"flex-end":"center", color:C.textDim, fontSize:14 }}>
              {sidebarOpen ? "◂" : "▸"}
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", justifyContent:isMobile?"center":"stretch" }}>
          {isMobile ? <MobileView user={user} toast={showToast} /> : (
            <div style={{ flex:1, overflow:"hidden", animation:"fadeUp 0.25s ease" }}>
              {renderModule()}
            </div>
          )}
        </div>
      </div>

      <Toast msg={toast.msg} visible={toast.visible} />
    </div>
  );
}
