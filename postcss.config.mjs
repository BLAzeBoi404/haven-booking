/**
 * PostCSS конфігурація з Tailwind CSS v4 (JIT-компілятор, §2.8 / §3.6 диплома).
 * Плагін @tailwindcss/postcss сканує TS/TSX файли регулярними виразами
 * та динамічно генерує мінімізований CSS лише для фактично використаних класів.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
