const SECTIONS: [string, string][] = [
  ["Прийняття умов", "Реєструючись на HAVEN, ви погоджуєтесь з цими Умовами."],
  ["Обовʼязки сторін", "Виконавці надають послуги якісно та вчасно. Клієнти надають достовірну інформацію."],
  ["Оплата", "Оплата домовляється між клієнтом та виконавцем напряму."],
  ["Скасування", "Скасування можливе в розділі «Мої бронювання»."],
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 fade-in">
      <h1 className="display text-2xl font-bold text-gray-900 mb-1">Умови використання</h1>
      <p className="text-gray-400 text-sm mb-8">Редакція 3.1 · 2026</p>
      <div className="space-y-4">
        {SECTIONS.map(([title, text]) => (
          <div key={title} className="card p-5">
            <h3 className="display font-bold text-gray-900 mb-2 text-sm">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
