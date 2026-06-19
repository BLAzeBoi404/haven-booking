"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function ContactsPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const inp = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-400 focus:bg-white text-sm transition-[border-color,background-color]";

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 fade-in">
      <h1 className="display text-2xl font-bold text-gray-900 mb-1">Звʼяжіться з нами</h1>
      <p className="text-gray-500 text-sm mb-10">Відповідаємо протягом 2 годин.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          {[
            { Icon: Phone, t: "Телефон", v: "+38 (044) 123-45-67" },
            { Icon: Mail, t: "Email", v: "support@haven.ua" },
            { Icon: MapPin, t: "Офіс", v: "Київ, вул. Інноваційна, 1" },
            { Icon: Clock, t: "Графік", v: "Пн–Нд: 9:00–22:00" },
          ].map(({ Icon, t, v }) => (
            <div key={t} className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-emerald-700" /></div>
              <div><p className="font-semibold text-sm text-gray-900">{t}</p><p className="text-gray-500 text-xs">{v}</p></div>
            </div>
          ))}
        </div>
        {sent ? (
          <div className="card p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-4" />
            <h3 className="display font-bold text-gray-900 mb-1">Надіслано!</h3>
            <p className="text-gray-500 text-sm">Ми відповімо на {form.email}</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (form.name && form.email && form.msg) setSent(true); }} className="card p-6 flex flex-col gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ваше імʼя" required className={inp} />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required className={inp} />
            <textarea value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} rows={5} placeholder="Повідомлення" required className={`${inp} resize-none`} />
            <button type="submit" className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm">Надіслати</button>
          </form>
        )}
      </div>
    </div>
  );
}
