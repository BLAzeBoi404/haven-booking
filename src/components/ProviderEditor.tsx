// =====================================================================
//  ProviderEditor — CRUD послуг + редагування профілю фахівця.
//  Доступ: лише власник профілю (RBAC перевірено і в Server Action).
// =====================================================================

"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "./primitives";
import { Chip } from "./primitives";
import { CATEGORIES } from "@/lib/currency";
import { createService, updateService, deleteService, updateProviderProfile } from "@/server/actions/services";
import type { Lang, Currency, ServiceCardItem } from "@/types";
import { getT } from "@/lib/i18n";
import { convertPrice, currencySymbol } from "@/lib/utils";
import { firstImage } from "@/lib/images";

export function ProviderEditor({
  providerId,
  services,
  initialBio,
  initialSpecialization,
  initialPhone,
  lang,
  currency,
}: {
  providerId: string;
  services: ServiceCardItem[];
  initialBio: string;
  initialSpecialization: string;
  initialPhone: string;
  lang: Lang;
  currency: Currency;
}) {
  const t = getT(lang);
  const sym = currencySymbol(currency);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", desc: "", price: "", images: [] as string[] });
  const [formErr, setFormErr] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profForm, setProfForm] = useState({ bio: initialBio, specialization: initialSpecialization, phone: initialPhone });
  const [profErr, setProfErr] = useState<Record<string, string[]>>({});
  const [profBusy, setProfBusy] = useState(false);

  const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-400 text-sm transition-[border-color]";
  const inpErr = "w-full px-4 py-3 rounded-xl border border-rose-300 outline-none focus:border-rose-400 text-sm transition-[border-color]";

  const save = async () => {
    setBusy(true);
    setFormErr({});
    const payload = { title: form.title, description: form.desc, priceUSD: Number(form.price), images: form.images, category: profForm.specialization || "Різноробочий" };
    const res = editId ? await updateService(editId, payload) : await createService(payload);
    setBusy(false);
    if (res.ok) {
      setShowForm(false); setEditId(null); setForm({ title: "", desc: "", price: "", images: [] });
      setToast(t.svcSaved); setTimeout(() => location.reload(), 600);
    } else if (res.fieldErrors) {
      setFormErr(res.fieldErrors);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Видалити послугу?")) return;
    await deleteService(id);
    setToast(t.svcDeleted);
    setTimeout(() => location.reload(), 600);
  };

  const openEdit = (s: ServiceCardItem) => {
    setForm({ title: s.title, desc: s.description, price: String(s.priceUSD), images: s.images || [] });
    setFormErr({}); setEditId(s.id); setShowForm(true);
  };

  const saveProfile = async () => {
    setProfBusy(true); setProfErr({});
    const res = await updateProviderProfile(profForm);
    setProfBusy(false);
    if (res.ok) { setEditingProfile(false); setToast(t.profileSaved); setTimeout(() => location.reload(), 600); }
    else if (res.fieldErrors) setProfErr(res.fieldErrors);
  };

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[900] bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold pop-in">{toast}</div>
      )}

      {/* Редагування профілю */}
      {editingProfile ? (
        <div className="card p-4 mb-5 slide-up">
          <div className="space-y-3 text-left">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t.specLabel}</label>
              <select value={profForm.specialization} onChange={(e) => setProfForm({ ...profForm, specialization: e.target.value })} className={inp}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t.phoneLabel}</label>
              <input value={profForm.phone} onChange={(e) => setProfForm({ ...profForm, phone: e.target.value })} placeholder="+380 XX XXX XX XX" className={profErr.phone ? inpErr : inp} />
              {profErr.phone && <p className="text-rose-500 text-xs mt-1">{profErr.phone.join(", ")}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{t.bioLabel}</label>
              <textarea value={profForm.bio} onChange={(e) => setProfForm({ ...profForm, bio: e.target.value })} rows={4} className={cn(profErr.bio ? inpErr : inp, "resize-none")} />
            </div>
            <div className="flex gap-2">
              <button onClick={saveProfile} disabled={profBusy} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                {profBusy ? <Spinner /> : null}{t.save}
              </button>
              <button onClick={() => { setEditingProfile(false); setProfErr({}); setProfForm({ bio: initialBio, specialization: initialSpecialization, phone: initialPhone }); }} className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors">{t.cancelBtn}</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditingProfile(true)} className="w-full mb-5 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-[border-color,color]">
          <Edit className="w-3.5 h-3.5" />{t.editProfile}
        </button>
      )}

      {/* Додати послугу */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="display font-bold text-gray-900">{t.services}</h2>
        <button onClick={() => { setShowForm((f) => !f); setEditId(null); setForm({ title: "", desc: "", price: "", images: [] }); setFormErr({}); }} className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />{t.addService}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-5 border-2 border-emerald-200 slide-up">
          <h3 className="display font-bold text-gray-900 mb-4 text-sm">{editId ? "Редагування" : "Нова послуга"}</h3>
          <div className="space-y-3">
            <div>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t.svcTitle} className={formErr.title ? inpErr : inp} />
              {formErr.title && <p className="text-rose-500 text-xs mt-1">{formErr.title.join(", ")}</p>}
            </div>
            <div>
              <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder={t.svcDesc} rows={3} className={cn(formErr.description ? inpErr : inp, "resize-none")} />
              {formErr.description && <p className="text-rose-500 text-xs mt-1">{formErr.description.join(", ")}</p>}
            </div>
            <div>
              <input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder={t.svcPrice} className={formErr.priceUSD ? inpErr : inp} />
              {formErr.priceUSD && <p className="text-rose-500 text-xs mt-1">{formErr.priceUSD.join(", ")}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">{t.specLabel}</label>
              <select value={profForm.specialization} onChange={(e) => setProfForm({ ...profForm, specialization: e.target.value })} className={inp}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Фото ({form.images.length}/4)</p>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 text-sm font-semibold cursor-pointer hover:bg-emerald-100 transition-colors w-max">
                <Upload className="w-4 h-4" />{t.uploadPhoto}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && form.images.length < 4) {
                    // Спрощене завантаження: локальний dataURL для демо.
                    // У продакшені — Cloudinary/CDN, як описано в §3.7.
                    const reader = new FileReader();
                    reader.onload = () => setForm((f) => ({ ...f, images: [...f.images, reader.result as string] }));
                    reader.readAsDataURL(file);
                  }
                  e.target.value = "";
                }} />
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-[opacity] flex items-center justify-center text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={busy} className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {busy ? <Spinner /> : null}{t.save}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setFormErr({}); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">{t.cancelBtn}</button>
          </div>
        </div>
      )}

      {/* Список послуг */}
      {services.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-sm">Послуг поки немає.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((sv) => (
            <a key={sv.id} href={`/services/${sv.id}`} className="card card-hover overflow-hidden cursor-pointer group relative">
              <div className="h-40 overflow-hidden bg-gray-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={firstImage(sv.images, sv.category)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <Chip cat={sv.category} className="mb-2" />
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{sv.title}</h4>
                <p className="display font-bold text-gray-900">{sym}{convertPrice(sv.priceUSD, currency)}</p>
              </div>
              <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-[opacity]" onClick={(e) => e.preventDefault()}>
                <button onClick={() => openEdit(sv)} className="bg-white p-1.5 rounded-lg shadow-sm text-gray-600 hover:text-emerald-700 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(sv.id)} className="bg-white p-1.5 rounded-lg shadow-sm text-gray-600 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </a>
          ))}
        </div>
      )}
      {/* providerId використовується неявно через сесію у Server Actions */}
      <span className="hidden">{providerId}</span>
    </>
  );
}
