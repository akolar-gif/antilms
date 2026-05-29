/* ATELIER — Course detail + Lesson reader with AI assistant */

function CourseOverview({ course, openLesson, go }){
  return (
    <div className="screen">
      <TopBar title="Library" sub="COURSE"/>
      <div style={{padding:"16px var(--pad) 0"}}>
        <button className="btn ghost sm" onClick={()=>go("library")}><I.back style={{width:16,height:16}}/> Library</button>
      </div>

      <div className="course-hero">
        <div className="ch-left">
          <div className="eyebrow">№ {course.no} · {course.tag.toUpperCase()}</div>
          <h1 className="display">{course.title}</h1>
          <p className="lede" style={{maxWidth:520}}>{course.blurb}</p>
          <div style={{display:"flex",gap:10,marginTop:26,flexWrap:"wrap"}}>
            <button className="btn solid" onClick={()=>openLesson(3)}><I.play style={{width:16,height:16}}/> Resume · Lesson 04</button>
            <button className="btn ghost"><AIglyph size={16}/> Summarize course</button>
          </div>
        </div>
        <div className="ch-right">
          <Slot id={"cover-"+course.id} src={photo(course.kw, course.lock, 1000, 640)} placeholder={"drop a cover · "+course.title.toLowerCase()} shape="rounded" radius={14} style={{width:"100%",aspectRatio:"16/10",display:"block"}}/>
          <div className="statline">
            <div className="s"><div className="v num">{course.lessons}</div><div className="l">Lessons</div></div>
            <div className="s"><div className="v num">{course.minutes}'</div><div className="l">Total</div></div>
            <div className="s"><div className="v num">{Math.round(course.progress*100)}%</div><div className="l">Done</div></div>
          </div>
          <div style={{border:"1.5px solid var(--line)",borderRadius:14,padding:18,display:"flex",gap:12,alignItems:"flex-start",background:"var(--paper-2)"}}>
            <AIglyph size={18} color="var(--blue)" style={{flex:"0 0 auto",marginTop:2}}/>
            <div>
              <div style={{fontFamily:"var(--f-display)",fontWeight:700,fontSize:14,marginBottom:4}}>Tuned for you</div>
              <div style={{fontSize:13,color:"var(--ink-2)",lineHeight:1.5}}>You learn best in short bursts. The AI split lesson 04 into two sittings and queued a remix exercise.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec-head"><h2>Lessons</h2><span className="meta">№ {String(course.lessons).padStart(2,"0")}</span></div>
      <div className="lessons">
        {LESSONS.map((l,i)=>(
          <button className="lesson-row" key={l.n} onClick={()=>openLesson(i)}>
            <span className={"state-dot"+(l.state==="done"?" done":"")+(l.state==="now"?" now":"")}>
              {l.state==="done" ? <I.check style={{width:13,height:13}}/> : l.state==="now" ? <I.play style={{width:11,height:11}}/> : <span className="num" style={{fontSize:11}}>{l.n}</span>}
            </span>
            <div>
              <div className="lt">{l.t}</div>
              <div className="ls">{l.s}</div>
            </div>
            <div className="rgt">
              <span><I.clock style={{width:14,height:14,verticalAlign:"-2px"}}/> {l.min}'</span>
              <I.arrow style={{width:18,height:18,color:"var(--ink-3)"}}/>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------- AI Assistant panel ------------- */
const TOOLS=[
  { id:"sum", name:"Summarize", desc:"3 bullets, this page" },
  { id:"explain", name:"Re-explain", desc:"Simpler, with an analogy" },
  { id:"quiz", name:"Quiz me", desc:"Check what stuck" },
  { id:"deeper", name:"Go deeper", desc:"An expert-level angle" },
];

const CANNED={
  sum:"Here's this page in three:\n• Every idea is a recombination of existing parts — nothing comes from nothing.\n• Your job shifts from \u201Cinvent\u201D to \u201Cconnect\u201D once you collect raw material.\n• Remixing ≠ copying: take the structure, transform the surface.",
  explain:"Think of ideas like cooking. You don't invent flavours from thin air — you combine ingredients you already have in new ratios. A great chef isn't magic; they just taste widely and remix boldly. Collect more 'ingredients' (inputs) and your dishes (ideas) get richer.",
  quiz:"Quick check: in your own words, what's the difference between remixing and copying? Type your answer and I'll give you feedback.",
  deeper:"Going deeper: Brian Eno's 'scenius' reframes creativity as a property of communities, not lone individuals. Remixing is how a scene's ideas circulate and mutate. Want a reading list to chase this idea further?",
};

function Assistant({ onClose }){
  const [feed,setFeed]=useState([
    { who:"ai", text:"I'm reading this lesson with you. Ask me anything, or use a tool above to summarize, re-explain, or quiz yourself." },
  ]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const feedRef=useRef(null);

  useEffect(()=>{ if(feedRef.current) feedRef.current.scrollTop=feedRef.current.scrollHeight; },[feed,busy]);

  const respond=(text)=>{
    setBusy(true);
    setTimeout(()=>{
      setFeed(f=>[...f,{ who:"ai", text }]);
      setBusy(false);
    }, 1100);
  };
  const runTool=(id)=>{
    const labels={sum:"Summarize this page",explain:"Re-explain this simply",quiz:"Quiz me on this",deeper:"Go deeper"};
    setFeed(f=>[...f,{ who:"me", text:labels[id] }]);
    respond(CANNED[id]);
  };
  const send=()=>{
    if(!input.trim()) return;
    const t=input; setInput("");
    setFeed(f=>[...f,{ who:"me", text:t }]);
    respond("Good question. The lesson would say: collect more inputs, then look for the unlikely connection between two of them. Try pairing this idea with something from a totally different field you know well — that's where originality hides.");
  };

  return (
    <aside className="assistant">
      <div className="asst-head">
        <AIglyph size={20} color="var(--blue)"/>
        <div>
          <div className="ttl">AI Tutor</div>
          <div className="sub">CONTEXT: LESSON 04</div>
        </div>
        <button className="asst-close" onClick={onClose} aria-label="Close tutor"><I.back style={{width:18,height:18,transform:"rotate(-90deg)"}}/></button>
      </div>
      <div className="asst-tools">
        {TOOLS.map(t=>(
          <button key={t.id} className="tool" onClick={()=>runTool(t.id)}>
            <span className="tname">{t.name}</span>
            <span className="tdesc">{t.desc}</span>
          </button>
        ))}
      </div>
      <div className="asst-feed" ref={feedRef}>
        {feed.map((m,i)=>(
          <div key={i} className={"msg "+m.who}>
            <div className="who">{m.who==="ai"?"ATELIER AI":"YOU"}</div>
            <div className="bubble" style={{whiteSpace:"pre-line"}}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div className="msg ai">
            <div className="who">ATELIER AI</div>
            <div className="bubble"><span className="thinking"><i></i><i></i><i></i></span></div>
          </div>
        )}
      </div>
      <div className="asst-input">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") send(); }} placeholder="Ask the tutor…"/>
        <button className="send" onClick={send}><I.send style={{width:20,height:20}}/></button>
      </div>
    </aside>
  );
}

function LessonReader({ go, backToCourse }){
  const r=READING;
  const [tutorOpen,setTutorOpen]=useState(false);
  return (
    <div className="screen">
      <TopBar title="The Creative Mind" sub="LESSON 04 / 08"/>
      <div className={"reader-wrap"+(tutorOpen?" tutor-open":"")}>
        <article className="reader">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
            <button className="btn ghost sm" onClick={backToCourse}><I.back style={{width:16,height:16}}/> All lessons</button>
            <span className="eyebrow">{r.no}</span>
          </div>
          <h1>{r.title}</h1>
          {r.body.map((b,i)=>{
            if(b.type==="p") return <p key={i}>{b.text}</p>;
            if(b.type==="h") return <h3 key={i}>{b.text}</h3>;
            if(b.type==="pull") return <p key={i} className="pull">{b.text}</p>;
            if(b.type==="img") return <Slot key={i} id="lesson-04-diagram" src={photo("art,studio,workspace",4,1000,560)} placeholder={b.cap} shape="rounded" radius={14} style={{width:"100%",aspectRatio:"16/9",display:"block",margin:"26px 0"}}/>;
            return null;
          })}
          <div style={{display:"flex",gap:12,marginTop:40,paddingTop:28,borderTop:"1.5px solid var(--line)",flexWrap:"wrap"}}>
            <button className="btn solid" onClick={()=>go("quiz")}>Practice this <I.arrow className="arrow" style={{width:18,height:18}}/></button>
            <button className="btn ghost" onClick={backToCourse}>Next lesson</button>
          </div>
        </article>
        <Assistant onClose={()=>setTutorOpen(false)}/>
      </div>
      <button className="tutor-fab" onClick={()=>setTutorOpen(o=>!o)} aria-label="AI Tutor">
        <AIglyph size={22} color="var(--on-blue)"/>
        <span>Ask the tutor</span>
      </button>
    </div>
  );
}

function Course({ courseId, go }){
  const course = COURSES.find(c=>c.id===courseId) || COURSES[0];
  const [lessonOpen,setLessonOpen]=useState(false);
  // reset when course changes
  useEffect(()=>{ setLessonOpen(false); },[courseId]);

  if(lessonOpen){
    return <LessonReader go={go} backToCourse={()=>setLessonOpen(false)}/>;
  }
  return <CourseOverview course={course} openLesson={()=>setLessonOpen(true)} go={go}/>;
}

Object.assign(window, { Course });
