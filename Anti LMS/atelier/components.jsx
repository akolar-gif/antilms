/* ATELIER — shared components & icons */
const { useState, useEffect, useRef } = React;

/* ---------------- icons (simple geometric strokes) ---------------- */
const I = {
  home:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11 12 4l9 7"/><path d="M5 10v9h14v-9"/></svg>),
  create:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v16M4 12h16"/></svg>),
  library:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>),
  practice:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 4 7v6c0 4 3.5 6.5 8 8 4.5-1.5 8-4 8-8V7l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>),
  search:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>),
  arrow:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  back:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>),
  check:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m5 12 5 5 9-10"/></svg>),
  play:(p)=>(<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 5v14l12-7z"/></svg>),
  send:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12 20 4l-6 16-3-7-7-1Z"/></svg>),
  clock:(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>),
};

/* Atelier mark — echoes the editorial bar-mark of the reference */
function Mark({ size=44, color="var(--ink)" }){
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-label="Atelier">
      <rect x="9"  y="10" width="3" height="24" fill={color}/>
      <rect x="16" y="6"  width="3" height="32" fill={color}/>
      <rect x="23" y="14" width="3" height="16" fill={color}/>
      <rect x="30" y="6"  width="3" height="32" fill={color}/>
      <circle cx="24.5" cy="35" r="2" fill={color}/>
    </svg>
  );
}

/* sparkle / AI glyph (simple) */
function AIglyph({ size=22, color="currentColor" }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>
      <path d="M12 9a3 3 0 0 0 3 3 3 3 0 0 0-3 3 3 3 0 0 0-3-3 3 3 0 0 0 3-3Z" fill={color} stroke="none"/>
    </svg>
  );
}

/* AI badge pill */
function AIChip({ label="AI" }){
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontFamily:"var(--f-mono)",fontSize:10,letterSpacing:".12em",textTransform:"uppercase"}}>
      <AIglyph size={13}/> {label}
    </span>
  );
}

function Slot({ id, placeholder, shape="rounded", radius=12, mask, src, style }){
  const stripe = "repeating-linear-gradient(135deg, var(--paper-2) 0 13px, var(--paper-3) 13px 26px)";
  const props = { id, placeholder, shape };
  if(mask) props.mask = mask; else props.radius = radius;
  if(src) props.src = src;
  return React.createElement("image-slot", { ...props, style:{ background:stripe, ...(style||{}) } });
}

// topical real demo photos (LoremFlickr) — deterministic via lock, user can drop their own
function photo(kw, lock, w=900, h=640){
  return "https://loremflickr.com/"+w+"/"+h+"/"+encodeURIComponent(kw)+"?lock="+lock;
}

function Rail({ view, go }){
  const items = [
    { id:"home", icon:I.home, label:"Home" },
    { id:"create", icon:I.create, label:"Create", create:true },
    { id:"library", icon:I.library, label:"Library" },
    { id:"practice", icon:I.practice, label:"Train" },
  ];
  return (
    <aside className="rail">
      <button className="brand" onClick={()=>go("home")} title="Atelier" style={{background:"none",border:"none"}}>
        <Mark size={40}/>
      </button>
      <nav className="nav">
        {items.map(it=>{
          const Icon = it.icon;
          const active = view===it.id || (it.id==="library" && view==="course") || (it.id==="practice" && view==="quiz");
          return (
            <button key={it.id} className={"nav-btn"+(active?" active":"")+(it.create?" is-create":"")} onClick={()=>go(it.id)}>
              <Icon/><span className="nlabel">{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="spacer"></div>
      <div className="avatar" title="Mara">M</div>
    </aside>
  );
}

function MobileTabs({ view, go }){
  const items=[
    { id:"home", icon:I.home, label:"Home" },
    { id:"create", icon:I.create, label:"Create", create:true },
    { id:"library", icon:I.library, label:"Library" },
    { id:"practice", icon:I.practice, label:"Train" },
  ];
  return (
    <nav className="mtab">
      {items.map(it=>{
        const Icon=it.icon;
        const active = view===it.id || (it.id==="library"&&view==="course") || (it.id==="practice"&&view==="quiz");
        return (
          <button key={it.id} className={"nav-btn"+(active?" active":"")+(it.create?" is-create":"")} onClick={()=>go(it.id)}>
            <Icon/><span className="nlabel">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TopBar({ title, sub, right }){
  return (
    <header className="topbar">
      <div className="tb-left">
        <div>
          <div className="eyebrow">{sub}</div>
          <div style={{fontFamily:"var(--f-display)",fontWeight:800,fontSize:18,marginTop:2,textTransform:"uppercase",letterSpacing:"-.01em"}}>{title}</div>
        </div>
      </div>
      <div className="tb-right">
        <label className="search">
          <I.search style={{width:18,height:18}}/>
          <input placeholder="Search or ask anything…" />
        </label>
        {right}
        <div className="streak">
          <span className="dot"></span>
          <span className="num">12</span>
          <span className="lbl" style={{color:"var(--ink-2)",fontWeight:400}}>day streak</span>
        </div>
      </div>
    </header>
  );
}

/* typing hook — reveals text char by char */
function useTyping(text, active, speed=14){
  const [out,setOut]=useState("");
  useEffect(()=>{
    if(!active){ setOut(""); return; }
    let i=0; setOut("");
    const id=setInterval(()=>{
      i++; setOut(text.slice(0,i));
      if(i>=text.length) clearInterval(id);
    }, speed);
    return ()=>clearInterval(id);
  },[text,active,speed]);
  return out;
}

Object.assign(window, { I, Mark, AIglyph, AIChip, Slot, photo, Rail, MobileTabs, TopBar, useTyping });
