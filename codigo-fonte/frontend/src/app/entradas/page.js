import TopBar from "@/components/layout/topbar/TopBar";
import Footer from "@/components/footer/Footer";
import SideMenu from "@/components/layout/sidebar/SideMenu";
import { validateSession } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import EntradasPageClient from "./EntradasPageClient";

export default async function EntradasPage() {
  const user = await validateSession();

  if (!user) {
    redirect(`/entrar?redirect=${encodeURIComponent("/entradas")}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <SideMenu />
      <TopBar />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full">
          <EntradasPageClient />
        </div>
      </div>
      <Footer />
    </main>
  );
}

