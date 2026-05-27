"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, User, Award, Key, ArrowRight, Loader2 } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [role, setRole] = useState<"learner" | "trainer" | "admin">("learner");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role !== "learner" && !password) {
      toast.error("Bitte gib das Passwort für diese Rolle ein.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await loginAction(role, password);
        if (res.success) {
          toast.success("Erfolgreich angemeldet!");
          router.push(callbackUrl);
          router.refresh();
        } else {
          toast.error(res.error || "Anmeldung fehlgeschlagen.");
        }
      } catch (err) {
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
        console.error(err);
      }
    });
  };

  return (
    <div className="w-full max-w-lg p-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Top visual accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Portal-Zugang
          </div>
          
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-2">
            Innoversity LMS
          </h1>
          <p className="text-sm text-slate-400 max-w-sm">
            Wähle deine Rolle und authentifiziere dich, um fortzufahren.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selectors */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Rolle auswählen</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Learner */}
              <button
                type="button"
                onClick={() => { setRole("learner"); setPassword(""); }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${
                  role === "learner"
                    ? "bg-slate-800/90 border-blue-500/80 text-blue-400 shadow-lg shadow-blue-500/10"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Lerner</span>
              </button>

              {/* Trainer */}
              <button
                type="button"
                onClick={() => setRole("trainer")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${
                  role === "trainer"
                    ? "bg-slate-800/90 border-emerald-500/80 text-emerald-400 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Award className="w-5 h-5" />
                <span className="text-xs font-medium">Trainer</span>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${
                  role === "admin"
                    ? "bg-slate-800/90 border-teal-500/80 text-teal-400 shadow-lg shadow-teal-500/10"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs font-medium">Admin</span>
              </button>
            </div>
          </div>

          {/* Password Input (Animated visibility) */}
          <AnimatePresence mode="wait">
            {role !== "learner" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Passwort
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Passwort eingeben"
                    disabled={isPending}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Hinweis: Standardpasswort ist{" "}
                  <code className="text-slate-400 bg-slate-950/40 px-1 py-0.5 rounded">
                    {role === "admin" ? "admin123" : "trainer123"}
                  </code>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all group disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Zugang freischalten
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </motion.div>
      
      {/* Footer info/back link */}
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors bg-transparent border-none cursor-pointer"
        >
          Zurück zur Startseite
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Decorative Aurora Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none translate-y-1/2" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
          <p className="text-sm text-slate-400">Lade Portal-Zugang...</p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
