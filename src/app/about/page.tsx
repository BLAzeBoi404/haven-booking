import { Shield, Users, Zap, Globe2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pt-20 pb-16 fade-in">
      <div className="bg-emerald-900 text-white py-14 px-4 text-center mb-10">
        <h1 className="display text-3xl font-bold mb-2">Про HAVEN</h1>
        <p className="text-emerald-200/75 max-w-md mx-auto text-sm leading-relaxed">Платформа для пошуку перевірених фахівців. Якість і довіра в кожній угоді.</p>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[["60+", "Фахівців"], ["14", "Категорій"], ["98%", "Задоволених"], ["4.8", "Рейтинг"]].map(([n, l]) => (
            <div key={n} className="card p-5 text-center">
              <div className="display text-2xl font-bold text-emerald-700 mb-1">{n}</div>
              <div className="text-gray-500 text-xs">{l}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { Icon: Shield, bg: "bg-emerald-50", ic: "text-emerald-700", t: "Захист угоди", d: "Оплата після виконання. Фахівець несе відповідальність за результат." },
            { Icon: Users, bg: "bg-blue-50", ic: "text-blue-700", t: "Спільнота", d: "Перевірені виконавці з реальними відгуками від реальних клієнтів." },
            { Icon: Zap, bg: "bg-violet-50", ic: "text-violet-700", t: "Швидко", d: "Бронювання за кілька кліків. Підтвердження — миттєво." },
            { Icon: Globe2, bg: "bg-orange-50", ic: "text-orange-700", t: "Онлайн і офлайн", d: "Фахівці у вашому місті та в онлайн-форматі." },
          ].map(({ Icon, bg, ic, t, d }) => (
            <div key={t} className={`p-5 rounded-xl ${bg}`}>
              <Icon className={`w-7 h-7 ${ic} mb-3`} />
              <h3 className="display font-bold text-gray-900 mb-1 text-sm">{t}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
