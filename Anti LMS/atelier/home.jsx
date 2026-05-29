/* ATELIER — Home / Dashboard */

function ContinueCard({ go }){
  const [w,setW]=useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setW(38),350); return ()=>clearTimeout(t); },[]);
  return (
    <div className="continue">
      <div className="meta">
        <span className="eyebrow" style={{color:"color-mix(in oklab,var(--on-blue) 70%,transparent)"}}>NOW PLAYING · LESSON 04</span>
      </div>
      <div>
        <div className="eyebrow" style={{color:"color-mix(in oklab,var(--on-blue) 70%,transparent)",marginBottom:8}}>THE CREATIVE MIND</div>
        <div className="title">Borrowing &amp; Remixing</div>
      </div>
      <div>
        <div className="progress-line"><i style={{width:w+"%"}}></i></div>
        <div className="num" style={{fontSize:12,marginTop:8,opacity:.8}}>38% · 14 min left</div>
      </div>
      <button className="resume" onClick={()=>go("course","creative-mind")}>
        Resume lesson <I.arrow className="arrow" style={{width:22,height:22}}/>
      </button>
    </div>
  );
}

function Poster({ c, go }){
  const cls = c.color==="paper" ? "" : c.color;
  if(c.photo){
    return (
      <button className="poster photo" onClick={()=>go("course", c.id)}>
        <Slot id={c.slot} src={photo(c.kw, c.lock)} placeholder={"drop a cover · "+c.title.toLowerCase()} shape="rect"/>
        <div className="pinner">
          <div className="top">
            <span className="no">№ {c.no}</span>
            <span className="tag">{c.tag}</span>
          </div>
          <div className="ptitle" style={{marginTop:"auto"}}>{c.title}</div>
          <div className="pmeta">
            <span>{c.lessons} lessons</span>
            <span>{c.minutes} min</span>
          </div>
        </div>
      </button>
    );
  }
  return (
    <button className={"poster "+cls} onClick={()=>go("course", c.id)}>
      {c.ai && <span className="ai-flag"><AIChip label="AI-made"/></span>}
      <div className="top">
        <span className="no">№ {c.no}</span>
        {!c.ai && <span className="tag">{c.tag}</span>}
      </div>
      <div className="ptitle">{c.title}</div>
      <div className="pmeta">
        <span>{c.lessons} lessons</span>
        <span>{c.minutes} min</span>
      </div>
      {c.progress>0 ? (
        <div className="pbar"><i style={{width:(c.progress*100)+"%"}}></i></div>
      ) : (
        <div className="pmeta" style={{marginTop:14,opacity:.7}}><span>{c.level}</span></div>
      )}
    </button>
  );
}

function PathRow({ go }){
  return (
    <div className="pad">
      <div className="path">
        {PATH.map((s,i)=>(
          <div key={i} className={"step"+(s.done?" done":"")} onClick={()=>go(s.done?"course":(i===2?"create":"course"),"creative-mind")}>
            {s.done && <span className="tick"><span className="state-dot done" style={{width:20,height:20}}><I.check style={{width:12,height:12}}/></span></span>}
            <div className="k">{s.k}</div>
            <div className="st">{s.title}</div>
            <div className="why">{s.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Home({ go }){
  const [q,setQ]=useState("");
  const submit=()=>{ window.__seedPrompt = q || ""; go("create"); };
  const suggestions=["Improve my photography eye","Write better, faster","Find my visual style"];

  return (
    <div className="screen">
      <TopBar title="Studio" sub="TUESDAY · 29 MAY"/>

      {/* HERO */}
      <div className="lattice hero-grid">
        <div className="cell">
          <div className="eyebrow" style={{marginBottom:18}}>WELCOME BACK, MARA</div>
          <h1 className="display hero-display">
            What will you <span className="stroke">make</span><br/>today?
          </h1>
          <p className="lede" style={{marginTop:22,maxWidth:520}}>
            Your studio is tuned to where you are. Pick up a lesson, train a skill,
            or let the AI build you something new from a single sentence.
          </p>
        </div>
        <div className="cell blue">
          <span className="corner-no" style={{color:"color-mix(in oklab,var(--on-blue) 70%,transparent)"}}>CONT.</span>
          <ContinueCard go={go}/>
        </div>
      </div>

      {/* AI PROMPT */}
      <div className="lattice" style={{gridTemplateColumns:"1fr"}}>
        <div className="cell p2">
          <div className="eyebrow" style={{marginBottom:16,display:"flex",alignItems:"center",gap:8}}><AIglyph size={15}/> CREATE WITH AI</div>
          <div className="aibar">
            <div className="field">
              <AIglyph size={20} color="var(--blue)"/>
              <input
                value={q}
                onChange={e=>setQ(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") submit(); }}
                placeholder="Describe anything you want to learn…"
              />
            </div>
            <button className="btn blue" onClick={submit}>Generate course <I.arrow className="arrow" style={{width:18,height:18}}/></button>
          </div>
          <div className="suggest" style={{marginTop:16}}>
            {suggestions.map(s=>(
              <button key={s} className="chip" onClick={()=>{ window.__seedPrompt=s; go("create"); }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED — image band */}
      <div className="featured invert">
        <div className="fx">
          <span className="ftag">Editor's pick</span>
          <Slot id="feat-home" src={photo("photography,camera,street",7)} placeholder="drop a featured image" shape="rect"/>
        </div>
        <div className="fbody">
          <div className="eyebrow" style={{color:"color-mix(in oklab,var(--paper) 70%,transparent)"}}>WORKSHOP № 07</div>
          <h2 className="display">See like a<br/>photographer</h2>
          <p className="lede">A hands-on week on framing, light and seeing. Shoot daily, get AI critique on every frame, and watch your eye sharpen.</p>
          <button className="btn coral" style={{alignSelf:"flex-start"}} onClick={()=>go("course","composition")}>Open workshop <I.arrow className="arrow" style={{width:18,height:18}}/></button>
        </div>
      </div>

      {/* AI PATH */}
      <div className="sec-head">
        <h2>Your path</h2>
        <span className="meta" style={{display:"flex",alignItems:"center",gap:7}}><AIglyph size={13}/> TUNED BY AI · UPDATED TODAY</span>
      </div>
      <PathRow go={go}/>

      {/* LIBRARY */}
      <div className="sec-head">
        <h2>Library</h2>
        <span className="meta">№ {String(COURSES.length).padStart(2,"0")} COURSES</span>
      </div>
      <div className="courses">
        {COURSES.map(c=><Poster key={c.id} c={c} go={go}/>)}
      </div>

      {/* PRACTICE TEASER */}
      <div className="lattice teaser-grid">
        <div className="cell ink" style={{display:"flex",flexDirection:"column",justifyContent:"space-between",gap:24,minHeight:200}}>
          <div className="eyebrow" style={{color:"color-mix(in oklab,var(--paper) 70%,transparent)"}}>DAILY TRAINING</div>
          <h2 className="h-lg" style={{fontSize:"clamp(28px,3.4vw,48px)",textTransform:"uppercase"}}>Three questions.<br/>AI grades them.</h2>
          <button className="btn coral" style={{alignSelf:"flex-start"}} onClick={()=>go("quiz")}>Train now <I.arrow className="arrow" style={{width:18,height:18}}/></button>
        </div>
        <div className="cell" style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:14}}>
          <div className="eyebrow">THIS WEEK</div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:90}}>
            {[40,65,30,80,55,90,20].map((h,i)=>(
              <div key={i} style={{flex:1,height:h+"%",background:i===5?"var(--coral)":"var(--paper-3)",borderRadius:4,transition:"height .6s "+(i*0.05)+"s"}}></div>
            ))}
          </div>
          <div className="num" style={{fontSize:12,color:"var(--ink-2)"}}>MON — SUN · 6 of 7 days active</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Home });
