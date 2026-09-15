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

  return (
    <div className="flex min-h-screen bg-surface">
      <DashboardNav />
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
