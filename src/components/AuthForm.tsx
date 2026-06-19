// =====================================================================
//  AuthForm — форма входу/реєстрації (клієнтська).
//  Викликає Server Actions login/register.
// =====================================================================

"use client";

import { useState } from "react";
import { AlertCircle, User, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "./primitives";
import { COUNTRY_RULES } from "@/lib/currency";
import { login, register } from "@/server/actions/auth";
import type { Lang } from "@/types";

export function AuthForm({ mode: initialMode, lang }: { mode: "login" | "register"; lang: Lang }) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [country, setCountry] = useState("UA");
  const [city, setCity] = useState("");
  const [ltype, setLtype] = useState("fop");
  const [taxId, setTaxId] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const t = lang === "uk" ? { signIn: "Увійти", signUp: "Зареєструватися", welcome: "З поверненням", createAcc: "Реєстрація", clientRole: "Клієнт", specRole: "Фахівець", fillReq: "Заповніть усі поля", testAccounts: "Тестові акаунти", adminHint: "Адмін-панель", clientHint: "Тестовий клієнт", specHint: "Тестовий фахівець" } : { signIn: "Sign In", signUp: "Sign Up", welcome: "Welcome Back", createAcc: "Create Account", clientRole: "Client", specRole: "Specialist", fillReq: "Please fill in all fields", testAccounts: "Test Accounts", adminHint: "Admin Panel", clientHint: "Test Client", specHint: "Test Specialist" };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (mode === "register" && !name.trim()) { setErr(t.fillReq); return; }
    setBusy(true);
    try {
      if (mode === "login") {
        const res = await login({ email, password: pw });
        if (res && !res.ok) setErr(res.error);
      } else {
        const res = await register({ name: name.trim(), email, password: pw, role, country, city, legalType: ltype, taxId });
        if (res && !res.ok) setErr(res.error);
      }
    } catch {
      // redirect() кидає помилку — це нормально, не показуємо її
    } finally {
      setBusy(false);
    }
  };

  const inp = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-[border-color,background-color]";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20 pb-10">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl pop-in overflow-hidden">
        <div className="bg-emerald-800 px-6 pt-6 pb-5">
          <div className="flex gap-1 p-1 bg-black/20 rounded-lg mb-4 w-max">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} className={cn("px-4 py-1.5 rounded-md text-sm font-semibold transition-colors", mode === m ? "bg-white text-emerald-900" : "text-emerald-200 hover:text-white")}>
                {m === "login" ? t.signIn : t.signUp}
              </button>
            ))}
          </div>
          <h3 className="display text-xl font-bold text-white">{mode === "login" ? t.welcome : t.createAcc}</h3>
        </div>

        <div className="p-5">
          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "register" && (
              <div className="flex gap-2 mb-1">
                {([["CLIENT", t.clientRole, User], ["PROVIDER", t.specRole, Briefcase]] as const).map(([r, label, Icon]) => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors", role === r ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
            )}
            {mode === "register" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше імʼя або назва" className={inp} />}
            {mode === "register" && role === "PROVIDER" && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Юридичні дані</p>
                <div className="grid grid-cols-2 gap-2">
                  <select value={country} onChange={(e) => { setCountry(e.target.value); setLtype(COUNTRY_RULES[e.target.value].types[0].v); }} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500">
                    {Object.entries(COUNTRY_RULES).map(([c, d]) => <option key={c} value={c}>{d.name}</option>)}
                  </select>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Місто" className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500" />
                </div>
                <select value={ltype} onChange={(e) => setLtype(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500">
                  {COUNTRY_RULES[country].types.map((tp) => <option key={tp.v} value={tp.v}>{tp.l}</option>)}
                </select>
                <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder={COUNTRY_RULES[country].tax} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-emerald-500" />
              </div>
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inp} autoComplete="email" />
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Пароль" className={inp} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            {err && <p className="text-rose-500 text-sm font-medium flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{err}</p>}
            <button type="submit" disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl mt-1 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              {busy ? <><Spinner />{mode === "login" ? t.signIn : t.signUp}</> : mode === "login" ? t.signIn : t.signUp}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }} className="text-emerald-700 font-semibold hover:underline">
              {mode === "login" ? t.createAcc : t.signIn}
            </button>
          </p>
          {mode === "login" && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">{t.testAccounts}</p>
              <div className="space-y-1.5">
                {([
                  ["admin@gmail.com", "1234", t.adminHint, "border-rose-200 bg-rose-50 text-rose-700"],
                  ["test@gmail.com", "1234", t.clientHint, "border-blue-200 bg-blue-50 text-blue-700"],
                  ["test2@gmail.com", "1234", t.specHint, "border-violet-200 bg-violet-50 text-violet-700"],
                ] as const).map(([email, pw, label, cls]) => (
                  <button key={email} type="button" onClick={() => { setEmail(email); setPw(pw); }} className={cn("w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:opacity-80 flex items-center justify-between", cls)}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {label}
                    </span>
                    <span className="opacity-60 font-mono">{email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
