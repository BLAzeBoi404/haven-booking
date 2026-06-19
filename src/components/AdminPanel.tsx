// =====================================================================
//  AdminPanel — повноцінна адмін-панель HAVEN.
//  5 вкладок: Статистика, Бронювання, Фахівці, Користувачі, Послуги.
//  Пошук, фільтри, сортування, детальні картки, всі CRUD-дії.
// =====================================================================

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar, Users, Briefcase, Settings, Search, ChevronDown,
  ChevronUp, Mail, MapPin, Star, ShieldCheck, ShieldX, Ban,
  Trash2, Eye, EyeOff, TrendingUp, DollarSign, BarChart3,
  Clock, CheckCircle2, XCircle, AlertTriangle, Filter,
} from "lucide-react";
import { cn, convertPrice, currencySymbol } from "@/lib/utils";
import { Avatar, Chip, Spinner } from "./primitives";
import {
  adminForceCancel,
  toggleProviderVerification,
  adminToggleUserBlocked,
  adminChangeUserRole,
  adminDeleteUser,
  adminToggleServiceHidden,
  adminDeleteService,
} from "@/server/actions/admin";
import type { Lang, Currency } from "@/types";
import { getT, STATUS_MAP } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/currency";

// --- Types from server -------------------------------------------------------

interface AdminStats {
  total: number;
  confirmed: number;
  cancelled: number;
  providers: number;
  clients: number;
  revenue: number;
}

interface AdminBooking {
  id: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  priceUSD: number;
  status: keyof typeof STATUS_MAP;
  createdAt: Date;
}

interface AdminProvider {
  id: string;
  name: string;
  email: string;
  specialization: string;
  location: string;
  verified: boolean;
  blocked: boolean;
  rating: number;
  completedJobs: number;
  reviewsCount: number;
  successRate: number;
  servicesCount: number;
  createdAt: Date;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  verified: boolean;
  location: string;
  specialization: string | null;
  createdAt: Date;
  servicesCount: number;
}

interface AdminService {
  id: string;
  title: string;
  description: string;
  priceUSD: number;
  category: string;
  hidden: boolean;
  rating: number;
  providerId: string;
  providerName: string;
  createdAt: Date;
}

type Tab = "stats" | "bookings" | "providers" | "users" | "services";

// --- Component ---------------------------------------------------------------

export function AdminPanel({
  stats,
  bookings,
  providers,
  users,
  services,
  lang,
  currency,
}: {
  stats: AdminStats;
  bookings: AdminBooking[];
  providers: AdminProvider[];
  users: AdminUser[];
  services: AdminService[];
  lang: Lang;
  currency: Currency;
}) {
  const t = getT(lang);
  const sym = currencySymbol(currency);
  const { rate } = CURRENCIES[currency];
  const [tab, setTab] = useState<Tab>("stats");
  const [bk, setBk] = useState(bookings);
  const [profs, setProfs] = useState(providers);
  const [usr, setUsr] = useState(users);
  const [svcs, setSvcs] = useState(services);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [busy, setBusy] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    type: "deleteUser" | "deleteService";
    id: string;
    name: string;
  } | null>(null);

  // --- Actions ---------------------------------------------------------------

  const forceCancel = async (id: string) => {
    setBk((p) => p.map((b) => (b.id === id ? { ...b, status: "CANCELLED_ADMIN" as const } : b)));
    await adminForceCancel(id);
  };

  const toggleVerify = async (id: string) => {
    setProfs((p) => p.map((pr) => (pr.id === id ? { ...pr, verified: !pr.verified } : pr)));
    await toggleProviderVerification(id);
  };

  const toggleBlocked = async (id: string) => {
    setUsr((p) => p.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u)));
    await adminToggleUserBlocked(id);
  };

  const changeRole = async (id: string, role: "CLIENT" | "PROVIDER") => {
    setUsr((p) => p.map((u) => (u.id === id ? { ...u, role } : u)));
    await adminChangeUserRole(id, role);
  };

  const deleteUser = async (id: string) => {
    setUsr((p) => p.filter((u) => u.id !== id));
    await adminDeleteUser(id);
    setConfirmAction(null);
  };

  const toggleHidden = async (id: string) => {
    setSvcs((p) => p.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)));
    await adminToggleServiceHidden(id);
  };

  const deleteService = async (id: string) => {
    setSvcs((p) => p.filter((s) => s.id !== id));
    await adminDeleteService(id);
    setConfirmAction(null);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  // --- Filtered / sorted data ------------------------------------------------

  const filteredBookings = useMemo(() => {
    let list = [...bk];
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.serviceName.toLowerCase().includes(q) ||
        b.providerName.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      else if (sortField === "price") cmp = a.priceUSD - b.priceUSD;
      else if (sortField === "serviceName") cmp = a.serviceName.localeCompare(b.serviceName);
      else cmp = a.createdAt > b.createdAt ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [bk, statusFilter, search, sortField, sortDir]);

  const filteredProviders = useMemo(() => {
    let list = [...profs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.specialization.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q),
      );
    }
    return list;
  }, [profs, search]);

  const filteredUsers = useMemo(() => {
    let list = [...usr];
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [usr, roleFilter, search]);

  const filteredServices = useMemo(() => {
    let list = [...svcs];
    if (catFilter !== "all") list = list.filter((s) => s.category === catFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.providerName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [svcs, catFilter, search]);

  const categories = useMemo(() => {
    const set = new Set(svcs.map((s) => s.category));
    return Array.from(set).sort();
  }, [svcs]);

  // --- Tabs config -----------------------------------------------------------

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "stats", label: t.adminStats, icon: <BarChart3 className="w-4 h-4" /> },
    { key: "bookings", label: t.adminBookings, icon: <Calendar className="w-4 h-4" /> },
    { key: "providers", label: t.adminProviders, icon: <Briefcase className="w-4 h-4" /> },
    { key: "users", label: t.adminUsers, icon: <Users className="w-4 h-4" /> },
    { key: "services", label: t.adminServices, icon: <Settings className="w-4 h-4" /> },
  ];

  const SortBtn = ({ field, label }: { field: string; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-0.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
      {label}
      {sortField === field && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
    </button>
  );

  const statCards = [
    { label: t.statBookings, value: stats.total, icon: <Calendar className="w-5 h-5" />, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: t.statConfirmed, value: stats.confirmed, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
    { label: t.statCancelled, value: stats.cancelled, icon: <XCircle className="w-5 h-5" />, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100" },
    { label: t.statProviders, value: stats.providers, icon: <Briefcase className="w-5 h-5" />, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100" },
    { label: t.statClients, value: stats.clients, icon: <Users className="w-5 h-5" />, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-100" },
    { label: `${t.statRevenue} (${sym})`, value: `${sym}${Math.round(stats.revenue * rate).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
  ];

  const totalBookingsForProvider = (pid: string) => bk.filter((b) => b.providerId === pid).length;
  const totalRevenueForProvider = (pid: string) => bk.filter((b) => b.providerId === pid && b.status === "CONFIRMED").reduce((s, b) => s + b.priceUSD, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 mt-2">
        <div>
          <h1 className="display text-2xl font-bold text-gray-900">{t.adminPanel}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t.adminSubtext}</p>
        </div>
        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3" /> ADMIN
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(({ key, label, icon }) => (
          <button key={key} onClick={() => { setTab(key); setSearch(""); setStatusFilter("all"); setRoleFilter("all"); setCatFilter("all"); }} className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap", tab === key ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-800")}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ========== STATS ========== */}
      {tab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map(({ label, value, icon, color, bg, border }) => (
              <div key={label} className={cn("card p-4 border", border, bg)}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("opacity-70", color)}>{icon}</span>
                </div>
                <div className={cn("display text-2xl font-bold", color)}>{value}</div>
                <div className="text-gray-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Revenue chart summary */}
          <div className="card p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" />{t.adminRevenueOverview}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-semibold">{t.adminRevenue}</p>
                <p className="display text-xl font-bold text-emerald-800 mt-1">{sym}{Math.round(stats.revenue * rate).toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold">{t.adminAvgBooking}</p>
                <p className="display text-xl font-bold text-blue-800 mt-1">{sym}{stats.confirmed ? Math.round((stats.revenue / stats.confirmed) * rate).toLocaleString() : 0}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                <p className="text-xs text-violet-600 font-semibold">{t.adminConversionRate}</p>
                <p className="display text-xl font-bold text-violet-800 mt-1">{stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0}%</p>
              </div>
            </div>
          </div>

          {/* Top providers */}
          <div className="card p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" />{t.adminTopProviders}</h3>
            <div className="space-y-3">
              {[...profs].sort((a, b) => totalRevenueForProvider(b.id) - totalRevenueForProvider(a.id)).slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.specialization} · {p.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-emerald-700">{sym}{Math.round(totalRevenueForProvider(p.id) * rate).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{totalBookingsForProvider(p.id)} {t.adminBookings.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== BOOKINGS ========== */}
      {tab === "bookings" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.adminSearchBookings} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex gap-2">
              {(["all", "CONFIRMED", "CANCELLED_USER", "CANCELLED_ADMIN", "REJECTED"] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-2 rounded-xl text-xs font-semibold border transition-colors", statusFilter === s ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
                  {s === "all" ? t.adminAll : t[`status${s}` as keyof typeof t] as string || s}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 && <p className="text-gray-400 text-sm text-center py-16">{t.adminNoBookings}</p>}

          <div className="card overflow-hidden border border-gray-100">
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <SortBtn field="serviceName" label={t.adminService} />
              <SortBtn field="date" label={t.adminDate} />
              <SortBtn field="price" label={t.adminPrice} />
              <span>{t.adminClient}</span>
              <span>{t.adminStatus}</span>
              <span>{t.adminActions}</span>
            </div>
            {filteredBookings.map((b) => {
              const info = STATUS_MAP[b.status];
              const canCancel = b.status === "CONFIRMED";
              return (
                <div key={b.id} className={cn("px-4 py-3 flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] lg:items-center gap-2 lg:gap-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors", b.status !== "CONFIRMED" && "opacity-70")}>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm truncate">{b.serviceName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{b.providerName}</p>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(b.date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}, {b.time}
                  </div>
                  <div className="font-bold text-sm text-gray-900">{sym}{convertPrice(b.priceUSD, currency)}</div>
                  <div className="text-sm">
                    <p className="text-gray-900 font-medium truncate">{b.clientName}</p>
                    <p className="text-xs text-gray-400">{b.clientEmail}</p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-max", info.cls)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", info.dot)} />
                    {t[info.key as keyof typeof t] as string}
                  </span>
                  <div className="flex gap-1.5">
                    {canCancel && (
                      <button onClick={() => forceCancel(b.id)} className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />{t.adminForceCancel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-right">{filteredBookings.length} / {bk.length} {t.adminBookings.toLowerCase()}</p>
        </div>
      )}

      {/* ========== PROVIDERS ========== */}
      {tab === "providers" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.adminSearchProviders} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500 transition-colors" />
          </div>

          {filteredProviders.length === 0 && <p className="text-gray-400 text-sm text-center py-16">{t.adminNoProviders}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProviders.map((p) => {
              const bkCount = totalBookingsForProvider(p.id);
              const rev = totalRevenueForProvider(p.id);
              return (
                <div key={p.id} className={cn("card p-5 border transition-all", p.blocked ? "border-rose-200 bg-rose-50/30" : "border-gray-100")}>
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={p.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                        {p.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {p.blocked && <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400">{p.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.specialization} · {p.location}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "★", value: p.rating.toFixed(1), color: "text-amber-600" },
                      { label: t.adminBookingsShort, value: String(bkCount), color: "text-blue-600" },
                      { label: t.adminJobs, value: String(p.completedJobs), color: "text-emerald-600" },
                      { label: t.adminRevenueShort, value: `${sym}${Math.round(rev * rate)}`, color: "text-violet-600" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <p className={cn("display text-sm font-bold", color)}>{value}</p>
                        <p className="text-[10px] text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Link href={`/providers/${p.id}`} className="flex-1 text-xs font-semibold text-gray-600 border border-gray-200 py-2 rounded-xl hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />{t.adminView}
                    </Link>
                    <button onClick={() => toggleVerify(p.id)} className={cn("flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors flex items-center justify-center gap-1", p.verified ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50")}>
                      {p.verified ? <ShieldX className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {p.verified ? t.adminUnverify : t.adminVerify}
                    </button>
                    <button onClick={() => toggleBlocked(p.id)} className={cn("flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors flex items-center justify-center gap-1", p.blocked ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-rose-200 text-rose-600 hover:bg-rose-50")}>
                      {p.blocked ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {p.blocked ? t.adminUnblock : t.adminBlock}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-right">{filteredProviders.length} / {profs.length}</p>
        </div>
      )}

      {/* ========== USERS ========== */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.adminSearchUsers} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex gap-2">
              {(["all", "CLIENT", "PROVIDER", "ADMIN"] as const).map((r) => (
                <button key={r} onClick={() => setRoleFilter(r)} className={cn("px-3 py-2 rounded-xl text-xs font-semibold border transition-colors", roleFilter === r ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
                  {r === "all" ? t.adminAll : r}
                </button>
              ))}
            </div>
          </div>

          {filteredUsers.length === 0 && <p className="text-gray-400 text-sm text-center py-16">{t.adminNoUsers}</p>}

          <div className="card overflow-hidden border border-gray-100">
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>{t.adminUserName}</span>
              <span>{t.adminRole}</span>
              <span>{t.adminLocation}</span>
              <span>{t.adminRegistered}</span>
              <span>{t.adminActions}</span>
            </div>
            {filteredUsers.map((u) => (
              <div key={u.id} className={cn("px-4 py-3 flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center gap-2 lg:gap-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors", u.blocked && "opacity-60")}>
                <div className="flex items-center gap-2.5">
                  <Avatar name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                  </div>
                  {u.blocked && <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">BLOCKED</span>}
                </div>
                <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-max", u.role === "ADMIN" ? "bg-rose-100 text-rose-700" : u.role === "PROVIDER" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700")}>
                  {u.role === "ADMIN" ? <ShieldCheck className="w-3 h-3" /> : u.role === "PROVIDER" ? <Briefcase className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {u.role}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" />{u.location}</span>
                <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString("uk-UA")}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {u.role !== "ADMIN" && (
                    <>
                      {u.role === "CLIENT" ? (
                        <button onClick={() => changeRole(u.id, "PROVIDER")} className="text-xs font-semibold text-violet-600 border border-violet-200 px-2.5 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                          → PROVIDER
                        </button>
                      ) : (
                        <button onClick={() => changeRole(u.id, "CLIENT")} className="text-xs font-semibold text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                          → CLIENT
                        </button>
                      )}
                      <button onClick={() => toggleBlocked(u.id)} className={cn("text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1", u.blocked ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50" : "text-rose-600 border-rose-200 hover:bg-rose-50")}>
                        {u.blocked ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {u.blocked ? t.adminUnblock : t.adminBlock}
                      </button>
                      <button onClick={() => setConfirmAction({ type: "deleteUser", id: u.id, name: u.name })} className="text-xs font-semibold text-rose-500 border border-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right">{filteredUsers.length} / {usr.length}</p>
        </div>
      )}

      {/* ========== SERVICES ========== */}
      {tab === "services" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.adminSearchServices} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setCatFilter("all")} className={cn("px-3 py-2 rounded-xl text-xs font-semibold border transition-colors", catFilter === "all" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                {t.adminAll}
              </button>
              {categories.slice(0, 8).map((c) => (
                <Chip key={c} cat={c} onClick={() => setCatFilter(catFilter === c ? "all" : c)} className={cn("cursor-pointer", catFilter === c && "ring-2 ring-emerald-500 ring-offset-1")} />
              ))}
            </div>
          </div>

          {filteredServices.length === 0 && <p className="text-gray-400 text-sm text-center py-16">{t.adminNoServices}</p>}

          <div className="card overflow-hidden border border-gray-100">
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>{t.adminServiceTitle}</span>
              <span>{t.adminCategory}</span>
              <span>{t.adminPrice}</span>
              <span>{t.adminProvider}</span>
              <span>{t.adminActions}</span>
            </div>
            {filteredServices.map((s) => (
              <div key={s.id} className={cn("px-4 py-3 flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center gap-2 lg:gap-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors", s.hidden && "opacity-50")}>
                <div>
                  <p className="font-semibold text-gray-900 text-sm truncate">{s.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{s.description.slice(0, 80)}{s.description.length > 80 ? "…" : ""}</p>
                </div>
                <div><Chip cat={s.category} /></div>
                <div className="font-bold text-sm text-gray-900">{sym}{convertPrice(s.priceUSD, currency)}</div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs">{s.rating.toFixed(1)}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs truncate">{s.providerName}</span>
                </div>
                <div className="flex gap-1.5">
                  <Link href={`/services/${s.id}`} className="text-xs font-semibold text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                  </Link>
                  <button onClick={() => toggleHidden(s.id)} className={cn("text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1", s.hidden ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-amber-200 text-amber-600 hover:bg-amber-50")}>
                    {s.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {s.hidden ? t.adminShow : t.adminHide}
                  </button>
                  <button onClick={() => setConfirmAction({ type: "deleteService", id: s.id, name: s.title })} className="text-xs font-semibold text-rose-500 border border-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right">{filteredServices.length} / {svcs.length}</p>
        </div>
      )}

      {/* ========== CONFIRM DIALOG ========== */}
      {confirmAction && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 fade-in">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmAction(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 pop-in p-6 text-center">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{t.adminConfirmDelete}</h3>
            <p className="text-gray-500 text-sm mb-6">
              {confirmAction.type === "deleteUser" ? t.adminConfirmDeleteUser : t.adminConfirmDeleteService}: <strong>{confirmAction.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">{t.cancelBtn}</button>
              <button onClick={() => confirmAction.type === "deleteUser" ? deleteUser(confirmAction.id) : deleteService(confirmAction.id)} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">{t.adminDelete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
