"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, User, Award, Key, ArrowRight, Loader2, Mail, UserCheck } from "lucide-react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registerRole, setRegisterRole] = useState<"learner" | "trainer">("learner");
  const [isPending, startTransition] = useTransition();

  // Show error toast if redirected from middleware with error
  useState(() => {
    if (errorParam === "admin-only") {
      toast.error("Zugriff verweigert. Nur Administratoren haben Zugriff auf diesen Bereich.");
    } else if (errorParam === "trainer-only") {
      toast.error("Zugriff verweigert. Nur Trainer oder Administratoren haben Zugriff.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      if (!email || !password) {
        toast.error("Bitte gib E-Mail und Passwort ein.");
        return;
      }

      startTransition(async () => {
        try {
          const res = await loginAction(email, password);
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
    } else {
      if (!name || !email || !password) {
        toast.error("Bitte fülle alle Pflichtfelder aus.");
        return;
      }

      startTransition(async () => {
        try {
          const res = await registerAction(name, email, password, registerRole);
          if (res.success) {
            toast.success("Registrierung erfolgreich! Willkommen bei Innoversity.");
            router.push(callbackUrl);
            router.refresh();
          } else {
            toast.error(res.error || "Registrierung fehlgeschlagen.");
          }
        } catch (err) {
          toast.error("Ein unerwarteter Fehler ist aufgetreten.");
          console.error(err);
        }
      });
    }
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
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Portal-Zugang
          </div>
          
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-2">
            Innoversity LMS
          </h1>
          <p className="text-sm text-slate-400 max-w-sm">
            {mode === "login" 
              ? "Melde dich mit deinen individuellen Zugangsdaten an." 
              : "Erstelle ein neues Benutzerkonto, um mit dem Lernen zu beginnen."}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all ${
              mode === "login"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Anmelden
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all ${
              mode === "register"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Registrieren
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Vollständiger Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Max Mustermann"
                      disabled={isPending}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Role selection for registration */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Gewünschte Rolle
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegisterRole("learner")}
                      className={`flex items-center justify-center py-3 px-4 rounded-xl border transition-all duration-200 gap-2 ${
                        registerRole === "learner"
                          ? "bg-blue-950/40 border-blue-500/80 text-blue-400"
                          : "bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs font-medium">Lerner (Learner)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole("trainer")}
                      className={`flex items-center justify-center py-3 px-4 rounded-xl border transition-all duration-200 gap-2 ${
                        registerRole === "trainer"
                          ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-400"
                          : "bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-medium">Trainer (Trainer)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              E-Mail-Adresse
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@beispiel.de"
                disabled={isPending}
                required
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Passwort
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPending}
                required
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all group disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Anmelden" : "Konto erstellen"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Info panel showing standard seeded credentials */}
        {mode === "login" && (
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Standard-Testbenutzer:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
              <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl hover:border-blue-500/20 transition-colors">
                <span className="font-semibold text-blue-400 block">Learner</span>
                <span className="block truncate">learner@innoversity.com</span>
                <span className="text-slate-500 block">Passwort: learner123</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl hover:border-emerald-500/20 transition-colors">
                <span className="font-semibold text-emerald-400 block">Trainer</span>
                <span className="block truncate">trainer@innoversity.com</span>
                <span className="text-slate-500 block">Passwort: trainer123</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl hover:border-teal-500/20 transition-colors">
                <span className="font-semibold text-teal-400 block">Admin</span>
                <span className="block truncate">admin@innoversity.com</span>
                <span className="text-slate-500 block">Passwort: admin123</span>
              </div>
            </div>
          </div>
        )}
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
