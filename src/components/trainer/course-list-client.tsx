"use client";

import { useState } from "react";
import { Course } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCourseAction } from "@/app/actions/course";

export function CourseListClient({ courses, role }: { courses: Course[], role: "trainer" | "learner" }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(courses.map(c => c.category || "Uncategorized"))).sort()];

  const filteredCourses = selectedCategory === "All" 
    ? courses 
    : courses.filter(c => (c.category || "Uncategorized") === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category 
                  ? "bg-emerald-green text-white shadow-sm" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <Card key={course.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col border-slate-200 overflow-hidden group">
            {/* Course Image */}
            <div className="h-40 bg-slate-100 relative w-full border-b border-slate-100 overflow-hidden">
              {course.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={course.imageUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-green/20 to-royal-blue/20 flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-slate-700 shadow-sm">
                  {course.category || "Uncategorized"}
                </span>
              </div>
            </div>

            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-lg leading-tight group-hover:text-emerald-green transition-colors">{course.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <p className="text-slate-600 mb-6 text-sm line-clamp-2 flex-1">{course.description}</p>
              
              <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    course.status === 'published' ? 'bg-emerald-green/10 text-emerald-green' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {course.status}
                  </span>
                  
                  {role === "trainer" && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this course and all its modules/blocks? This cannot be undone.")) {
                          const toastId = toast.loading("Deleting course...");
                          try {
                            await deleteCourseAction(course.id);
                            toast.success("Course deleted successfully!", { id: toastId });
                          } catch (err) {
                            toast.error("Failed to delete course", { id: toastId });
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 w-7 h-7 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                
                <Link href={`/${role}/courses/${course.id}`}>
                  {role === "trainer" ? (
                    <Button variant="outline" size="sm" className="hover:bg-emerald-green hover:text-white hover:border-emerald-green">
                      Open Studio
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-royal-blue hover:bg-royal-blue/90 text-white">
                      Enter Course
                    </Button>
                  )}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📭
            </div>
            <h3 className="text-lg font-heading font-medium text-slate-800 mb-1">No courses found</h3>
            <p className="text-slate-500">
              {selectedCategory === "All" 
                ? (role === "trainer" ? "Create your first learning journey." : "Check back later when trainers have published new content.")
                : `No courses available in the "${selectedCategory}" category.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
