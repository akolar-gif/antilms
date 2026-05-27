import { store } from "@/lib/store";
import Link from "next/link";
import { ArrowRight, BookOpen, PenTool, BarChart3, Sparkles } from "lucide-react";

export default async function LandingPage() {
  const allCourses = await store.getCourses();
  const publishedCourses = allCourses.filter(c => c.status === "published");
  
  // Group by category
  const categories = Array.from(new Set(publishedCourses.map(c => c.category || "Uncategorized"))).sort();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-green/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-emerald-green/20 via-royal-blue/10 to-transparent blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-sm font-medium mb-8 animate-in slide-in-from-bottom-4">
            <Sparkles className="w-4 h-4" /> The future of learning
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-slate-900 tracking-tight mb-8">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-green to-royal-blue">Innoversity</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mb-12 font-light leading-relaxed">
            This is not a traditional course folder. It's a living learning journey. 
            An AI-powered environment for adaptive, reflective, and project-based capability building.
          </p>

          {/* Portals / Three Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
            <Link href="/trainer" className="group relative p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-emerald-green/50 flex flex-col items-start text-left overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-green/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
              <div className="w-12 h-12 bg-emerald-green/10 text-emerald-green rounded-xl flex items-center justify-center mb-6">
                <PenTool className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-heading font-bold text-slate-800 mb-3 group-hover:text-emerald-green transition-colors">Create Journeys</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">Compose modules with an AI co-designer instead of just filing static content.</p>
              <div className="mt-auto flex items-center text-emerald-green text-sm font-semibold group-hover:gap-2 transition-all">
                Trainer Portal <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
            
            <Link href="/learner" className="group relative p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-royal-blue/50 flex flex-col items-start text-left overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-royal-blue/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
              <div className="w-12 h-12 bg-royal-blue/10 text-royal-blue rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-heading font-bold text-slate-800 mb-3 group-hover:text-royal-blue transition-colors">Start Learning</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">Move through a guided space that adapts to your readiness and reflection.</p>
              <div className="mt-auto flex items-center text-royal-blue text-sm font-semibold group-hover:gap-2 transition-all">
                Learner Portal <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
            
            <Link href="/admin" className="group relative p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-plum/50 flex flex-col items-start text-left overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-plum/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
              <div className="w-12 h-12 bg-plum/10 text-plum rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-heading font-bold text-slate-800 mb-3 group-hover:text-plum transition-colors">Analyze Signals</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">See real signals of struggle and growth, not just completion vanity metrics.</p>
              <div className="mt-auto flex items-center text-plum text-sm font-semibold group-hover:gap-2 transition-all">
                Admin Portal <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Courses Catalog */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">Explore Available Journeys</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Discover a new way of learning with our interactive and AI-guided courses.</p>
        </div>

        {publishedCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">No courses published yet</h3>
            <p className="text-slate-500 mt-2">Head over to the Trainer portal to create your first learning journey.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => {
              const categoryCourses = publishedCourses.filter(c => (c.category || "Uncategorized") === category);
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-2">
                    <h3 className="text-2xl font-heading font-bold text-slate-800">{category}</h3>
                    <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {categoryCourses.length} {categoryCourses.length === 1 ? 'course' : 'courses'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryCourses.map(course => (
                      <Link 
                        key={course.id} 
                        href={`/learner/courses/${course.id}`}
                        className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                          {course.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={course.imageUrl} 
                              alt={course.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                              <BookOpen className="w-10 h-10 text-slate-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h4 className="text-lg font-heading font-bold text-slate-900 mb-2 group-hover:text-royal-blue transition-colors line-clamp-2">
                            {course.title}
                          </h4>
                          <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                            {course.description || "No description provided."}
                          </p>
                          <div className="mt-auto flex items-center text-royal-blue text-sm font-semibold">
                            Start Journey <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
