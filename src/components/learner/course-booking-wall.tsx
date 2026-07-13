"use client";

import { useState, useTransition } from "react";
import { Lock, Sparkles, CheckCircle2, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { bookCourseAction } from "@/app/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CourseBookingWallProps {
  courseId: string;
  userId: string;
  courseTitle: string;
  courseDescription: string;
  courseCategory?: string;
  modulesCount: number;
  lang: "de" | "en";
}

export function CourseBookingWall({
  courseId,
  userId,
  courseTitle,
  courseDescription,
  courseCategory,
  modulesCount,
  lang
}: CourseBookingWallProps) {
  const de = lang === "de";
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12 / 29");
  const [cardCvc, setCardCvc] = useState("123");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSimulatedPayment = () => {
    startTransition(async () => {
      try {
        const res = await bookCourseAction(userId, courseId);
        if (res.success) {
          setIsSuccess(true);
          toast.success(de ? "Zahlung erfolgreich! Kurs freigeschaltet." : "Payment successful! Course unlocked.");
          setTimeout(() => {
            setShowCheckout(false);
            router.refresh();
          }, 2000);
        } else {
          toast.error(res.error || (de ? "Fehler bei der Zahlung." : "Payment failed."));
        }
      } catch (err) {
        toast.error(de ? "Unerwarteter Fehler." : "Unexpected error.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      {/* 1. Locked Course Preview */}
      <div className="bg-paper border border-line rounded-2xl p-8 relative overflow-hidden shadow-sm flex flex-col gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-full filter blur-xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue/5 rounded-full filter blur-xl pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center border border-coral/25">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-ink-3 uppercase tracking-wider font-bold">
              {courseCategory || (de ? "Allgemein" : "General")}
            </div>
            <h1 className="text-2xl font-display font-extrabold uppercase tracking-tight text-ink mt-0.5">
              {courseTitle}
            </h1>
          </div>
        </div>

        <p className="text-xs text-ink-2 leading-relaxed">
          {courseDescription || (de ? "Für diesen Kurs ist eine Buchung erforderlich." : "A subscription is required to unlock this course.")}
        </p>

        <div className="border-t border-line border-dashed pt-4 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ink-3">{de ? "Didaktische Module" : "Didactic Modules"}:</span>
            <span className="font-bold text-ink">{modulesCount}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ink-3">{de ? "Zertifikat" : "Certificate"}:</span>
            <span className="font-bold text-emerald-green-d">{de ? "Inklusive" : "Included"}</span>
          </div>
        </div>

        {/* Action / Buy Card */}
        <div className="bg-paper-2 border border-line-soft rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mt-2">
          <div className="text-center sm:text-left">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              {de ? "Einmalige Freischaltung" : "One-Time Unlock"}
            </div>
            <div className="text-3xl font-display font-extrabold text-ink mt-1">
              49,00 €
            </div>
            <div className="text-[9px] text-ink-3 font-mono mt-0.5">
              {de ? "Inkl. MwSt., lebenslanger Zugriff" : "VAT included, lifetime access"}
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full sm:w-auto bg-blue text-paper px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-blue/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            style={{ border: "none" }}
          >
            {de ? "Kurs buchen" : "Book Course"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Simulated Stripe Checkout Overlay */}
      {showCheckout && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", position: "fixed" }}
        >
          <div 
            className="bg-paper border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-6"
            style={{ backgroundColor: "var(--paper)", borderColor: "var(--line)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue">
                <CreditCard className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Stripe Checkout</span>
              </div>
              <button 
                onClick={() => !isPending && setShowCheckout(false)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer font-bold text-base"
                disabled={isPending}
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 bg-emerald/10 text-emerald flex items-center justify-center rounded-full border border-emerald/25">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold uppercase text-ink">
                    {de ? "Zahlung erfolgreich!" : "Payment Successful!"}
                  </h3>
                  <p className="text-xs text-ink-3 mt-1 leading-normal">
                    {de 
                      ? "Der Kurs wurde erfolgreich freigeschaltet. Lerne jetzt weiter!" 
                      : "Course unlocked successfully. Continuing learning now!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-extrabold uppercase text-ink">
                    {de ? "Freischaltung bestätigen" : "Confirm Booking"}
                  </h3>
                  <div className="flex justify-between items-baseline mt-2 border-b border-line pb-3">
                    <span className="text-xs text-ink-2 font-mono">{courseTitle}</span>
                    <span className="text-lg font-bold text-ink">49,00 €</span>
                  </div>
                </div>

                {/* Simulated Credit Card Form */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="eyebrow block text-left text-ink-3">
                      {de ? "Kreditkarte (Simulation)" : "Credit Card (Simulation)"}
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                      <input
                        type="text"
                        disabled
                        value={cardNumber}
                        className="w-full bg-paper-2 border border-line rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="eyebrow block text-left text-ink-3">
                        Gültig bis
                      </label>
                      <input
                        type="text"
                        disabled
                        value={cardExpiry}
                        className="w-full bg-paper-2 border border-line rounded-xl px-4 py-2.5 text-xs text-ink-2 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="eyebrow block text-left text-ink-3">
                        CVC
                      </label>
                      <input
                        type="text"
                        disabled
                        value={cardCvc}
                        className="w-full bg-paper-2 border border-line rounded-xl px-4 py-2.5 text-xs text-ink-2 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-coral bg-coral/5 border border-coral/10 p-3 rounded-lg leading-relaxed font-mono">
                  {de 
                    ? "HINWEIS: Dies ist eine Bezahl-Simulation für den innoversity-Release-Kandidaten." 
                    : "NOTE: This is a payment simulation for the innoversity release candidate."}
                </div>

                <button
                  onClick={handleSimulatedPayment}
                  disabled={isPending}
                  className="w-full bg-ink text-paper py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-ink-2 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-paper" />
                  ) : (
                    <>
                      {de ? "Zahlung simulieren" : "Simulate Payment"}
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
