"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Shield, User, Award, Check, Search } from "lucide-react";
import { loginAction, logoutAction } from "@/app/actions/auth";
import { toast } from "sonner";

import { I, Mark, AIglyph, AIChip, TopBar } from "./icons";
import { useTranslation } from "@/components/layout/language-context";



interface NavItem {
  id: string;
  href: string;
  icon: (p: any) => React.JSX.Element;
  label: string;
  create?: boolean;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function AppShell({
  children,
  currentRole = "learner",
  currentUser = null
}: {
  children: React.ReactNode;
  currentRole?: "learner" | "trainer" | "admin";
  currentUser?: SessionUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { language, setLanguage, t } = useTranslation();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Define dynamic nav items based on the active role
  const getNavItems = (): NavItem[] => {
    if (currentRole === "trainer") {
      return [
        { id: "home", href: "/trainer", icon: I.home, label: t("nav.studio") },
        { id: "create", href: "/trainer?create=true", icon: I.create, label: t("nav.create"), create: true },
      ];
    }
    if (currentRole === "admin") {
      return [
        { id: "home", href: "/admin", icon: I.home, label: t("nav.signals") },
        { id: "studio", href: "/trainer", icon: I.library, label: t("nav.studio") },
      ];
    }
    // Default Learner
    return [
      { id: "home", href: "/learner", icon: I.home, label: t("nav.home") },
      { id: "library", href: "/learner/library", icon: I.library, label: t("nav.library") },
      { id: "practice", href: "/learner/practice", icon: I.practice, label: t("nav.train") },
    ];
  };

  const navItems = getNavItems();

  const handleRoleSwitch = (newRole: "learner" | "trainer" | "admin") => {
    if (newRole === currentRole) return;
    
    startTransition(async () => {
      try {
        const email = `${newRole}@innoversity.com`;
        const password = `${newRole}123`;
        const res = await loginAction(email, password);
        if (res.success) {
          toast.success(`Rolle gewechselt zu: ${newRole}`);
          setMenuOpen(false);
          const targetUrl = newRole === "admin" ? "/admin" : newRole === "trainer" ? "/trainer" : "/learner";
          router.push(targetUrl);
          router.refresh();
        } else {
          toast.error("Rollenwechsel fehlgeschlagen.");
        }
      } catch (err) {
        toast.error("Fehler beim Rollenwechsel.");
      }
    });
  };

  const activeAvatarChar = currentRole.charAt(0).toUpperCase();
  const avatarBgColor = currentRole === "admin" ? "bg-amber-600 border-amber-800 text-amber-50" : currentRole === "trainer" ? "bg-emerald-600 border-emerald-800 text-emerald-50" : "bg-blue-600 border-blue-800 text-blue-50";

  return (
    <div className="app font-sans bg-paper text-ink min-h-screen">
      {/* Desktop Left Rail Navigation */}
      <aside className="rail hidden md:flex border-r border-line bg-paper">
        <Link href="/" className="brand" title="Atelier">
          <Mark size={40} />
        </Link>
        
        <nav className="nav flex flex-col gap-1 items-center w-full">
          {navItems.map((it) => {
            const Icon = it.icon;
            // Check active state
            const active = pathname === it.href || (it.id === "home" && pathname.startsWith(it.href) && it.href !== "/");
            return (
              <Link
                key={it.id}
                href={it.href}
                className={`nav-btn ${active ? "active" : ""} ${it.create ? "is-create" : ""}`}
              >
                <Icon />
                <span className="nlabel">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="spacer flex-1" />

        {/* Language Switcher Toggle */}
        <button
          onClick={() => {
            const nextLang = language === "de" ? "en" : "de";
            setLanguage(nextLang);
            router.refresh();
          }}
          className="w-11 h-11 mb-4 rounded-xl flex flex-col items-center justify-center font-mono font-bold border border-line-soft hover:bg-paper-3 transition-colors cursor-pointer text-ink text-[11px] leading-tight select-none"
          title={language === "de" ? "Switch to English" : "Auf Deutsch umstellen"}
        >
          <span className={language === "de" ? "text-blue font-extrabold" : "text-ink-3"}>DE</span>
          <span className="w-4 h-[1px] bg-line-soft" />
          <span className={language === "en" ? "text-blue font-extrabold" : "text-ink-3"}>EN</span>
        </button>

        {/* User profile avatar / Role switcher */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-11 h-11 rounded-full flex items-center justify-center font-heading font-extrabold text-sm border-1.5 transition-transform hover:scale-105 cursor-pointer ${avatarBgColor}`}
          >
            {currentUser ? getInitials(currentUser.name) : activeAvatarChar}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Click outside backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-12 left-2 w-56 bg-paper border border-line rounded-2xl shadow-xl z-50 p-3 flex flex-col gap-1.5"
                >
                  {currentUser && (
                    <div className="px-3 py-2 border-b border-line-soft mb-1">
                      <div className="font-semibold text-xs text-ink truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-ink-3 truncate">{currentUser.email}</div>
                    </div>
                  )}
                  
                  <div className="px-3 py-1.5 border-b border-line-soft mb-1 text-[10px] font-mono uppercase tracking-wider text-ink-3">
                    {t("nav.profile_role")}
                  </div>

                  {/* Switch to Learner */}
                  <button
                    onClick={() => handleRoleSwitch("learner")}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-xl text-left hover:bg-paper-2 text-ink"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-500" /> {t("nav.role_learner")}
                    </span>
                    {currentRole === "learner" && <Check className="w-3.5 h-3.5 text-ink-2" />}
                  </button>

                  {/* Switch to Trainer */}
                  <button
                    onClick={() => handleRoleSwitch("trainer")}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-xl text-left hover:bg-paper-2 text-ink"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-500" /> {t("nav.role_trainer")}
                    </span>
                    {currentRole === "trainer" && <Check className="w-3.5 h-3.5 text-ink-2" />}
                  </button>

                  {/* Switch to Admin */}
                  <button
                    onClick={() => handleRoleSwitch("admin")}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-xl text-left hover:bg-paper-2 text-ink"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-amber-500" /> {t("nav.role_admin")}
                    </span>
                    {currentRole === "admin" && <Check className="w-3.5 h-3.5 text-ink-2" />}
                  </button>

                  <div className="h-px bg-line-soft my-1" />

                  {/* Logout */}
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-coral-d hover:bg-paper-2 rounded-xl text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" /> {t("nav.logout")}
                    </button>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main content frame */}
      <main className="main flex-1 flex flex-col bg-paper overflow-x-hidden min-w-0">
        {children}
      </main>

      {/* Mobile Navigation Tabs (bottom sheet bar) */}
      <nav className="mtab md:hidden flex fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-paper/90 backdrop-blur-md px-1.5 py-2">
        {navItems.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || (it.id === "home" && pathname.startsWith(it.href) && it.href !== "/");
          return (
            <Link
              key={it.id}
              href={it.href}
              className={`nav-btn flex-1 ${active ? "active" : ""} ${it.create ? "is-create" : ""}`}
            >
              <Icon />
              <span className="nlabel">{it.label}</span>
            </Link>
          );
        })}
        {/* Mobile profile link triggering menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`nav-btn flex-1 flex flex-col items-center justify-center`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-extrabold text-[9px] border-1.2 ${avatarBgColor}`}>
            {currentUser ? getInitials(currentUser.name) : activeAvatarChar}
          </div>
          <span className="nlabel">Profile</span>
        </button>

        {/* Mobile overlay menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-16 left-4 right-4 bg-paper border border-line rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-2"
              >
                {currentUser && (
                  <div className="text-center pb-2 border-b border-line-soft mb-2">
                    <div className="font-semibold text-sm text-ink truncate">{currentUser.name}</div>
                    <div className="text-xs text-ink-3 truncate">{currentUser.email}</div>
                  </div>
                )}
                
                <div className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-3 pb-2 border-b border-line-soft">
                  {language === "de" ? "Rolle auswählen" : "Select Role"}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    onClick={() => handleRoleSwitch("learner")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-line text-xs font-semibold ${
                      currentRole === "learner" ? "bg-ink text-paper" : "bg-paper text-ink"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{language === "de" ? "Lerner" : "Learner"}</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch("trainer")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-line text-xs font-semibold ${
                      currentRole === "trainer" ? "bg-ink text-paper" : "bg-paper text-ink"
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>{language === "de" ? "Trainer" : "Trainer"}</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch("admin")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-line text-xs font-semibold ${
                      currentRole === "admin" ? "bg-ink text-paper" : "bg-paper text-ink"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </div>
                
                <div className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-3 pb-2 border-b border-line-soft mt-1">
                  {language === "de" ? "Sprache wählen" : "Select Language"}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLanguage("de");
                      router.refresh();
                    }}
                    className={`p-3 rounded-xl border border-line text-xs font-semibold ${
                      language === "de" ? "bg-ink text-paper" : "bg-paper text-ink"
                    }`}
                  >
                    Deutsch
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en");
                      router.refresh();
                    }}
                    className={`p-3 rounded-xl border border-line text-xs font-semibold ${
                      language === "en" ? "bg-ink text-paper" : "bg-paper text-ink"
                    }`}
                  >
                    English
                  </button>
                </div>

                <div className="h-px bg-line-soft my-1" />
                <form action={logoutAction} className="w-full">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold text-coral-d border border-line rounded-xl"
                  >
                    <LogOut className="w-4 h-4" /> {t("nav.logout")}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
