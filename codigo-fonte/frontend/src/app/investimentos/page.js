import { headers } from 'next/headers';
import { validateSession, fetchInvestmentsServer } from '@/lib/serverAuth';
import InvestmentsClient from '@/components/investments/InvestmentsClient';
import SideMenu from '@/components/layout/sidebar/SideMenu';
import TopBar from '@/components/layout/topbar/TopBar';

export default async function InvestmentsPage() {
  const user = await validateSession();
  if (!user) return null; 

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') || '';

  const initialInvestments = await fetchInvestmentsServer(cookieHeader);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex flex-col sm:flex-row min-h-[calc(100vh-64px)]">
          <div className="h-full sm:h-auto flex-shrink-0">
            <SideMenu activeLabel="Investimentos" />
          </div>
          <div className="flex-1 min-w-0 bg-gray-50 p-4 sm:p-6">
            <InvestmentsClient initialInvestments={initialInvestments || []} />
          </div>
        </div>
      </div>
    </main>
  );
}