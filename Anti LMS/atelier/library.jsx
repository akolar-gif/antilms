/* ATELIER — Library (full course grid) */

function Library({ go }){
  const inProgress = COURSES.filter(c=>c.progress>0);
  return (
    <div className="screen">
      <TopBar title="Library" sub="ALL COURSES"/>

      <div className="lattice" style={{gridTemplateColumns:"1fr"}}>
        <div className="cell">
          <div className="eyebrow" style={{marginBottom:14}}>{COURSES.length} COURSES · {inProgress.length} IN PROGRESS</div>
          <h1 className="display" style={{fontSize:"clamp(36px,5vw,72px)"}}>The library</h1>
          <p className="lede" style={{maxWidth:520,marginTop:18}}>Everything on creativity — foundations, craft and mindset. Or describe your own and let the AI build it.</p>
          <div style={{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"}}>
            <button className="btn blue" onClick={()=>go("create")}><AIglyph size={16}/> Build a course</button>
          </div>
        </div>
      </div>

      <div className="sec-head"><h2>Continue</h2><span className="meta">IN PROGRESS</span></div>
      <div className="courses">
        {inProgress.map(c=><Poster key={c.id} c={c} go={go}/>)}
      </div>

      <div className="sec-head"><h2>All courses</h2><span className="meta">№ {String(COURSES.length).padStart(2,"0")}</span></div>
      <div className="courses">
        {COURSES.map(c=><Poster key={c.id} c={c} go={go}/>)}
      </div>
    </div>
  );
}

Object.assign(window, { Library });
