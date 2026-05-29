/* ATELIER — root app + routing */

function App(){
  const [view,setView]=useState("home");
  const [courseId,setCourseId]=useState("creative-mind");
  const mainRef=useRef(null);

  const go=(v,arg)=>{
    if(v==="course" && arg) setCourseId(arg);
    setView(v);
    if(mainRef.current) mainRef.current.scrollTop=0;
  };

  let screen;
  if(view==="home") screen=<Home go={go}/>;
  else if(view==="create") screen=<Create go={go}/>;
  else if(view==="library") screen=<Library go={go}/>;
  else if(view==="course") screen=<Course courseId={courseId} go={go}/>;
  else if(view==="quiz" || view==="practice") screen=<Quiz go={go}/>;
  else screen=<Home go={go}/>;

  return (
    <div className="app">
      <Rail view={view} go={go}/>
      <main className="main" ref={mainRef}>
        {React.cloneElement(screen, { key:view+":"+(view==="course"?courseId:"") })}
      </main>
      <MobileTabs view={view} go={go}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
