import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = Boolean(
    session?.user?.email &&
    adminEmail &&
    session.user.email.toLowerCase() === adminEmail.toLowerCase()
  );

  return (
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden bg-surface">
      <DashboardNav isAdmin={isAdmin} />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col pb-tabbar md:pb-0">
        {children}
      </div>
    </div>
  );
}
