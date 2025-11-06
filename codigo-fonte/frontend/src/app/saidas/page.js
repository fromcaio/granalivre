import TopBar from "@/components/layout/topbar/TopBar";
import Footer from "@/components/footer/Footer";
import { validateSession } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import SaidasPageClient from "./SaidasPageClient";

export default async function SaidasPage() {
  const user = await validateSession();

  if (!user) {
    redirect(`/entrar?redirect=${encodeURIComponent("/saidas")}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <SaidasPageClient />
        </div>
      </div>
      <Footer />
    </main>
  );
}
