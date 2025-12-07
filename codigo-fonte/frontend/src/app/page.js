import TopBar from '@/components/layout/topbar/TopBar';
import { validateSession } from '@/lib/serverAuth';
import HomePageContent from '@/components/home/HomePageServer';
import Footer from '@/components/footer/Footer';

/**
 * This is the main server-side entry point for the home page ('/').
 * It's now an async component, allowing it to await the session validation.
 */
export default async function HomePage() {
  // Await the result of our robust, server-side session check.
  // `initialUser` will be the user object or null.
  const initialUser = await validateSession();  
  //const [isMenuOpen, setIsMenuOpen] = useState(false);


  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <div className="page-content flex-1 py-0 px-0 min-h-[calc(100vh-64px)]">
          <HomePageContent />
        </div>
        {!initialUser && <Footer />}
      </div>
    </main>
  );
}
