// =====================================================================
//  HAVEN — database seeding (§3.7 диплома)
//  Автоматичне наповнення СУБД демонстраційними сутностями.
//  Запуск: npm run db:seed
// =====================================================================

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Завантаження .env (prisma db push робить це автоматично, але node-скрипт сида — ні)
import { config } from "dotenv";
config();

const prisma = new PrismaClient();

// --- Довідники категорій ------------------------------------------------
// Зображення тепер generaються через picsum.photos зі стабільним seed-рядком
// (src/lib/images.ts). Цей джерело НІКОЛИ не віддає 404/blocked, тож фото
// сантехніків та всіх інших категорій гарантовано показується, а галерея
// деталі послуги отримує 6 різних фото однієї теми.
import { galleryImages } from "../src/lib/images.ts";

const IMGS: Record<string, string[]> = {};
const SPECS_ALL = [
  "Електрик", "Сантехнік", "Клінінг", "Ремонт ПК", "Фотограф", "Веб-розробник",
  "Дизайнер", "Вантажник", "Юрист", "Перекладач", "Ремонт квартир", "Дизайн інтер'єру",
  "Репетитор", "Масаж",
];
for (const s of SPECS_ALL) IMGS[s] = galleryImages(s, 8);

const DESCS: Record<string, string> = {
  "Електрик": "Монтаж, ремонт та обслуговування електромереж. Заміна проводки, розеток, щитів, лічильників. Терміновий виїзд.",
  "Сантехнік": "Усунення протікань, заміна труб і сантехніки, встановлення бойлерів. Гарантія 12 місяців.",
  "Клінінг": "Прибирання квартир, офісів та після ремонту. Генеральне прибирання, хімчистка, миття вікон.",
  "Ремонт ПК": "Діагностика та ремонт ПК і ноутбуків, встановлення ОС, захист від вірусів, відновлення даних.",
  "Фотограф": "Портрети, весілля, продукти та заходи. Авторська обробка, здача за 24–48 годин.",
  "Веб-розробник": "Сайти, лендинги та інтернет-магазини. React, Vue.js, Next.js. SEO-оптимізація та підтримка.",
  "Дизайнер": "Логотипи, фірмовий стиль, банери, SMM-контент, поліграфія. Унікальні рішення у стислі терміни.",
  "Вантажник": "Переїзди, доставка меблів, підйом на поверх. Власний транспорт. Дбайливо та без пошкоджень.",
  "Юрист": "Консультації, договори, угоди з нерухомістю, захист у суді. Реєстрація ФОП/ТОВ. 10+ років.",
  "Перекладач": "Переклад: англійська, польська, німецька. Нотаріальний переклад документів. Локалізація.",
  "Ремонт квартир": "Ремонт квартир під ключ. Штукатурка, фарбування, плитка, ламінат. Щоденний фотозвіт.",
  "Дизайн інтер'єру": "Дизайн-проекти квартир та комерційних просторів. 3D-візуалізація, авторський нагляд.",
  "Репетитор": "Математика, англійська, фізика, хімія. Підготовка до НМТ та IELTS. Онлайн та офлайн.",
  "Масаж": "Лікувальний, розслаблюючий та спортивний масаж. Виїзд додому. Медична освіта.",
};

const NAMES = ["Олександр", "Марія", "Іван", "Анна", "Дмитро", "Юлія", "Максим", "Катерина", "Артем", "Вікторія", "Сергій", "Олена", "Андрій", "Тетяна", "Михайло"];
const SURNS = ["Коваленко", "Ткаченко", "Кравченко", "Шевченко", "Мороз", "Бондаренко", "Лисенко", "Савченко", "Поліщук", "Гончаренко"];
const CORPS = ["CleanHome Pro", "МайстерБуд", "TechFix UA", "ArtSpace Studio", "LegalHelp UA", "TranslateUA", "PhotoArt", "WebCraft", "InteriorLab", "FixMaster"];
const LOCS = [
  { country: "Україна", city: "Київ" }, { country: "Україна", city: "Львів" },
  { country: "Україна", city: "Одеса" }, { country: "Україна", city: "Харків" },
  { country: "Україна", city: "Дніпро" }, { country: "Польща", city: "Варшава" },
  { country: "Польща", city: "Краків" }, { country: "Німеччина", city: "Берлін" },
  { country: "Онлайн", city: "Онлайн" },
];
const BIOS = [
  "Досвідчений фахівець з понад 10 роками практики. Гарантую якісне виконання в строк.",
  "Надійний партнер для ваших завдань. Прозора ціна, офіційний договір і гарантія.",
  "Спеціалізуюсь на складних проектах. Власне обладнання, безкоштовна оцінка.",
  "Сертифікований фахівець. Роблю роботу якісно та з відповідальністю за результат.",
];

const SPECS = Object.keys(IMGS);
const rnd = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rndN = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

/** Перемішати масив фото (Fisher–Yates), щоб картка каталогу images[0]
 *  для кожного фахівця тієї ж категорії показувала РІЗНЕ фото. */
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  console.log("🌱 Сидування HAVEN…");

  // Очищення (порядок враховує FK)
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash("1234", 10);
  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      passwordHash: adminPass,
      name: "Адміністратор HAVEN",
      role: Role.ADMIN,
      verified: true,
    },
  });
  console.log(`  ✓ admin@gmail.com / 1234`);

  const clientPass = await bcrypt.hash("1234", 10);
  await prisma.user.create({
    data: {
      email: "test@gmail.com",
      passwordHash: clientPass,
      name: "Тестовий клієнт",
      role: Role.CLIENT,
    },
  });
  console.log(`  ✓ test@gmail.com / 1234`);

  const demoLoc = LOCS[0];
  const demoSpec = SPECS[0];
  const demoProvider = await prisma.user.create({
    data: {
      email: "test2@gmail.com",
      passwordHash: await bcrypt.hash("1234", 10),
      name: "Тестовий Фахівець",
      role: Role.PROVIDER,
      verified: true,
      specialization: demoSpec,
      bio: "Демонстраційний акаунт фахівця.",
      phone: "+38 050 123 45 67",
      country: demoLoc.country,
      city: demoLoc.city,
      location: demoLoc.city,
      experience: "5 років",
      rating: 4.9,
      reviewsCount: 42,
      completedJobs: 88,
      successRate: 99,
    },
  });
  await prisma.service.create({
    data: {
      providerId: demoProvider.id,
      title: `${demoSpec} — Тестовий Фахівець`,
      description: DESCS[demoSpec] || `Послуги: ${demoSpec}`,
      priceUSD: 35,
      category: demoSpec,
      images: shuffled(IMGS[demoSpec] || []),
      rating: 4.9,
    },
  });
  console.log(`  ✓ test2@gmail.com / 1234`);

  // --- Фахівці + їхні послуги -----------------------------------------
  for (let i = 0; i < 60; i++) {
    const isCompany = i % 3 === 0;
    const loc = rnd(LOCS);
    const spec = SPECS[i % SPECS.length];
    const name = isCompany ? CORPS[i % CORPS.length] : `${rnd(NAMES)} ${rnd(SURNS)}`;
    const years = (i % 14) + 1;
    const rating = Number((4.1 + Math.random() * 0.89).toFixed(1));

    const provider = await prisma.user.create({
      data: {
        email: `provider${i + 1}@haven.ua`,
        passwordHash: await bcrypt.hash("provider123", 10),
        name,
        role: Role.PROVIDER,
        verified: Math.random() > 0.15,
        specialization: spec,
        bio: rnd(BIOS),
        phone: `+38 0${rndN(50, 99)} ${rndN(100, 999)} ${rndN(10, 99)} ${rndN(10, 99)}`,
        country: loc.country,
        city: loc.city,
        location: loc.city,
        experience: `${years} ${years === 1 ? "рік" : years < 5 ? "роки" : "років"}`,
        rating,
        reviewsCount: rndN(8, 220),
        completedJobs: rndN(15, 450),
        successRate: rndN(92, 100),
      },
    });

    const price = rndN(18, 200);
    await prisma.service.create({
      data: {
        providerId: provider.id,
        title: isCompany ? `${spec} — ${name}` : spec,
        description: DESCS[spec] || `Послуги: ${spec}`,
        priceUSD: price,
        category: spec,
        images: shuffled(IMGS[spec] || []),
        rating,
      },
    });
  }
  console.log(`  ✓ 60 фахівців + 60 послуг`);

  // --- Кілька відгуків -------------------------------------------------
  const services = await prisma.service.findMany({ take: 6 });
  const sampleReviews = [
    { authorName: "Олексій П.", rating: 5, text: "Чудова якість! Все зробив вчасно і акуратно." },
    { authorName: "Марина С.", rating: 5, text: "Справжній профі. Рекомендую!" },
    { authorName: "Дмитро К.", rating: 4, text: "Добре виконав роботу. Результатом задоволений." },
  ];
  for (let i = 0; i < services.length; i++) {
    await prisma.review.create({
      data: { ...sampleReviews[i % sampleReviews.length], serviceId: services[i].id },
    });
  }
  console.log(`  ✓ ${services.length} відгуків`);

  console.log(`\n✅ Сидування завершено. Вхід: admin@gmail.com / 1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
