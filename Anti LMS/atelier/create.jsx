/* ATELIER — Create (AI course generation) */

function GenOutline({ data, go }){
  return (
    <div className="gen reveal">
      <div className="gen-head">
        <AIglyph size={18} color="var(--blue)"/>
        <div>
          <div style={{fontFamily:"var(--f-display)",fontWeight:800,fontSize:18}}>{data.title}</div>
          <div className="num" style={{fontSize:12,color:"var(--ink-2)",marginTop:2}}>{data.meta}</div>
        </div>
      </div>
      <div className="gen-outline">
        {data.rows.map((r,i)=>(
          <div className="gen-row reveal" key={i} style={{animationDelay:(0.12*i+0.1)+"s"}}>
            <span className="gn">{String(i+1).padStart(2,"0")}</span>
            <div>
              <div className="gt">{r.t}</div>
              <div className="gd">{r.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="gen-foot">
        <span className="eyebrow" style={{display:"flex",alignItems:"center",gap:7}}><AIglyph size={13}/> EDITABLE · ADAPTS AS YOU LEARN</span>
        <div style={{display:"flex",gap:10}}>
          <button className="btn ghost sm">Refine</button>
          <button className="btn blue" onClick={()=>go("course","creative-mind")}>Start course <I.arrow className="arrow" style={{width:18,height:18}}/></button>
        </div>
      </div>
    </div>
  );
}

function Create({ go }){
  const seed = (typeof window!=="undefined" && window.__seedPrompt) || "";
  const [q,setQ]=useState(seed);
  const [phase,setPhase]=useState("idle"); // idle | thinking | done
  const inputRef=useRef(null);

  useEffect(()=>{ window.__seedPrompt=""; if(inputRef.current) inputRef.current.focus(); },[]);

  const generate=()=>{
    if(!q.trim()) return;
    setPhase("thinking");
    setTimeout(()=>setPhase("done"), 1700);
  };

  const examples=[
    "Teach me to design with constraints",
    "I want to draw every day",
    "Help me find my writing voice",
    "Color theory for non-designers",
  ];

  return (
    <div className="screen">
      <TopBar title="Create" sub="AI COURSE BUILDER"/>
      <div className="create">
        <div className="eyebrow" style={{display:"flex",alignItems:"center",gap:8}}><AIglyph size={15}/> DESCRIBE IT — ATELIER BUILDS IT</div>
        <h1 className="display big">Turn a sentence<br/>into a course.</h1>
        <p className="lede" style={{maxWidth:560,marginTop:8}}>
          Say what you want to learn in plain words. The AI drafts a structured path,
          writes the lessons, and adapts as you go.
        </p>

        <div className="promptbox">
          <AIglyph size={22} color="var(--blue)"/>
          <input
            ref={inputRef}
            value={q}
            onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") generate(); }}
            placeholder="e.g. I want to get better at telling stories…"
          />
          <button className="btn blue" onClick={generate} disabled={phase==="thinking"}>
            {phase==="thinking" ? "Thinking…" : "Generate"} {phase!=="thinking" && <I.arrow className="arrow" style={{width:18,height:18}}/>}
          </button>
        </div>

        {phase==="idle" && (
          <div className="suggest" style={{marginTop:18}}>
            {examples.map(s=>(
              <button key={s} className="chip" onClick={()=>setQ(s)}>{s}</button>
            ))}
          </div>
        )}

        {phase==="thinking" && (
          <div className="gen reveal" style={{marginTop:38}}>
            <div className="gen-head">
              <AIglyph size={18} color="var(--blue)"/>
              <div style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--ink-2)"}}>
                Drafting your path
                <span className="thinking" style={{marginLeft:8}}><i></i><i></i><i></i></span>
              </div>
            </div>
            <div className="gen-outline">
              {[0,1,2,3].map(i=>(
                <div className="gen-row" key={i} style={{opacity:.5}}>
                  <span className="gn">{String(i+1).padStart(2,"0")}</span>
                  <div style={{width:"100%"}}>
                    <div style={{height:14,width:(60-i*8)+"%",background:"var(--paper-3)",borderRadius:6}}></div>
                    <div style={{height:10,width:(85-i*6)+"%",background:"var(--paper-3)",borderRadius:6,marginTop:8,opacity:.6}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase==="done" && <GenOutline data={GEN_OUTLINE} go={go}/>}
      </div>
    </div>
  );
}

Object.assign(window, { Create });
