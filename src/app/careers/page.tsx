import { ArrowRight } from "lucide-react";

const JOBS = [
  { t: "Senior React Developer", loc: "Повністю віддалено", dep: "Engineering", s: "$3500–5500" },
  { t: "Product Designer", loc: "Київ / Гібрид", dep: "Design", s: "$2500–4000" },
  { t: "Customer Support", loc: "Повністю віддалено", dep: "Support", s: "$1200–1800" },
  { t: "QA Engineer", loc: "Повністю віддалено", dep: "Engineering", s: "$2000–3500" },
  { t: "SEO Manager", loc: "Київ / Гібрид", dep: "Marketing", s: "$1500–2500" },
];

export default function CareersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 fade-in">
      <h1 className="display text-2xl font-bold text-gray-900 mb-1">Вакансії</h1>
      <p className="text-gray-500 text-sm mb-8">Приєднуйтесь до команди HAVEN.</p>
      <div className="space-y-3">
        {JOBS.map((j) => (
          <div key={j.t} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-emerald-200 transition-[border-color] cursor-pointer group">
            <div className="flex-1">
              <p className="display font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-sm">{j.t}</p>
              <p className="text-gray-500 text-xs mt-0.5">{j.dep} · {j.loc}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-semibold text-sm bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{j.s}</span>
              <span className="text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors flex items-center gap-1">Відгукнутись <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
