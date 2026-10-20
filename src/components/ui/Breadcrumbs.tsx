import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  currentUrl?: string;
}

export function Breadcrumbs({
  items,
  className = "",
  currentUrl,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Хлебные крошки"
      className={`mb-3.5 flex items-center text-xs sm:text-sm text-gray-500 overflow-x-auto scrollbar-hide py-0.5 ${className}`}
    >
      <ol
        className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap min-w-0"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const resolvedHref = item.href || (isLast ? currentUrl : undefined);

          return (
            <li
              key={index}
              className="flex items-center gap-1 sm:gap-1.5 min-w-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="inline-flex items-center text-gray-500 hover:text-rose-700 transition-colors font-medium truncate max-w-[120px] sm:max-w-[200px]"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  itemProp="name"
                  aria-current={isLast ? "page" : undefined}
                  className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[260px]"
                  title={item.label}
                >
                  {item.label}
                </span>
              )}

              {resolvedHref && (
                <link itemProp="item" href={resolvedHref} />
              )}

              <meta itemProp="position" content={String(index + 1)} />

              {!isLast && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-gray-300"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
