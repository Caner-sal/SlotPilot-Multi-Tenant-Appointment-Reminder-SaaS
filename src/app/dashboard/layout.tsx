import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-60 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
