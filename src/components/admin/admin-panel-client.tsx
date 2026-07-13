"use client";

import React, { useState, useTransition } from "react";
import { 
  Shield, User, Award, Check, Mail, Search, Sparkles, 
  Settings, Users, CheckCircle, XCircle, Clock, Loader2, ArrowRight,
  Trash2, Archive, RotateCcw, BookOpen, FastForward, Link as LinkIcon
} from "lucide-react";
import { useTranslation } from "@/components/layout/language-context";
import { 
  updateSystemSettingsAction, 
  toggleUserApprovalAction,
  toggleUserArchivedAction,
  deleteUserAction,
  bookCourseAction,
  revokeCourseBookingAction,
  getUserBookingsAction
} from "@/app/actions/admin";
import { moderateCourseAction, deleteCourseAction } from "@/app/actions/course";
import { toast } from "sonner";
import { User as UserType, Course } from "@/types";

interface AdminPanelClientProps {
  initialUsers: UserType[];
  initialCourses: Course[];
  adminEmail: string;
  initialTestRegistrationEnabled: boolean;
  aiStatus: {
    configured: boolean;
    working: boolean;
    preview: string;
    errorMessage?: string;
  };
  lang: "de" | "en";
}

export function AdminPanelClient({
  initialUsers,
  initialCourses,
  adminEmail,
  initialTestRegistrationEnabled,
  aiStatus,
  lang
}: AdminPanelClientProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"telemetry" | "users" | "courses">("telemetry");
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  
  // Settings Form State
  const [emailInput, setEmailInput] = useState(adminEmail);
  const [testRegistrationEnabled, setTestRegistrationEnabled] = useState(initialTestRegistrationEnabled);
  const [isSavingSettings, startSavingSettings] = useTransition();

  // User Actions Loading State
  const [loadingUserIds, setLoadingUserIds] = useState<Record<string, boolean>>({});

  // Bookings management state
  const [bookingUser, setBookingUser] = useState<UserType | null>(null);
  const [userBookedCourseIds, setUserBookedCourseIds] = useState<string[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [loadingCourseBookingId, setLoadingCourseBookingId] = useState<string | null>(null);

  const openBookingModal = async (user: UserType) => {
    setBookingUser(user);
    setIsLoadingBookings(true);
    try {
      const res = await getUserBookingsAction(user.id);
      if (res.success && res.bookings) {
        setUserBookedCourseIds(res.bookings);
      } else {
        toast.error(de ? "Fehler beim Laden der Buchungen." : "Failed to load bookings.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleToggleBooking = async (courseId: string) => {
    if (!bookingUser) return;
    setLoadingCourseBookingId(courseId);
    const isCurrentlyBooked = userBookedCourseIds.includes(courseId);
    try {
      if (isCurrentlyBooked) {
        const res = await revokeCourseBookingAction(bookingUser.id, courseId);
        if (res.success) {
          setUserBookedCourseIds(prev => prev.filter(id => id !== courseId));
          toast.success(de ? "Buchung storniert." : "Booking revoked.");
        } else {
          toast.error(res.error || (de ? "Fehler beim Stornieren." : "Cancellation failed."));
        }
      } else {
        const res = await bookCourseAction(bookingUser.id, courseId);
        if (res.success) {
          setUserBookedCourseIds(prev => [...prev, courseId]);
          toast.success(de ? "Kurs erfolgreich gebucht." : "Course booked successfully.");
        } else {
          toast.error(res.error || (de ? "Fehler beim Buchen." : "Booking failed."));
        }
      }
    } catch (e) {
      toast.error(de ? "Unerwarteter Fehler." : "Unexpected error.");
    } finally {
      setLoadingCourseBookingId(null);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "archived">("all");

  const de = language === "de";

  // Handle settings update
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startSavingSettings(async () => {
      const res = await updateSystemSettingsAction(emailInput, testRegistrationEnabled);
      if (res.success) {
        toast.success(de ? "Einstellungen erfolgreich gespeichert." : "Settings saved successfully.");
      } else {
        toast.error(res.error || (de ? "Fehler beim Speichern." : "Error saving settings."));
      }
    });
  };

  // Handle user approval toggle
  const handleToggleUserApproval = async (userId: string, currentApproved: boolean) => {
    setLoadingUserIds(prev => ({ ...prev, [userId]: true }));
    try {
      const newStatus = !currentApproved;
      const res = await toggleUserApprovalAction(userId, newStatus);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: newStatus } : u));
        toast.success(
          newStatus 
            ? (de ? "Benutzer freigeschaltet und benachrichtigt." : "User approved and notified.")
            : (de ? "Benutzer gesperrt." : "User deactivated.")
        );
      } else {
        toast.error(res.error || (de ? "Fehler beim Aktualisieren." : "Error updating user."));
      }
    } catch (err) {
      toast.error(de ? "Unerwarteter Fehler." : "Unexpected error.");
    } finally {
      setLoadingUserIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle user archive toggle
  const handleToggleUserArchived = async (userId: string, currentArchived: boolean) => {
    setLoadingUserIds(prev => ({ ...prev, [userId]: true }));
    try {
      const newStatus = !currentArchived;
      const res = await toggleUserArchivedAction(userId, newStatus);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, archived: newStatus } : u));
        toast.success(
          newStatus 
            ? (de ? "Benutzer archiviert." : "User archived.")
            : (de ? "Benutzer wiederhergestellt." : "User restored.")
        );
      } else {
        toast.error(res.error || (de ? "Fehler beim Aktualisieren." : "Error updating user."));
      }
    } catch (err) {
      toast.error(de ? "Unerwarteter Fehler." : "Unexpected error.");
    } finally {
      setLoadingUserIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string, userName: string) => {
    const message = de 
      ? `Möchtest du den Benutzer "${userName}" wirklich unwiderruflich löschen? Alle Lernfortschritte und Kommentare gehen dabei verloren.` 
      : `Are you sure you want to permanently delete user "${userName}"? All progress and reflections will be deleted.`;
      
    if (!confirm(message)) {
      return;
    }

    setLoadingUserIds(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await deleteUserAction(userId);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success(de ? "Benutzer erfolgreich gelöscht." : "User deleted successfully.");
      } else {
        toast.error(res.error || (de ? "Fehler beim Löschen." : "Error deleting user."));
      }
    } catch (err) {
      toast.error(de ? "Unerwarteter Fehler." : "Unexpected error.");
    } finally {
      setLoadingUserIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "pending") {
      matchesStatus = !user.approved && !user.archived;
    } else if (statusFilter === "approved") {
      matchesStatus = user.approved && !user.archived;
    } else if (statusFilter === "archived") {
      matchesStatus = user.archived;
    } else if (statusFilter === "all") {
      matchesStatus = !user.archived;
    }
      
    return matchesSearch && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "trainer": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  // Course States
  const [loadingCourseIds, setLoadingCourseIds] = useState<Record<string, boolean>>({});
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<"all" | "pending" | "published" | "coming_soon" | "draft">("all");

  // Handle course status update (moderation)
  const handleModerateCourse = async (courseId: string, newStatus: any) => {
    setLoadingCourseIds(prev => ({ ...prev, [courseId]: true }));
    try {
      const res = await moderateCourseAction(courseId, newStatus);
      if (res.success) {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
        toast.success(de ? "Kursstatus erfolgreich aktualisiert." : "Course status updated successfully.");
      } else {
        toast.error(res.error || (de ? "Fehler beim Aktualisieren." : "Error updating course."));
      }
    } catch (err) {
      toast.error(de ? "Unerwarteter Fehler." : "Unexpected error.");
    } finally {
      setLoadingCourseIds(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    const message = de 
      ? `Möchtest du den Kurs "${courseTitle}" wirklich unwiderruflich löschen? Alle Module und Lernblöcke gehen dabei verloren.` 
      : `Are you sure you want to permanently delete course "${courseTitle}"? All modules and blocks will be deleted.`;
      
    if (!confirm(message)) {
      return;
    }

    setLoadingCourseIds(prev => ({ ...prev, [courseId]: true }));
    try {
      const res = await deleteCourseAction(courseId);
      if (res.success) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        toast.success(de ? "Kurs erfolgreich gelöscht." : "Course deleted successfully.");
      } else {
        toast.error(res.error || (de ? "Fehler beim Löschen." : "Error deleting course."));
      }
    } catch (err) {
      toast.error(de ? "Unerwarteter Fehler." : "Unexpected error.");
    } finally {
      setLoadingCourseIds(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Filter and search courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      (course.category && course.category.toLowerCase().includes(courseSearchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (courseStatusFilter === "pending") {
      matchesStatus = course.status === "pending_review";
    } else if (courseStatusFilter === "published") {
      matchesStatus = course.status === "published";
    } else if (courseStatusFilter === "coming_soon") {
      matchesStatus = course.status === "coming_soon";
    } else if (courseStatusFilter === "draft") {
      matchesStatus = course.status === "draft";
    }
      
    return matchesSearch && matchesStatus;
  });

  const getCourseStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-blue-500/10 text-blue border-blue/20";
      case "pending_review": return "bg-coral/10 text-coral-d border-coral/20";
      case "coming_soon": return "bg-amber-500/10 text-amber border-amber-500/20";
      default: return "bg-ink/10 text-ink border-ink/20";
    }
  };

  return (
    <div className="screen flex-1 flex flex-col">
      {/* TopBar Header */}
      <header className="topbar">
        <div className="tb-left">
          <div>
            <div className="eyebrow">{t("admin.eyebrow")}</div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginTop: 2, textTransform: "uppercase", letterSpacing: "-.01em" }}>
              {t("admin.title")}
            </div>
          </div>
        </div>

        {/* Tab Controls in Header */}
        <div className="flex gap-2 mr-4">
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "telemetry" 
                ? "bg-ink text-paper border border-ink" 
                : "bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {de ? "Telemetrie & KI" : "Telemetry & AI"}
          </button>
          
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "users" 
                ? "bg-ink text-paper border border-ink" 
                : "bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {de ? "Benutzer" : "Users"}
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "courses" 
                ? "bg-ink text-paper border border-ink" 
                : "bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {de ? "Kurse" : "Courses"}
          </button>
        </div>
      </header>

      {activeTab === "telemetry" ? (
        <div className="flex-1 flex flex-col gap-6 p-6">
          {/* Hero Lattice Grid */}
          <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
            <div className="cell">
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                {t("admin.telemetry")}
              </div>
              <h1 className="display animate-reveal" style={{ fontSize: "clamp(32px, 5vw, 64px)" }}>{t("admin.title")}</h1>
              <p className="lede mt-4" style={{ maxWidth: 560 }}>
                {t("admin.desc")}
              </p>
            </div>
          </div>

          {/* KI-Systemdiagnose (Gemini API) */}
          <div className="lattice" style={{ gridTemplateColumns: "1fr" }}>
            <div className="cell" style={{ background: "var(--paper-2)", borderLeft: "4px solid " + (aiStatus.working ? "var(--emerald)" : aiStatus.configured ? "var(--coral)" : "var(--amber)") }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="eyebrow" style={{ color: aiStatus.working ? "var(--emerald-d)" : aiStatus.configured ? "var(--coral-d)" : "var(--ink-3)" }}>
                    KI-Systemdiagnose (Gemini API)
                  </span>
                  <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 20, marginTop: 6, textTransform: "uppercase" }}>
                    {aiStatus.working 
                      ? "Verbindung erfolgreich & gesichert" 
                      : aiStatus.configured 
                        ? "Fehler bei der Verbindung" 
                        : "Kein API-Key konfiguriert"}
                  </h2>
                  <p className="text-xs text-ink-2 mt-1.5" style={{ lineHeight: 1.4 }}>
                    {aiStatus.working 
                      ? `Der API-Schlüssel ist aktiv. Diagnosetest erfolgreich. Schlüssel-Vorschau: ${aiStatus.preview}`
                      : aiStatus.configured 
                        ? `API-Schlüssel konfiguriert (${aiStatus.preview}), aber Test fehlgeschlagen: ${aiStatus.errorMessage}`
                        : "Bitte füge GOOGLE_GENERATIVE_AI_API_KEY zu deiner .env-Datei hinzu, um KI-Funktionen zu aktivieren."}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 md:self-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${aiStatus.working ? "bg-emerald" : aiStatus.configured ? "bg-coral" : "bg-amber"}`} style={{ display: "inline-block" }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-2">
                    {aiStatus.working ? "Online" : aiStatus.configured ? "Fehlgeschlagen" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signals Grid */}
          <div className="lattice" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {/* Uncertainty Clusters */}
            <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
              <span className="corner-no">№ 01</span>
              <div>
                <span className="eyebrow" style={{ color: "var(--coral-d)" }}>DIFFICULT CONCEPTS</span>
                <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>{t("admin.uncertainty_clusters")}</h3>
              </div>
              <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
                {t("admin.uncertainty_desc")}
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex justify-between items-center p-3 rounded-xl border border-line" style={{ background: "var(--paper-2)" }}>
                  <span className="font-bold text-ink">"Root Cause Analysis"</span>
                  <span className="text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 bg-coral/20 text-coral-d rounded border border-coral/30">
                    {lang === "de" ? "Hohe Reibung" : "High Friction"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border border-line" style={{ background: "var(--paper-2)" }}>
                  <span className="font-bold text-ink">{lang === "de" ? "\"Agile Schätzungen\"" : "\"Agile Estimations\""}</span>
                  <span className="text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 bg-blue/20 text-blue-d rounded border border-blue/30">
                    {lang === "de" ? "Moderat" : "Moderate"}
                  </span>
                </div>
              </div>
            </div>

            {/* Reflection Depth */}
            <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
              <span className="corner-no">№ 02</span>
              <div>
                <span className="eyebrow" style={{ color: "var(--blue-d)" }}>COHORT ANALYSIS</span>
                <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>{t("admin.reflection_depth")}</h3>
              </div>
              <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
                {t("admin.reflection_desc")}
              </p>
              <div className="mt-auto h-28 flex items-end justify-between gap-2.5 p-4 border border-line rounded-2xl animate-reveal" style={{ background: "var(--paper-2)" }}>
                <div className="flex-1 rounded-t bg-coral h-1/3 transition-all"></div>
                <div className="flex-1 rounded-t bg-coral h-2/3 transition-all" style={{ opacity: 0.65 }}></div>
                <div className="flex-1 rounded-t bg-coral h-full transition-all" style={{ opacity: 0.85 }}></div>
                <div className="flex-1 rounded-t bg-coral h-[85%] transition-all"></div>
              </div>
            </div>

            {/* Competence Signals */}
            <div className="cell flex flex-col gap-6" style={{ minHeight: 320 }}>
              <span className="corner-no">№ 03</span>
              <div>
                <span className="eyebrow" style={{ color: "var(--ink-3)" }}>FUTURE SKILLS</span>
                <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 24, marginTop: 6, textTransform: "uppercase" }}>{t("admin.competence_signals")}</h3>
              </div>
              <p className="text-sm text-ink-2" style={{ lineHeight: 1.4 }}>
                {t("admin.competence_desc")}
              </p>
              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-ink-3">
                    <span>{lang === "de" ? "Kritisches Denken" : "Critical Thinking"}</span>
                    <span>{t("admin.active", { percentage: "78" })}</span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                    <div className="bg-ink h-full rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-ink-3">
                    <span>{lang === "de" ? "Komplexe Problemlösung" : "Complex Problem Solving"}</span>
                    <span>{t("admin.active", { percentage: "45" })}</span>
                  </div>
                  <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                    <div className="bg-ink h-full rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
          {/* Left panel */}
          <div className="flex-1 bg-paper border border-line rounded-2xl p-6 flex flex-col min-w-0">
            {activeTab === "users" ? (
              <>
                {/* Users Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-display font-extrabold uppercase flex items-center gap-2 text-ink">
                      <Users className="w-5 h-5 text-blue" />
                      {de ? "Benutzerverwaltung" : "User Approvals"}
                    </h2>
                    <p className="text-xs text-ink-3 mt-1">
                      {de ? "Verwalte registrierte Nutzer und schalte ihre Konten frei." : "Manage registered users and activate their accounts."}
                    </p>
                  </div>

                  {/* Status Filters */}
                  <div className="flex bg-paper-2 p-1 border border-line-soft rounded-xl text-xs font-mono">
                    {(["all", "pending", "approved", "archived"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                          statusFilter === f 
                            ? "bg-ink text-paper" 
                            : "text-ink-2 hover:text-ink hover:bg-paper-3"
                        }`}
                      >
                        {f === "all" ? (de ? "Alle" : "All") : f === "pending" ? (de ? "Ausstehend" : "Pending") : f === "approved" ? (de ? "Freigegeben" : "Approved") : (de ? "Archiviert" : "Archived")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={de ? "Nutzer suchen nach Name oder E-Mail..." : "Search users by name or email..."}
                    className="w-full bg-paper-2 border border-line rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink focus:outline-none focus:border-blue transition-colors"
                  />
                </div>

                {/* Users list */}
                <div className="flex-1 overflow-x-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="h-48 border border-line border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-ink-3">
                      <Users className="w-8 h-8 opacity-40" />
                      <p className="text-xs">{de ? "Keine Benutzer gefunden." : "No users found."}</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-line text-[10px] font-mono uppercase tracking-wider text-ink-3">
                          <th className="pb-3 font-bold">{de ? "Benutzer" : "User"}</th>
                          <th className="pb-3 font-bold">{de ? "Rolle" : "Role"}</th>
                          <th className="pb-3 font-bold">{de ? "Registriert am" : "Signed Up"}</th>
                          <th className="pb-3 font-bold">{de ? "Status" : "Status"}</th>
                          <th className="pb-3 pb-3 pr-2 text-right font-bold">{de ? "Aktion" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => {
                          const isPending = !user.approved;
                          const isMe = user.email === adminEmail;
                          const isLoading = !!loadingUserIds[user.id];

                          return (
                            <tr key={user.id} className="border-b border-line-soft hover:bg-paper-2/40 transition-colors">
                              <td className="py-4 pr-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${getRoleBadgeColor(user.role)}`}>
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-ink truncate max-w-[160px] sm:max-w-xs">{user.name}</div>
                                    <div className="text-[10px] text-ink-3 truncate max-w-[160px] sm:max-w-xs">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-4 text-ink-2 font-mono text-[10px]">
                                {new Date(user.createdAt).toLocaleDateString(de ? "de-DE" : "en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </td>
                              <td className="py-4">
                                {user.archived ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-ink-3 font-semibold">
                                    <Archive className="w-3.5 h-3.5" />
                                    {de ? "Archiviert" : "Archived"}
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-coral-d font-semibold">
                                    <Clock className="w-3.5 h-3.5" />
                                    {de ? "Ausstehend" : "Pending"}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-green-d font-semibold">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {de ? "Freigeschaltet" : "Approved"}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 text-right pr-2">
                                {isMe ? (
                                  <span className="text-[10px] text-ink-3 font-mono italic">
                                    {de ? "Aktiver Admin" : "Active Admin"}
                                  </span>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    {/* Approve / Suspend Toggle */}
                                    {!user.archived && (
                                      <button
                                        disabled={isLoading}
                                        onClick={() => handleToggleUserApproval(user.id, user.approved)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all min-w-[94px] cursor-pointer flex items-center justify-center gap-1 ${
                                          isPending 
                                            ? "bg-emerald text-emerald-d hover:bg-emerald/80 border border-emerald/20" 
                                            : "bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft"
                                        }`}
                                      >
                                        {isLoading ? (
                                          <Loader2 className="w-3 h-3 animate-spin text-ink-2" />
                                        ) : isPending ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            {de ? "Freigeben" : "Approve"}
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="w-3 h-3" />
                                            {de ? "Sperren" : "Suspend"}
                                          </>
                                        )}
                                      </button>
                                    )}

                                    {/* Manage Bookings Button */}
                                    {!user.archived && !isPending && (
                                      <button
                                        onClick={() => openBookingModal(user)}
                                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft cursor-pointer flex items-center justify-center gap-1"
                                        title={de ? "Kurse verwalten" : "Manage Bookings"}
                                      >
                                        <BookOpen className="w-3.5 h-3.5 text-blue" />
                                        <span>{de ? "Kurse" : "Courses"}</span>
                                      </button>
                                    )}

                                    {/* Archive / Restore Toggle */}
                                    <button
                                      disabled={isLoading}
                                      onClick={() => handleToggleUserArchived(user.id, user.archived)}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft cursor-pointer flex items-center justify-center gap-1"
                                      title={user.archived ? (de ? "Aktivieren" : "Activate") : (de ? "Archivieren" : "Archive")}
                                    >
                                      {user.archived ? (
                                        <>
                                          <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                                          <span>{de ? "Aktivieren" : "Activate"}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Archive className="w-3.5 h-3.5" />
                                          <span>{de ? "Archivieren" : "Archive"}</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      disabled={isLoading}
                                      onClick={() => handleDeleteUser(user.id, user.name)}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-coral/10 hover:bg-coral/20 text-coral-d border border-coral/20 cursor-pointer flex items-center justify-center gap-1"
                                      title={de ? "Löschen" : "Delete"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>{de ? "Löschen" : "Delete"}</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Courses Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-display font-extrabold uppercase flex items-center gap-2 text-ink">
                      <BookOpen className="w-5 h-5 text-blue" />
                      {de ? "Kurs-Moderation" : "Course Moderation"}
                    </h2>
                    <p className="text-xs text-ink-3 mt-1">
                      {de ? "Prüfe, veröffentliche oder lösche Kurse." : "Review, publish, or delete courses."}
                    </p>
                  </div>

                  {/* Course Status Filters */}
                  <div className="flex bg-paper-2 p-1 border border-line-soft rounded-xl text-xs font-mono animate-reveal">
                    {(["all", "pending", "published", "coming_soon", "draft"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setCourseStatusFilter(f)}
                        className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                          courseStatusFilter === f 
                            ? "bg-ink text-paper" 
                            : "text-ink-2 hover:text-ink hover:bg-paper-3"
                        }`}
                      >
                        {f === "all" ? (de ? "Alle" : "All") : f === "pending" ? (de ? "Review" : "Review") : f === "published" ? (de ? "Aktiv" : "Published") : f === "coming_soon" ? (de ? "Bald" : "Soon") : (de ? "Entwurf" : "Draft")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                  <input
                    type="text"
                    value={courseSearchQuery}
                    onChange={e => setCourseSearchQuery(e.target.value)}
                    placeholder={de ? "Kurs suchen nach Titel oder Kategorie..." : "Search courses by title or category..."}
                    className="w-full bg-paper-2 border border-line rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink focus:outline-none focus:border-blue transition-colors"
                  />
                </div>

                {/* Courses List */}
                <div className="flex-1 overflow-x-auto">
                  {filteredCourses.length === 0 ? (
                    <div className="h-48 border border-line border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-ink-3">
                      <BookOpen className="w-8 h-8 opacity-40" />
                      <p className="text-xs">{de ? "Keine Kurse gefunden." : "No courses found."}</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-line text-[10px] font-mono uppercase tracking-wider text-ink-3">
                          <th className="pb-3 font-bold">{de ? "Kurs" : "Course"}</th>
                          <th className="pb-3 font-bold">{de ? "Erstellt am" : "Created At"}</th>
                          <th className="pb-3 font-bold">{de ? "Status" : "Status"}</th>
                          <th className="pb-3 pb-3 pr-2 text-right font-bold">{de ? "Aktion" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.map(course => {
                          const isCourseLoading = !!loadingCourseIds[course.id];

                          return (
                            <tr key={course.id} className="border-b border-line-soft hover:bg-paper-2/40 transition-colors">
                              <td className="py-4 pr-3">
                                <div className="flex items-center gap-3">
                                  <div className="min-w-0">
                                    <div className="font-bold text-ink truncate max-w-[160px] sm:max-w-xs">{course.title}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <span className="text-[9px] font-mono text-ink-3 border border-line-soft px-1 rounded uppercase tracking-wider">{course.category || "General"}</span>
                                      <span className="text-[9px] font-mono text-blue border border-blue/20 px-1 rounded uppercase tracking-wider bg-blue/5">
                                        {course.type === "sprint" ? "Sprint" : course.type === "track" ? "Track" : "Standard"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-ink-2 font-mono text-[10px]">
                                {new Date(course.createdAt).toLocaleDateString(de ? "de-DE" : "en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${getCourseStatusColor(course.status)}`}>
                                  {course.status === "published" ? (de ? "Aktiv" : "Published") : course.status === "pending_review" ? (de ? "Im Review" : "Review") : course.status === "coming_soon" ? (de ? "Bald" : "Soon") : (de ? "Entwurf" : "Draft")}
                                </span>
                              </td>
                              <td className="py-4 text-right pr-2">
                                <div className="flex justify-end gap-2 flex-wrap">
                                  {/* Approve Button */}
                                  {course.status !== "published" && (
                                    <button
                                      disabled={isCourseLoading}
                                      onClick={() => handleModerateCourse(course.id, "published")}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-emerald text-emerald-d hover:bg-emerald/80 border border-emerald/20 cursor-pointer flex items-center justify-center gap-1"
                                      title={de ? "Freigeben" : "Approve"}
                                    >
                                      {isCourseLoading ? (
                                        <Loader2 className="w-3 h-3 animate-spin text-emerald-d" />
                                      ) : (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>{de ? "Aktiv" : "Approve"}</span>
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* Reject / Suspended to Draft */}
                                  {course.status !== "draft" && (
                                    <button
                                      disabled={isCourseLoading}
                                      onClick={() => handleModerateCourse(course.id, "draft")}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft cursor-pointer flex items-center justify-center gap-1"
                                      title={de ? "Zurückweisen" : "Reject"}
                                    >
                                      <XCircle className="w-3 h-3" />
                                      <span>{de ? "Entwurf" : "Draft"}</span>
                                    </button>
                                  )}

                                  {/* Coming Soon Button */}
                                  {course.status !== "coming_soon" && (
                                    <button
                                      disabled={isCourseLoading}
                                      onClick={() => handleModerateCourse(course.id, "coming_soon")}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-paper-2 hover:bg-paper-3 text-ink-2 border border-line-soft cursor-pointer flex items-center justify-center gap-1"
                                      title={de ? "Coming Soon" : "Coming Soon"}
                                    >
                                      <Clock className="w-3 h-3" />
                                      <span>{de ? "Soon" : "Soon"}</span>
                                    </button>
                                  )}

                                  {/* Delete Button */}
                                  <button
                                    disabled={isCourseLoading}
                                    onClick={() => handleDeleteCourse(course.id, course.title)}
                                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-coral/10 hover:bg-coral/20 text-coral-d border border-coral/20 cursor-pointer flex items-center justify-center gap-1"
                                    title={de ? "Löschen" : "Delete"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{de ? "Löschen" : "Delete"}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right panel - Global System Settings */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-paper border border-line rounded-2xl p-6 flex flex-col">
              <h2 className="text-xl font-display font-extrabold uppercase flex items-center gap-2 text-ink mb-2">
                <Settings className="w-5 h-5 text-blue" />
                {de ? "Systemeinstellungen" : "System Settings"}
              </h2>
              <p className="text-xs text-ink-3 mb-6">
                {de ? "Konfiguriere globale Parameter für dein LMS." : "Configure global parameters for your LMS."}
              </p>

              {/* Admin notification email form */}
              <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="eyebrow block text-left text-ink-2">
                    {de ? "Admin E-Mail Benachrichtigung" : "Admin Email Notification"}
                  </label>
                  <p className="text-[10px] text-ink-3 leading-normal mb-1">
                    {de 
                      ? "Neue Registrierungen werden an diese Adresse gemeldet." 
                      : "New registrations will be reported to this address."}
                  </p>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="w-full bg-paper-2 border border-line rounded-xl pl-9 pr-4 py-2.5 text-xs text-ink focus:outline-none focus:border-blue transition-colors"
                      placeholder="andreas@kolar.biz"
                    />
                  </div>
                </div>

                {/* Test-User Registration Toggle */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="eyebrow block text-left text-ink-2">
                    {de ? "Test-User Registrierung" : "Test-User Registration"}
                  </label>
                  <p className="text-[10px] text-ink-3 leading-normal mb-1.5">
                    {de 
                      ? "Erlaube freien Zugang für Testuser mit anschließender Freischaltung." 
                      : "Allow free registration for test users with manual approval."}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={testRegistrationEnabled}
                      onChange={e => setTestRegistrationEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-blue border-line focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                    <span className="text-xs text-ink-2 font-medium">
                      {de ? "Freie Registrierung aktiv" : "Free registration active"}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full bg-ink text-paper py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-ink-2 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                >
                  {isSavingSettings ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-paper" />
                  ) : (
                    <>
                      {de ? "Einstellungen speichern" : "Save Settings"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Quick Stats Panel */}
            <div className="bg-paper border border-line rounded-2xl p-6">
              <h3 className="eyebrow text-ink-2 mb-4 text-left">
                {de ? "Statistiken" : "Cohort Statistics"}
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 rounded-xl border border-line-soft bg-paper-2">
                  <span className="text-xs text-ink-2 font-semibold">{de ? "Benutzer gesamt" : "Total Users"}</span>
                  <span className="font-mono font-extrabold text-sm">{users.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border border-line-soft bg-paper-2">
                  <span className="text-xs text-ink-2 font-semibold">{de ? "Ausstehend" : "Pending Approval"}</span>
                  <span className="font-mono font-extrabold text-sm text-coral-d">
                    {users.filter(u => !u.approved && !u.archived).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border border-line-soft bg-paper-2">
                  <span className="text-xs text-ink-2 font-semibold">{de ? "Freigeschaltet" : "Approved"}</span>
                  <span className="font-mono font-extrabold text-sm text-emerald-green-d">
                    {users.filter(u => u.approved && !u.archived).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border border-line-soft bg-paper-2">
                  <span className="text-xs text-ink-2 font-semibold">{de ? "Archiviert" : "Archived"}</span>
                  <span className="font-mono font-extrabold text-sm text-ink-3">
                    {users.filter(u => u.archived).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {bookingUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", position: "fixed" }}
        >
          <div className="bg-paper border border-line rounded-2xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-ink">
                  {de ? "Kursbuchungen verwalten" : "Manage Course Bookings"}
                </h3>
              </div>
              <button 
                onClick={() => setBookingUser(null)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            {/* User Info */}
            <div className="bg-paper-2 border border-line-soft rounded-xl p-3.5 flex flex-col gap-0.5">
              <div className="text-xs font-bold text-ink">{bookingUser.name}</div>
              <div className="text-[10px] text-ink-3 font-mono">{bookingUser.email}</div>
              {bookingUser.approved && (
                <div className="text-[9px] text-emerald-green-d font-mono mt-1.5 flex items-center gap-1 font-bold">
                  <Check className="w-3 h-3" />
                  {de 
                    ? "Freigeschalteter Testuser (hat automatisch Zugriff auf alle Kurse)" 
                    : "Approved test user (has access to all courses automatically)"}
                </div>
              )}
            </div>

            {/* Courses list */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {isLoadingBookings ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-ink-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue" />
                  <span className="text-xs">{de ? "Lade Buchungsdaten..." : "Loading bookings..."}</span>
                </div>
              ) : courses.filter(c => c.status === "published" && !c.isCustom).length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-3">
                  {de ? "Keine freigegebenen Standardkurse verfügbar." : "No published standard courses available."}
                </div>
              ) : (
                courses
                  .filter(c => c.status === "published" && !c.isCustom)
                  .map(course => {
                    const isBooked = userBookedCourseIds.includes(course.id);
                    const isToggling = loadingCourseBookingId === course.id;

                    return (
                      <div 
                        key={course.id} 
                        className="flex items-center justify-between p-3 rounded-xl border border-line-soft bg-paper hover:bg-paper-2/50 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="text-xs font-bold text-ink truncate max-w-[240px] sm:max-w-xs">{course.title}</div>
                          <div className="text-[9px] text-ink-3 uppercase font-mono mt-0.5">{course.category || (de ? "Allgemein" : "General")}</div>
                        </div>

                        <div>
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue" />
                          ) : (
                            <label className="relative flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isBooked}
                                onChange={() => handleToggleBooking(course.id)}
                                className="w-4 h-4 rounded text-blue border-line focus:ring-0 focus:ring-offset-0 focus:outline-none"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer */}
            <button
              onClick={() => setBookingUser(null)}
              className="w-full bg-ink text-paper py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-ink-2 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
            >
              {de ? "Fertig" : "Done"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
