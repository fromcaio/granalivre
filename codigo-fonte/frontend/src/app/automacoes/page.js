import { headers } from 'next/headers';
import { validateSession, fetchAutomationsServer } from '@/lib/serverAuth';
import AutomationsClient from '@/components/automations/AutomationsClient';
import SideMenu from '@/components/layout/sidebar/SideMenu';
import TopBar from '@/components/layout/topbar/TopBar';

export default async function AutomationsPage() {
  const user = await validateSession();

  // If no user, middleware or layout should handle redirect, 
  // but we can return null or redirect here for safety.
  if (!user) return null; 

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') || '';

  // Fetch initial data
  const initialAutomations = await fetchAutomationsServer(cookieHeader);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex flex-col sm:flex-row min-h-[calc(100vh-64px)]">
          <div className="h-full sm:h-auto flex-shrink-0">
            <SideMenu activeLabel="Automações" />
          </div>
          <div className="flex-1 min-w-0 bg-gray-50 p-4 sm:p-6">
            <AutomationsClient initialAutomations={initialAutomations} />
          </div>
        </div>
      </div>
    </main>
  );
}
