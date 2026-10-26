import { cookies } from "next/headers";
import { getRecentlyViewedProducts } from "@/actions/recentlyViewed";
import { RecentlyViewedClient } from "./RecentlyViewedClient";

interface RecentlyViewedSectionProps {
  currentProductId?: string;
  title?: string;
  className?: string;
}

/**
 * Серверная секция «Вы недавно смотрели»:
 * 1. Читает куки `pmr_recently_viewed` на сервере при SSR.
 * 2. Предзагружает товары из базы данных Prisma — обеспечивает 100% индексацию для SEO
 *    и отсутствие сдвигов макета (FOUC).
 * 3. Передает данные клиенту для мгновенного рендера и реактивной синхронизации.
 */
export async function RecentlyViewedSection({
  currentProductId,
  title = "Вы недавно смотрели",
  className = "",
}: RecentlyViewedSectionProps) {
  let initialProducts: any[] = [];

  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get("pmr_recently_viewed")?.value;
    if (cookieValue) {
      const ids = decodeURIComponent(cookieValue).split(",").filter(Boolean);
      if (ids.length > 0) {
        initialProducts = await getRecentlyViewedProducts(ids, currentProductId);
      }
    }
  } catch {
    // Тихо игнорируем ошибку чтения кук на сервере
  }

  return (
    <RecentlyViewedClient
      initialProducts={initialProducts}
      currentProductId={currentProductId}
      title={title}
      className={className}
    />
  );
}
