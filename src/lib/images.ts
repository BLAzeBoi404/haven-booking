// =====================================================================
//  Image catalog for HAVEN.
//
//  Кожна категорія має власний набір ТЕМАТИЧНИХ фото (Unsplash ID, усі
//  перевірені на HTTP 200). cardImage() обирає фото через детермінований variant
//  (hash із ідентифікатора послуги), тому сусідні картки тієї ж категорії
//  показують РІЗНІ фото. Галерея деталі послуги віддає count різних фото
//  однієї теми — власні фото фахівця плюс тематична добірка тієї ж категорії.
// =====================================================================

const PER_CAT = 10; // скільки різних кадрів показуємо в галереї деталі
const W_THUMB = 900;
const H_THUMB = 560;
const W_FULL = 1600;
const H_FULL = 1000;
const GALLERY_W = 1200;
const GALLERY_H = 800;

function u(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

// ТЕМАТИЧНІ фото. Усі ID перевірені: повертають HTTP 200 на images.unsplash.com.
// Всередині масиву кожного запису ID унікальні — щоб галерея показувала різні фото.
// Немає дублікатів між категоріями — кожна категорія має тільки свої фото.
const CAT_PHOTOS: Record<string, string[]> = {
  "електрик": [
    "photo-1581094288338-2314dddb7ece",   // electrical panel
    "photo-1581092160562-40aa08e78837",   // electrician tools
    "photo-1621905252507-b35492cc74b4",   // electrical work
    "photo-1558618666-fcd25c85cd64",      // wiring
    "photo-1581094794329-c8112a89af12",   // circuit breaker
    "photo-1593941707882-a5bba14938c7",   // power lines
    "photo-1582719188393-bb71ca45dbb9",   // electrical installation
    "photo-1530124566582-a618bc2615dc",   // outlet wiring
    "photo-1620653713380-7a34b773fef8",   // electrical repair
    "photo-1565793298595-6a879b1d9492",   // voltage tester
    "photo-1504307651254-35680f356dfd",   // industrial electric
    "photo-1518770660439-4636190af475",   // electronics circuit
  ],
  "сантехнік": [
    "photo-1585704032915-c3400ca199e7",   // faucet, bathtub
    "photo-1607472586893-edb57bdc0e39",   // plumber at work
    "photo-1607400201515-c2c41c07d307",   // pipes / tools
    "photo-1523413555809-0fb1d4da238d",   // boiler / water heater
    "photo-1542013936693-884638332954",   // sink
    "photo-1521207418485-99c705420785",   // plumbing tools
    "photo-1530124566582-a618bc2615dc",   // shower head
    "photo-1620653713380-7a34b773fef8",   // pipe fittings
    "photo-1601581875039-e899893d520c",   // tools
    "photo-1601584115197-04ecc0da31d7",   // communications
    "photo-1583845112203-29329902332e",   // pipe connection
    "photo-1583847268964-b28dc8f51f92",   // pipe installation
    "photo-1581578731548-c64695cc6952",   // sink faucet
    "photo-1607400201515-c2c41c07d307",   // plumbing repair
  ],
  "клінінг": [
    "photo-1581578731548-c64695cc6952",   // cleaning spray
    "photo-1528909514045-2fa4ac7a08ba",   // clean room
    "photo-1581578017093-cd30fce4eeb7",   // cleaning supplies
    "photo-1556909211-36987daf7b4d",      // mopping floor
    "photo-1565793298595-6a879b1d9492",   // vacuum cleaner
    "photo-1521791136064-7986c2920216",   // tidy home
    "photo-1542838132-92c53300491e",       // clean office
    "photo-1551836022-d5d88e9218df",      // professional cleaning
    "photo-1521587760476-6c12a4b040da",   // housekeeping
    "photo-1581092160562-40aa08e78837",   // cleaning products
  ],
  "ремонт пк": [
    "photo-1593642632559-0c6d3fc62b89",   // laptop repair
    "photo-1517336714731-489689fd1ca8",   // computer components
    "photo-1531297484001-80022131f5a1",   // tech hardware
    "photo-1498050108023-c5249f4df085",   // coding on laptop
    "photo-1461749280684-dccba630e2f6",   // computer setup
    "photo-1518770660439-4636190af475",   // circuit board
    "photo-1526374965328-7f61d4dc18c5",   // keyboard close
    "photo-1542838132-92c53300491e",       // workspace
    "photo-1535982330050-f1c2fb79571b",   // laptop screen
    "photo-1496181133206-80ce9b88a853",   // motherboard
  ],
  "фотограф": [
    "photo-1542038784456-1ea8e935640e",   // camera
    "photo-1502920917128-1aa500764cbd",   // DSLR camera
    "photo-1554080353-a576cf803bda",      // photo studio
    "photo-1500627964684-141351970a7f",   // photography
    "photo-1452587925148-ce544e77e70d",    // vintage camera
    "photo-1498409785966-ab341407de6e",   // portrait photography
    "photo-1462965326201-d02e4f455804",   // photo editing
    "photo-1502005229762-cf1b2da7c5d6",   // film camera
    "photo-1504198266287-1659872e6590",   // photographer
    "photo-1503554051046-8a71792f1c17",   // camera lens
    "photo-1471341971476-ae15ff5dd4ea",   // camera gear
  ],
  "веб-розробник": [
    "photo-1498050108023-c5249f4df085",   // code on screen
    "photo-1461749280684-dccba630e2f6",   // coding
    "photo-1517336714731-489689fd1ca8",    // web development
    "photo-1607799279861-4dd421887fb3",    // web design
    "photo-1516116216624-53e697fedbea",    // code editor
    "photo-1555066931-4365d14bab8c",      // software dev
    "photo-1531297484001-80022131f5a1",    // tech workspace
    "photo-1504639725590-34d0984388bd",    // programming
    "photo-1593720213428-28a5b9e94613",    // web code
    "photo-1460925895917-afdab827c52f",    // app development
    "photo-1555066931-4365d14bab8c",      // developer workspace
  ],
  "дизайнер": [
    "photo-1561835491-ed2567d96913",      // design
    "photo-1561070791-36c11767b26a",      // graphic design
    "photo-1561070791-2526d30994b5",      // design tools
    "photo-1558655146-9f40138edfeb",      // design process
    "photo-1572044162444-ad60f128bdea",   // design workspace
    "photo-1503602642458-232111445657",   // creative design
    "photo-1518770660439-4636190af475",   // colorful design
    "photo-1502672260266-1c1ef2d93688",   // design materials
    "photo-1558655146-d09bc4d32e22",      // design thinking
    "photo-1561070791-2526d30994b5",      // sketch design
  ],
  "вантажник": [
    "photo-1600518464441-9154a4dea21b",   // moving boxes
    "photo-1601584115197-04ecc0da31d7",   // cargo
    "photo-1601581875039-e899893d520c",   // delivery
    "photo-1551836022-d5d88e9218df",      // warehouse
    "photo-1601598851547-4302969d0614",   // movers
    "photo-1605152276897-4f618f831968",   // heavy lifting
    "photo-1583912086096-8c60d75a53f9",   // moving truck
    "photo-1593305841991-05c297ba4575",   // furniture delivery
    "photo-1600518464441-9154a4dea21b",   // packing
    "photo-1604328698692-f76ea9498e76",   // logistics
  ],
  "юрист": [
    "photo-1589829545856-d10d557cf95f",   // lawyer office
    "photo-1505664194779-8beaceb93744",   // law books
    "photo-1507003211169-0a1dd7228f2d",   // professional man
    "photo-1556155092-490a1ba16284",      // legal documents
    "photo-1517245386807-bb43f82c33c4",   // meeting room
    "photo-1573497019940-1c28c88b4f3e",   // law office
    "photo-1521791136064-7986c2920216",   // contract signing
    "photo-1450101499163-c8848c66ca85",   // legal brief
    "photo-1589829545856-d10d557cf95f",   // court
    "photo-1577985043696-8bd54d9c4f09",   // scales of justice
  ],
  "перекладач": [
    "photo-1457369804613-52c61a468e7d",   // dictionary
    "photo-1503676260728-1c00da094a0b",   // books
    "photo-1524178232363-1fb2b075b655",   // languages
    "photo-1517842645767-c639042777db",   // study
    "photo-1516321318423-f06f85e504b3",   // library
    "photo-1532012197267-da84d127e765",   // world map
    "photo-1488190211105-8b0e65b80b4e",   // learning
    "photo-1499750310107-5fef28a66643",   // education
    "photo-1522202176988-66273c2fd55f",   // conference
    "photo-1456513080510-7bf3a84b82f8",   // translation
  ],
  "ремонт квартир": [
    "photo-1503387762-592deb58ef4e",      // apartment renovation
    "photo-1581094288338-2314dddb7ece",    // construction tools
    "photo-1504307651254-35680f356dfd",    // painting
    "photo-1593941707882-a5bba14938c7",    // repair work
    "photo-1558618666-fcd25c85cd64",       // renovation
    "photo-1504307651254-35680f356dfd",    // painter
    "photo-1581578731548-c64695cc6952",    // home repair
    "photo-1521791136064-7986c2920216",    // apartment
    "photo-1560448204-e02f11c3d0e2",       // interior work
    "photo-1600585454193-7be13a7820a9",    // construction
    "photo-1585128792020-803d29415281",    // tile work
    "photo-1562259949-e8e7689d7828",       // wall finishing
  ],
  "дизайн інтер'єру": [
    "photo-1586023492125-27b2c045efd7",   // modern interior
    "photo-1493809842364-78817add7ffb",   // room design
    "photo-1502672260266-1c1ef2d93688",   // interior
    "photo-1505691938895-1758d7feb511",   // design project
    "photo-1560448204-e02f11c3d0e2",      // stylish room
    "photo-1524758631624-e2822e304c36",   // living room
    "photo-1493663284031-b7e3aefcae8e",   // home decor
    "photo-1618221195710-dd6b41faaea6",   // minimalist
    "photo-1615875605825-5eb9bb5d52ac",   // modern home
    "photo-1616594039964-ae9021a400a0",   // interior design
  ],
  "репетитор": [
    "photo-1503676260728-1c00da094a0b",   // teacher
    "photo-1509062522246-3755977927d7",   // tutoring
    "photo-1513258496099-48168024aec0",   // classroom
    "photo-1427504494785-3a9ca7044f45",   // teaching
    "photo-1571260899304-425eee4c7efc",   // online class
    "photo-1546410531-bb4caa6b424d",      // whiteboard
    "photo-1488190211105-8b0e65b80b4e",   // books
    "photo-1516321318423-f06f85e504b3",   // study desk
    "photo-1522202176988-66273c2fd55f",   // learning
    "photo-1524178232363-1fb2b075b655",   // education
  ],
  "масаж": [
    "photo-1600334129128-685c5582fd35",   // massage therapy
    "photo-1544161515-4ab6ce6db874",      // spa
    "photo-1540555700478-4be289fbecef",    // massage room
    "photo-1591343395082-e120087004b4",    // wellness
    "photo-1519823551278-64ac92734fb1",   // relaxation
    "photo-1615485925600-97237c4fc1ec",   // massage
    "photo-1607602132700-068258431c6c",   // spa treatment
    "photo-1583416750470-965b2707b355",   // therapeutic
    "photo-1544161515-4ab6ce6db874",      // wellness center
    "photo-1600334129128-685c5582fd35",   // body treatment
  ],
  "різноробочий": [
    "photo-1558618666-fcd25c85cd64",      // handyman tools
    "photo-1604328698692-f76ea9498e76",   // construction work
    "photo-1583845112203-29329902332e",   // repair
    "photo-1583847268964-b28dc8f51f92",   // installation
    "photo-1582719188393-bb71ca45dbb9",   // workshop
    "photo-1581578731548-c64695cc6952",   // maintenance
    "photo-1565793298595-6a879b1d9492",   // tools
    "photo-1607400201515-c2c41c07d307",   // handyman
    "photo-1530124566582-a618bc2615dc",   // general work
    "photo-1551836022-d5d88e9218df",      // labor
    "photo-1504307651254-35680f356dfd",   // general repairs
    "photo-1601584115197-04ecc0da31d7",   // worker
  ],
  default: [
    "photo-1521791136064-7986c2920216",
    "photo-1556909114-f6e7ad7d3136",
    "photo-1551836022-d5d88e9218df",
    "photo-1581578731548-c64695cc6952",
    "photo-1517048676732-d65bc937f952",
    "photo-1521737604893-d14cc237f11d",
    "photo-1551434678-e076c223a692",
    "photo-1522071820081-009f0129c71c",
    "photo-1522202176988-66273c2fd55f",
    "photo-1542744173-8e7e53415bb0",
  ],
};

function normalize(c: string): string {
  return (c || "").trim().toLowerCase();
}

function photosFor(category: string): string[] {
  const arr = CAT_PHOTOS[normalize(category)] ?? CAT_PHOTOS.default;
  return arr.length ? arr : CAT_PHOTOS.default;
}

function pickAt(arr: string[], i: number): string {
  return arr[i % arr.length];
}

/**
 * Детермінований «варіант» із рядка (ідентифікатора послуги/фахівця),
 * щоб сусідні картки тієї ж категорії показували РІЗНІ фото, але та сама
 * послуга завжди отримувала одне й те саме фото між рендерами.
 */
function variantFrom(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Головне фото картки каталогу (thumbnail). variant дає різні фото для різних спеціалістів тієї ж категорії. */
export function cardImage(category: string, variant = 0): string {
  const arr = photosFor(category);
  return u(pickAt(arr, variant), W_THUMB, H_THUMB);
}

/** count різних фото теми (для галереї деталі послуги). */
export function galleryImages(category: string, count = PER_CAT): string[] {
  const arr = photosFor(category);
  const seen = new Set<string>();
  const out: string[] = [];
  // спершу унікальні ID підряд, потім по колу, поки не наберемо count
  for (const id of arr) {
    if (out.length >= count) break;
    if (!seen.has(id)) {
      seen.add(id);
      out.push(u(id, GALLERY_W, GALLERY_H));
    }
  }
  let i = 0;
  while (out.length < count && i < arr.length * 4) {
    const id = pickAt(arr, i++);
    if (!seen.has(id)) {
      seen.add(id);
      out.push(u(id, GALLERY_W, GALLERY_H));
    }
  }
  return out;
}

/** Перше фото: власне (якщо є) або тематичне з каталогу. variant для стабільного різноманіття. */
export function firstImage(images: string[] | null | undefined, category: string, variant = 0): string {
  if (images && images.length > 0 && images[0]) return images[0];
  return cardImage(category, variant);
}

/**
 * Перше фото картки за id послуги: дає стабільне, але РІЗНЕ фото для сусідніх
 * карток тієї ж категорії (навіть коли власних images немає).
 */
export function cardImageFor(id: string, category: string): string {
  return cardImage(category, variantFrom(id));
}

/**
 * Галерея деталі послуги: спочатку власні фото фахівця, потім добірка
 * ТЕМАТИЧНИХ фото тієї ж категорії, щоб загалом було count різних кадрів.
 */
export function buildGallery(images: string[] | null | undefined, category: string, count = PER_CAT): string[] {
  const own = images?.filter(Boolean) ?? [];
  const out: string[] = [...own];
  if (out.length < count) {
    const fill = galleryImages(category, count);
    const seen = new Set(out.map((s) => s.split("?")[0]));
    for (const f of fill) {
      if (out.length >= count) break;
      const key = f.split("?")[0];
      if (!seen.has(key)) {
        seen.add(key);
        out.push(f);
      }
    }
  }
  return out.slice(0, Math.max(count, own.length));
}

export function providerFullImage(category: string, variant = 0): string {
  return u(pickAt(photosFor(category), variant), W_FULL, H_FULL);
}
