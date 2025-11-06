import TopBar from '@/components/layout/topbar/TopBar';
import SideMenu from "@/components/layout/sidebar/SideMenu";
import { validateSession } from '@/lib/serverAuth';
import HomePageClient from '@/components/home/HomePageClient';
import Footer from '@/components/footer/Footer';

/**
 * This is the main server-side entry point for the home page ('/').
 * It's now an async component, allowing it to await the session validation.
 */
export default async function HomePage() {
  // Await the result of our robust, server-side session check.
  // `initialUser` will be the user object or null.
  const initialUser = await validateSession();

  return (
    <main className="min-h-screen bg-gray-50">
      <SideMenu />
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <TopBar />
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          {/* Pass the server-validated user data down to a Client Component.
            This component will handle the actual rendering logic.
          */}
          <HomePageClient />
        </div>
        <Footer />
      </div>
    </main>
  );
}