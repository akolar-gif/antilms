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
            const dest = callbackUrl === "/" 
              ? (res.role === "admin" ? "/admin" : res.role === "trainer" ? "/trainer" : "/learner")
              : callbackUrl;
            router.push(dest);
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
            const dest = callbackUrl === "/" 
              ? (res.role === "admin" ? "/admin" : res.role === "trainer" ? "/trainer" : "/learner")
              : callbackUrl;
            router.push(dest);
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
    <div className="w-full max-w-md p-4 relative z-10">
      <div className="bg-paper border-1.5 border-line rounded-2xl p-8 md:p-10 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-2 border border-line-soft text-blue text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Portal-Zugang
          </div>
          
          <h1 className="display text-3xl mb-2 text-ink">
            Innoversity LMS
          </h1>
          <p className="text-xs text-ink-2 max-w-sm mt-1">
            {mode === "login" 
              ? "Melde dich mit deinen individuellen Zugangsdaten an." 
              : "Erstelle ein neues Benutzerkonto, um mit dem Lernen zu beginnen."}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-paper-2 p-1 rounded-xl border-1.5 border-line-soft mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
              mode === "login"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            Anmelden
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
              mode === "register"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-2 hover:text-ink"
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
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Name */}
                <div className="space-y-1">
                  <label className="eyebrow block text-left text-ink-2">
                    Vollständiger Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Max Mustermann"
                      disabled={isPending}
                      className="w-full bg-paper border-1.5 border-line-soft rounded-xl py-3 pl-11 pr-4 text-ink placeholder-ink-3 focus:outline-none focus:border-line transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Role selection for registration */}
                <div className="space-y-1.5">
                  <label className="eyebrow block text-left text-ink-2">
                    Gewünschte Rolle
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegisterRole("learner")}
                      className={`flex items-center justify-center py-2.5 px-4 rounded-xl border-1.5 transition-all duration-150 gap-2 ${
                        registerRole === "learner"
                          ? "bg-paper-2 border-blue text-blue"
                          : "bg-paper border-line-soft text-ink-2 hover:border-line hover:text-ink"
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold font-heading uppercase">Lernende/r</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole("trainer")}
                      className={`flex items-center justify-center py-2.5 px-4 rounded-xl border-1.5 transition-all duration-150 gap-2 ${
                        registerRole === "trainer"
                          ? "bg-paper-2 border-emerald-green text-emerald-green-d"
                          : "bg-paper border-line-soft text-ink-2 hover:border-line hover:text-ink"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold font-heading uppercase">Lehrende/r</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="space-y-1">
            <label className="eyebrow block text-left text-ink-2">
              E-Mail-Adresse
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@beispiel.de"
                disabled={isPending}
                required
                className="w-full bg-paper border-1.5 border-line-soft rounded-xl py-3 pl-11 pr-4 text-ink placeholder-ink-3 focus:outline-none focus:border-line transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="eyebrow block text-left text-ink-2">
              Passwort
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPending}
                required
                className="w-full bg-paper border-1.5 border-line-soft rounded-xl py-3 pl-11 pr-4 text-ink placeholder-ink-3 focus:outline-none focus:border-line transition-all text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="btn solid w-full justify-center py-3.5 mt-2 rounded-xl"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Anmelden" : "Konto erstellen"}
                <ArrowRight className="w-3.5 h-3.5 arrow" />
              </>
            )}
          </button>
        </form>

        {/* Info panel showing standard seeded credentials */}
        {mode === "login" && (
          <div className="mt-8 border-t border-line-soft pt-6">
            <span className="eyebrow block mb-3 text-ink-2 text-left">
              Standard-Testbenutzer:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-ink-2">
              <div className="bg-paper-2 border border-line-soft p-2.5 rounded-xl hover:border-blue/50 transition-colors text-left">
                <span className="font-bold text-blue uppercase font-mono block">Learner</span>
                <span className="block truncate font-mono text-[9px] mt-0.5">learner@innoversity.com</span>
                <span className="text-ink-3 font-mono text-[9px] block">PW: learner123</span>
              </div>
              <div className="bg-paper-2 border border-line-soft p-2.5 rounded-xl hover:border-emerald-green/50 transition-colors text-left">
                <span className="font-bold text-emerald-green-d uppercase font-mono block">Trainer</span>
                <span className="block truncate font-mono text-[9px] mt-0.5">trainer@innoversity.com</span>
                <span className="text-ink-3 font-mono text-[9px] block">PW: trainer123</span>
              </div>
              <div className="bg-paper-2 border border-line-soft p-2.5 rounded-xl hover:border-ink/50 transition-colors text-left">
                <span className="font-bold text-ink uppercase font-mono block">Admin</span>
                <span className="block truncate font-mono text-[9px] mt-0.5">admin@innoversity.com</span>
                <span className="text-ink-3 font-mono text-[9px] block">PW: admin123</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer info/back link */}
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="eyebrow text-xs hover:text-blue transition-colors bg-transparent border-none cursor-pointer"
        >
          Zurück zur Startseite
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center relative overflow-hidden font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue" />
          <p className="eyebrow text-ink-2">Lade Portal-Zugang...</p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
