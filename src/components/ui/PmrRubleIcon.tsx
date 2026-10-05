// SVG-иконка рубля ПМР (буква Р с двумя горизонтальными чертами)
export function PmrRubleIcon({ className = "inline-block h-[1em] w-[0.7em] align-baseline" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="руб."
    >
      {/* Вертикальная стойка буквы Р */}
      <rect x="1" y="0" width="2.2" height="18" rx="1" />
      {/* Полукруглая шапка буквы Р */}
      <path d="M3 0 H7.5 C11 0 13.5 2 13.5 5 C13.5 8 11 10 7.5 10 H3 Z" />
      {/* Первая горизонтальная черта */}
      <rect x="1" y="11.5" width="9" height="1.8" rx="0.9" />
      {/* Вторая горизонтальная черта */}
      <rect x="1" y="14.5" width="9" height="1.8" rx="0.9" />
    </svg>
  );
}
