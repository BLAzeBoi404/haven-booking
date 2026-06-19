"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const FAQS: [string, string][] = [
  ["Як стати фахівцем?", "Зареєструйтесь з роллю «Фахівець». Заповніть профіль і додайте послуги через кнопку «Додати послугу»."],
  ["Як відбувається оплата?", "Оплата домовляється напряму з фахівцем при зустрічі: готівка або банківський переказ (Monobank, PrivatBank, IBAN)."],
  ["Що якщо виконавець не виконав роботу?", "Напишіть нам на support@haven.ua. Ми допоможемо вирішити суперечку між сторонами."],
  ["Як залишити відгук?", "Перейдіть на сторінку послуги і заповніть форму відгуку. Тільки авторизовані клієнти можуть залишати відгуки."],
  ["Чи можна скасувати бронювання?", "Так, у розділі «Мої бронювання» натисніть «Скасувати» поруч з активним бронюванням."],
  ["Як змінити мову і валюту?", "Натисніть на прапорець або символ валюти в шапці сайту. Зміни застосовуються миттєво."],
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 fade-in">
      <h1 className="display text-2xl font-bold text-gray-900 mb-1">Часті питання</h1>
      <p className="text-gray-500 text-sm mb-8">Не знайшли відповідь? <a href="mailto:support@haven.ua" className="text-emerald-700 font-semibold hover:underline">support@haven.ua</a></p>
      <div className="space-y-2">
        {FAQS.map(([q, a], i) => (
          <div key={i} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
              <span>{q}</span>
              {open === i ? <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
            {open === i && <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
