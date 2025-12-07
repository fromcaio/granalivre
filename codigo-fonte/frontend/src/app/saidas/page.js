import TopBar from "@/components/layout/topbar/TopBar";
import SideMenu from "@/components/layout/sidebar/SideMenu";
import { headers } from "next/headers";
import { validateSession, fetchTransactionsServer } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import SaidasPageClient from "./SaidasPageClient";

export default async function SaidasPage() {
  const user = await validateSession();

  if (!user) {
    redirect(`/entrar?redirect=${encodeURIComponent("/saidas")}`);
  } 

  const cookieHeader = (await headers()).get("cookie") || "";
  const initialExpenses = await fetchTransactionsServer(cookieHeader, {
    type: "expense",
    limit: 50,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex flex-col sm:flex-row min-h-[calc(100vh-64px)]">
          <div className="h-full sm:h-auto flex-shrink-0">
            <SideMenu activeLabel="Saídas" />
          </div>
          <div className="flex-1 min-w-0 bg-gray-50 p-4 sm:p-6">
            <div className="w-full">
              <SaidasPageClient initialExpenses={initialExpenses} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
