/**
 * Утилиты для умного поиска текста (клиент + сервер):
 * - Синонимы брендов (найк <-> nike)
 * - Стемминг русских окончаний и падежей
 * - Расстояние Левенштейна и нечёткое сопоставление строк
 */

/** Популярные бренды и их кириллические/латинские синонимы */
export const BRAND_SYNONYMS: Record<string, string> = {
  найк: "nike",
  nike: "найк",
  адидас: "adidas",
  adidas: "адидас",
  пума: "puma",
  puma: "пума",
  рибок: "reebok",
  reebok: "рибок",
  "нью баланс": "new balance",
  "нью бэланс": "new balance",
  "new balance": "нью баланс",
  айфон: "iphone",
  iphone: "айфон",
  эппл: "apple",
  apple: "эппл",
  самсунг: "samsung",
  samsung: "самсунг",
  сяоми: "xiaomi",
  ксиоми: "xiaomi",
  xiaomi: "сяоми",
  хуавей: "huawei",
  huawei: "хуавей",
};

/**
 * Простой стеммер для русского языка:
 * удаляет падежные и числовые окончания для поиска по общему корню.
 * (куртки -> куртк, платья -> плат, кроссовки -> кроссовк).
 */
export function getRussianStem(word: string): string {
  if (word.length <= 3) return word.toLowerCase();
  return word
    .toLowerCase()
    .replace(
      /(?:ами|ями|ов|ев|ей|ий|ый|ой|ая|яя|ое|ее|ые|ие|ам|ям|ом|ем|ах|ях|ую|юю|у|ю|а|я|е|и|ы|о)$/i,
      ""
    );
}

/**
 * Расстояние Левенштейна между двумя строками (кол-во правок/опечаток).
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Оптимизация памяти (две строки матрицы)
  let prevRow = new Array(n + 1);
  let currRow = new Array(n + 1);

  for (let j = 0; j <= n; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    const aChar = a[i - 1];

    for (let j = 1; j <= n; j++) {
      const cost = aChar === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,       // вставка
        prevRow[j] + 1,           // удаление
        prevRow[j - 1] + cost     // замена
      );
    }

    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[n];
}

/**
 * Нечёткая проверка соответствия текста поисковому запросу.
 * Работает быстро в памяти браузера или на сервере.
 *
 * @param text  Текст (например, title или description товара)
 * @param query Поисковый запрос пользователя
 */
export function fuzzyMatchText(text: string | null | undefined, query: string): boolean {
  if (!text || !query) return false;

  const target = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return false;

  // 1. Точное вхождение подстроки
  if (target.includes(q)) return true;

  // 2. Синоним бренда (найк -> nike)
  const synonym = BRAND_SYNONYMS[q];
  if (synonym && target.includes(synonym)) return true;

  // 3. Совпадение по основе (стемминг падежей: куртки -> куртк)
  const queryStem = getRussianStem(q);
  if (queryStem.length >= 3 && target.includes(queryStem)) return true;

  // 4. Проверка опечаток по словам (Левенштейн)
  const words = target.split(/[\s,.;:!?«»"()\-–—/\\]+/).filter(Boolean);
  const maxAllowedDistance = q.length <= 4 ? 1 : 2;

  for (const word of words) {
    if (word.length >= 3 && Math.abs(word.length - q.length) <= maxAllowedDistance) {
      const dist = levenshteinDistance(word, q);
      if (dist <= maxAllowedDistance) return true;
    }
  }

  return false;
}
