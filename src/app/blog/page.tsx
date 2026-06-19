const POSTS = [
  { cat: "Аналітика", c: "text-emerald-700 bg-emerald-50", t: "Топ-10 послуг у 2026", d: "Зростання попиту на AI-інтеграторів, екодизайн та дистанційних юристів.", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800", date: "15 трав 2026" },
  { cat: "Поради", c: "text-blue-700 bg-blue-50", t: "Як оформити профіль фахівця", d: "Секрети заповнення портфоліо, що збільшують кількість замовлень на 40%.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800", date: "8 трав 2026" },
  { cat: "Новини", c: "text-violet-700 bg-violet-50", t: "Нові способи оплати", d: "Тепер підтримуються Monobank, PrivatBank та IBAN-перекази.", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800", date: "1 трав 2026" },
  { cat: "Гайд", c: "text-orange-700 bg-orange-50", t: "7 способів перевірити виконавця", d: "Як обрати надійного фахівця і уникнути шахраїв.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800", date: "22 квіт 2026" },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 fade-in">
      <h1 className="display text-2xl font-bold text-gray-900 mb-1">Блог</h1>
      <p className="text-gray-500 text-sm mb-8">Поради, аналітика та новини</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {POSTS.map((p) => (
          <div key={p.t} className="card card-hover overflow-hidden cursor-pointer group">
            <div className="h-44 overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.c}`}>{p.cat}</span>
                <span className="text-gray-400 text-xs">{p.date}</span>
              </div>
              <h3 className="display font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors text-sm">{p.t}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{p.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
