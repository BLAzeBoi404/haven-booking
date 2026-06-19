const SECTIONS: [string, string][] = [
  ["Збір даних", "Ми збираємо лише інформацію, яку ви надаєте добровільно: імʼя, email та дані профілю. Платіжні реквізити не зберігаються."],
  ["Використання", "Дані використовуються для забезпечення звʼязку між клієнтом та фахівцем. Ми ніколи не продаємо дані третім особам."],
  ["Cookies", "Файли cookie використовуються для збереження сесій. Ви можете відключити їх у налаштуваннях браузера."],
  ["Ваші права", "Ви можете запросити видалення або копію своїх даних. Запити — на privacy@haven.ua."],
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 fade-in">
      <h1 className="display text-2xl font-bold text-gray-900 mb-1">Політика конфіденційності</h1>
      <p className="text-gray-400 text-sm mb-8">Травень 2026 · HAVEN</p>
      {SECTIONS.map(([title, text]) => (
        <div key={title} className="mb-6">
          <h3 className="display font-bold text-gray-900 mb-2 text-sm">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  );
}
