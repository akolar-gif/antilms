import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logoutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">Development Signals</h1>
          <p className="text-slate-600">Understand where learners struggle, grow, and collaborate.</p>
        </div>
        <form action={logoutAction}>
          <button 
            type="submit" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-royal-blue">Uncertainty Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-2">Concepts triggering the most mentor questions:</p>
            <ul className="text-sm text-slate-800 space-y-2">
              <li className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span>"Root Cause Analysis"</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">High Friction</span>
              </li>
              <li className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span>"Agile Estimation"</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Moderate</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-green">Reflection Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">Quality of self-reflection across cohorts.</p>
            <div className="h-24 flex items-end space-x-2">
              {/* Mock bar chart */}
              <div className="w-1/4 bg-emerald-green/30 h-1/3 rounded-t"></div>
              <div className="w-1/4 bg-emerald-green/50 h-2/3 rounded-t"></div>
              <div className="w-1/4 bg-emerald-green/80 h-full rounded-t"></div>
              <div className="w-1/4 bg-emerald-green h-4/5 rounded-t"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-plum">Competence Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">Future skills actively developing:</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Critical Thinking</span>
                  <span>78% active</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-plum h-1.5 rounded-full w-[78%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Complex Problem Solving</span>
                  <span>45% active</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-plum h-1.5 rounded-full w-[45%]"></div></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
