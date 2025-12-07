import { headers } from 'next/headers';
import { validateSession, fetchDashboardSummaryServer, fetchTransactionsServer, fetchDashboardChartServer } from '@/lib/serverAuth';
import DashboardClient from '@/components/home/DashboardClient';
import LandingContent from '@/components/home/LandingContent';

export default async function HomePageContent() {
  const user = await validateSession();

  if (user) {
    const headerStore = await headers();
    const cookieHeader = headerStore.get('cookie') || '';

    // Parallel Data Fetching for performance
    const [initialSummary, initialTransactions, initialChartData] = await Promise.all([
        fetchDashboardSummaryServer(cookieHeader),
        fetchTransactionsServer(cookieHeader, { limit: 10 }),
        fetchDashboardChartServer(cookieHeader, { days: 30 })
    ]);

    return (
        <DashboardClient 
            initialUser={user} 
            initialSummary={initialSummary}
            initialTransactions={initialTransactions}
            initialChartData={initialChartData}
        />
    );
  }

  return <LandingContent />;
}
