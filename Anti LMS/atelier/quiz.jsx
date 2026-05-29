/* ATELIER — Practice / Quiz with AI feedback */

function Quiz({ go }){
  const [idx,setIdx]=useState(0);
  const [picked,setPicked]=useState(null);
  const [done,setDone]=useState(false);
  const [score,setScore]=useState(0);

  const q=QUIZ[idx];
  const total=QUIZ.length;
  const isCorrect = picked===q.correct;

  const pick=(i)=>{ if(picked!==null) return; setPicked(i); if(i===q.correct) setScore(s=>s+1); };
  const next=()=>{
    if(idx+1>=total){ setDone(true); return; }
    setIdx(idx+1); setPicked(null);
  };

  if(done){
    const pct=Math.round((score/total)*100);
    return (
      <div className="screen">
        <TopBar title="Train" sub="DAILY PRACTICE · COMPLETE"/>
        <div className="quiz">
          <div className="eyebrow">SESSION COMPLETE</div>
          <h1 className="display big" style={{fontSize:"clamp(40px,6vw,84px)",margin:"14px 0 18px"}}>{score} / {total}</h1>
          <div className="feedback" style={{marginTop:0}}>
            <div className="fh"><AIglyph size={18}/> <span style={{fontFamily:"var(--f-display)",fontWeight:800,textTransform:"uppercase",fontSize:14}}>AI Coach</span></div>
            <div className="fb">
              {pct>=66
                ? <span>Strong session — you've clearly internalised that <b>creativity is combinatorial</b>. Your weak spot was the copying-vs-remixing line; I've queued a 2-minute refresher in your path.</span>
                : <span>Good effort. The idea to lock in next: <b>new ideas are combinations of existing parts</b>. I've added a short re-explainer and will resurface these questions in two days.</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:24,flexWrap:"wrap"}}>
            <button className="btn solid" onClick={()=>{ setIdx(0);setPicked(null);setDone(false);setScore(0); }}>Again</button>
            <button className="btn ghost" onClick={()=>go("home")}>Back to studio <I.arrow className="arrow" style={{width:18,height:18}}/></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="Train" sub="DAILY PRACTICE · AI-GRADED"/>
      <div className="quiz">
        <div className="qtop">
          <div className="eyebrow">QUESTION {String(idx+1).padStart(2,"0")} / {String(total).padStart(2,"0")}</div>
          <div className="qprog">
            {QUIZ.map((_,i)=>(<span key={i} className={"seg"+(i<idx?" on":"")+(i===idx?" cur":"")}></span>))}
          </div>
        </div>

        <h2 className="q">{q.q}</h2>

        <div className="opts">
          {q.opts.map((o,i)=>{
            let cls="opt";
            if(picked!==null){
              if(i===q.correct) cls+=" correct";
              else if(i===picked) cls+=" wrong";
            }
            return (
              <button key={i} className={cls} disabled={picked!==null} onClick={()=>pick(i)}>
                <span className="key">{String.fromCharCode(65+i)}</span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>

        {picked!==null && (
          <div className="feedback">
            <div className="fh">
              <AIglyph size={18}/>
              <span style={{fontFamily:"var(--f-display)",fontWeight:800,textTransform:"uppercase",fontSize:14}}>
                {isCorrect?"Correct":"Not quite"} · AI feedback
              </span>
            </div>
            <div className="fb" dangerouslySetInnerHTML={{__html: isCorrect? q.fb : q.fbWrong}}></div>
          </div>
        )}

        {picked!==null && (
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:22}}>
            <button className="btn solid" onClick={next}>
              {idx+1>=total?"See results":"Next question"} <I.arrow className="arrow" style={{width:18,height:18}}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Quiz });
