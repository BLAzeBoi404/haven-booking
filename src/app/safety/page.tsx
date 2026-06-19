import { Shield } from "lucide-react";

const TIPS = [
  { t: "Передоплата", d: "Не переводьте великі суми наперед незнайомим. Домовтесь про оплату після виконання або частинами.", bg: "bg-red-50" },
  { t: "Особисті дані", d: "Не діліться паспортними даними та PIN-кодами в чаті.", bg: "bg-blue-50" },
  { t: "Спілкування", d: "Ведіть основні домовленості через платформу — це допоможе у разі спору.", bg: "bg-emerald-50" },
];

export default function SafetyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center fade-in">
      <Shield className="w-12 h-12 text-emerald-700 mx-auto mb-5" />
      <h1 className="display text-2xl font-bold mb-2">Правила безпеки</h1>
      <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">Поради щоб уникнути шахрайства при замовленні послуг онлайн.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        {TIPS.map(({ t, d, bg }) => (
          <div key={t} className={`p-5 rounded-xl ${bg}`}>
            <h3 className="display font-bold text-gray-900 mb-2 text-sm">{t}</h3>
            <p className="text-gray-600 text-xs leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
