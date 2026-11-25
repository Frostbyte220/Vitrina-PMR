import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ImpersonationBanner } from "@/components/dashboard/ImpersonationBanner";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/impersonation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isImpersonating = Boolean(
    session.user.impersonatedBy &&
      isAdminEmail(session.user.impersonatedBy.email)
  );
  const isAdmin = !isImpersonating && isAdminEmail(session.user?.email);

  let targetStore: { name: string; slug: string } | null = null;
  if (isImpersonating && session.user.id) {
    targetStore = await prisma.store.findUnique({
      where: { userId: session.user.id },
      select: { name: true, slug: true },
    });
  }

  return (
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden bg-surface">
      <DashboardNav isAdmin={isAdmin} />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col pb-tabbar md:pb-0">
        {isImpersonating && (
          <ImpersonationBanner
            targetName={targetStore?.name || session.user.name || "Магазин"}
            targetEmail={session.user.email || ""}
            storeSlug={targetStore?.slug}
          />
        )}
        {children}
      </div>
    </div>
  );
}
