import { Sidebar } from "@/components/dashboard/Sidebar";
import { getSession } from "@/lib/auth/session";
import { AuthProvider } from "@/components/providers/AuthProvider";

import { redirect } from "next/navigation";
import { HeaderUserMenu } from "@/components/dashboard/HeaderUserMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const currentDate = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen bg-[#f5f5f7]">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar */}
          <header className="h-16 border-b border-[#e5e5ea] bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-sm sm:text-base font-semibold text-[#1d1d1f] tracking-tight capitalize">
                {currentDate}
              </h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#34c759]/10 rounded-full text-xs font-medium text-[#248a3d]">
                <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
                Clínica Operativa en Vivo
              </div>

              {/* User Menu & Role Indicator */}
              <HeaderUserMenu user={user} />
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
