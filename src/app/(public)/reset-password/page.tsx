"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Key, ArrowRight, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/password-reset";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Ungültiger oder fehlender Token zum Zurücksetzen.");
      return;
    }

    if (password.length < 6) {
      toast.error("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await resetPasswordAction(token, password);
        if (res.success) {
          toast.success(res.message);
          router.push("/login");
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
    <div className="w-full max-w-md p-4 relative z-10">
      <div className="bg-paper border-1.5 border-line rounded-2xl p-8 md:p-10 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-2 border border-line-soft text-blue text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Passwort festlegen
          </div>
          
          <h1 className="display text-3xl mb-2 text-ink">
            Neues Passwort
          </h1>
          <p className="text-xs text-ink-2 max-w-sm mt-1">
            Wähle ein sicheres neues Passwort für deinen Zugang.
          </p>
        </div>

        {!token ? (
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-red-500 font-semibold text-center">
              Fehlender oder ungültiger Token zum Zurücksetzen des Passworts.
            </p>
            <p className="text-xs text-ink-2 text-center">
              Bitte fordere einen neuen Passwort-Zurücksetzen-Link an.
            </p>
            <Link
              href="/forgot-password"
              className="btn solid justify-center py-2.5 rounded-xl w-full text-xs font-mono uppercase tracking-wider"
            >
              Neuen Link anfordern
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label className="eyebrow block text-left text-ink-2">
                Neues Passwort
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="eyebrow block text-left text-ink-2">
                Passwort bestätigen
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  Passwort speichern
                  <ArrowRight className="w-3.5 h-3.5 arrow" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-line-soft pt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink transition-colors font-mono uppercase tracking-wider text-[10px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Abbrechen
          </Link>
        </div>
      </div>
      
      {/* Footer info/back link */}
      <div className="text-center mt-6 absolute bottom-6 left-0 right-0">
        <Link
          href="/"
          className="eyebrow text-xs hover:text-blue transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center relative overflow-hidden font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue" />
          <p className="eyebrow text-ink-2">Lade Passwort-Formular...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
