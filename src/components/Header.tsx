"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { LANGS, CURRENCY_LIST } from "@/lib/currency";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Avatar, Spinner } from "./primitives";
import { logout, logoutToLogin } from "@/server/actions/auth";
import { getLinkedAccounts, switchAccount, type LinkedAccount } from "@/server/actions/accounts";
import type { SessionUser } from "@/types";
import { usePrefs } from "./PrefsProvider";

export function Header({ user }: { user: SessionUser | null }) {
  const { lang, currency, setLang, setCurrency } = usePrefs();
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const t = getT(lang);
  const onLangChange = setLang;
  const onCurrencyChange = setCurrency;
  const closeAll = () => { setLangOpen(false); setCurrOpen(false); setProfileOpen(false); };

  // Загрузить привязанные аккаунты при hover/open профиля
  const loadAccounts = () => {
    if (user && linkedAccounts.length === 0) {
      getLinkedAccounts().then(setLinkedAccounts).catch(() => {});
    }
  };

  const doSwitch = (userId: string) => {
    if (switchingId) return;
    setSwitchingId(userId);
    switchAccount(userId).then((res) => {
      if (res.ok) {
        window.location.href = "/";
        return; // не сбрасываем switchingId — страница всё равно перезагрузится
      }
      setSwitchingId(null);
    }).catch(() => setSwitchingId(null));
  };

  const roleLabel = (role: string) => {
    if (role === "PROVIDER") return t.specRole;
    if (role === "ADMIN") return t.adminPanel;
    return t.clientRole;
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <button onClick={() => {
          if (window.location.pathname === "/" && !window.location.search && !window.location.hash) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          window.location.href = "/";
        }} className="flex items-center gap-2 shrink-0 group" title="На головну">
          <div className="w-8 h-8 bg-emerald-700 group-hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="display font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">HAVEN</span>
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <button onClick={() => { setLangOpen((o) => !o); setCurrOpen(false); setProfileOpen(false); }} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5">
              {LANGS.find((l) => l.code === lang)?.flag} {lang.toUpperCase()} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAll} />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  {LANGS.map((l) => (
                    <button key={l.code} onClick={() => { onLangChange(l.code); closeAll(); }} className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 hover:bg-gray-50 transition-colors", lang === l.code ? "text-emerald-700 font-semibold" : "text-gray-700")}>
                      {l.flag}{l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setCurrOpen((o) => !o); setLangOpen(false); setProfileOpen(false); }} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5">
              {CURRENCY_LIST.find((c) => c.code === currency)?.sym} {currency} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {currOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAll} />
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  {CURRENCY_LIST.map((c) => (
                    <button key={c.code} onClick={() => { onCurrencyChange(c.code); closeAll(); }} className={cn("w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors", currency === c.code ? "text-emerald-700 font-semibold" : "text-gray-700")}>
                      {c.sym} {c.code}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <Link href="/bookings" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t.myBookings}</Link>
              {user.role === "PROVIDER" && <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t.myProfile}</Link>}
              {user.role === "ADMIN" && <Link href="/admin" className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">{t.adminPanel}</Link>}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen((o) => !o); setLangOpen(false); setCurrOpen(false); loadAccounts(); }}
                  onMouseEnter={loadAccounts}
                  className={cn("flex items-center gap-2 transition-colors", profileOpen ? "text-emerald-700" : "text-gray-900 hover:text-emerald-700")}
                >
                  <Avatar name={user.name} size="xs" />
                  <span className="text-sm font-medium max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={cn("w-3 h-3.5 transition-transform", profileOpen && "rotate-180")} />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={closeAll} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      {/* Текущий аккаунт */}
                      <div className="px-3 py-2.5 bg-emerald-50 rounded-t-xl border-b border-emerald-100">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={user.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-emerald-700">{roleLabel(user.role)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Привязанные аккаунты */}
                      {linkedAccounts.length > 0 && (
                        <div className="py-1 border-b border-gray-100">
                          <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t.switchAccount}</p>
                          {linkedAccounts.filter((a) => a.id !== user.id).map((acc) => (
                            <button
                              key={acc.id}
                              onClick={() => doSwitch(acc.id)}
                              disabled={!!switchingId}
                              className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                              <Avatar name={acc.name} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 truncate">{acc.name}</p>
                                <p className="text-xs text-gray-400">{roleLabel(acc.role)}</p>
                              </div>
                              {switchingId === acc.id && <Spinner />}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Действия */}
                      <div className="py-1">
                        <button onClick={() => { closeAll(); logoutToLogin(); }} className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                          + {t.addAccount}
                        </button>
                        <button onClick={() => { closeAll(); logout(); }} className="w-full text-left px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2">
                          <LogOut className="w-3.5 h-3.5" />{t.logout}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">{t.login}</Link>
              <Link href="/register" className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">{t.register}</Link>
            </div>
          )}
        </div>

        <button className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2 fade-in">
          {user ? (
            <>
              <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl mb-3">
                <Avatar name={user.name} size="sm" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{roleLabel(user.role)}</p>
                </div>
              </div>
              {/* Привязанные аккаунты (мобильная версия) */}
              {linkedAccounts.filter((a) => a.id !== user.id).map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => doSwitch(acc.id)}
                  disabled={!!switchingId}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2.5 disabled:opacity-60"
                >
                  <Avatar name={acc.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{acc.name}</p>
                    <p className="text-xs text-gray-400">{roleLabel(acc.role)}</p>
                  </div>
                  {switchingId === acc.id && <Spinner />}
                </button>
              ))}
              <button onClick={() => { setMenuOpen(false); logoutToLogin(); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-emerald-700 block">+ {t.addAccount}</button>
              <Link href="/bookings" onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 block">{t.myBookings}</Link>
              {user.role === "PROVIDER" && <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 block">{t.myProfile}</Link>}
              {user.role === "ADMIN" && <Link href="/admin" onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-50 text-sm font-medium text-rose-500 block">{t.adminPanel}</Link>}
              <button onClick={() => logout()} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-50 text-sm font-medium text-rose-500 flex items-center gap-2">
                <LogOut className="w-4 h-4" />{t.logout}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="bg-gray-100 text-gray-800 font-semibold py-2.5 rounded-xl text-sm text-center">{t.login}</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm text-center">{t.register}</Link>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => { onLangChange(l.code); setMenuOpen(false); }} className={cn("py-2 rounded-xl text-sm font-medium", lang === l.code ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-700")}>
                {l.flag} {l.code.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCY_LIST.map((c) => (
              <button key={c.code} onClick={() => { onCurrencyChange(c.code); setMenuOpen(false); }} className={cn("py-2 rounded-xl text-xs font-bold", currency === c.code ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-700")}>
                {c.sym}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
