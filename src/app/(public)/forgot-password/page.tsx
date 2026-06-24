"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { requestResetAction } from "@/app/actions/password-reset";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await requestResetAction(email);
        if (res.success) {
          toast.success(res.message);
          setDone(true);
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
        console.error(err);
      }
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center relative overflow-hidden font-sans">
      <div className="w-full max-w-md p-4 relative z-10">
        <div className="bg-paper border-1.5 border-line rounded-2xl p-8 md:p-10 relative">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-2 border border-line-soft text-blue text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Passwort zurücksetzen
            </div>
            
            <h1 className="display text-3xl mb-2 text-ink">
              Passwort vergessen?
            </h1>
            <p className="text-xs text-ink-2 max-w-sm mt-1">
              {done 
                ? "Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts gesendet. Bitte überprüfe dein Postfach und die Server-Logs."
                : "Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen deines Passworts zu erhalten."}
            </p>
          </div>

          {!done ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="name@innoversity.com"
                    disabled={isPending}
                    required
                    className="w-full bg-paper border-1.5 border-line-soft rounded-xl py-3 pl-11 pr-4 text-ink placeholder-ink-3 focus:outline-none focus:border-line transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn solid w-full justify-center py-3.5 mt-2 rounded-xl"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Link senden
                    <ArrowRight className="w-3.5 h-3.5 arrow" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-ink-2 mb-6 text-center">
                Keine E-Mail erhalten? Überprüfe bitte deinen Spam-Ordner oder das Terminal des Servers (wo der Link protokolliert wird).
              </p>
              <button 
                onClick={() => setDone(false)} 
                className="text-xs font-mono uppercase tracking-wider text-blue hover:underline bg-transparent border-none cursor-pointer"
              >
                Noch einmal versuchen
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-line-soft pt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink transition-colors font-mono uppercase tracking-wider text-[10px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Zurück zum Login
            </Link>
          </div>
        </div>
        
        {/* Footer info/back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="eyebrow text-xs hover:text-blue transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
