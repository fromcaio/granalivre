'use client';

import { useState, useCallback, useEffect } from 'react';
import SideMenu from '@/components/layout/sidebar/SideMenu';
import DashboardLineChart from '@/components/home/DashboardLineChart';
import { getDashboardSummary, getTransactions, getDashboardChart } from '@/lib/api';
import AddIncomeModal from '@/components/transactions_/AddIncomeModal'; // Adjust path if needed
import AddExpenseModal from '@/components/transactions_/AddExpenseModal'; // Adjust path if needed

// --- HELPERS ---
const formatCurrency = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- SUB-COMPONENTS ---
function SummaryCard({ title, value, subText, color, iconPath }) {
  const colorClasses = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: 'text-blue-600' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', icon: 'text-slate-600' },
  }[color];

  return (
    <div className={`flex min-w-[190px] max-w-[240px] rounded-md border ${colorClasses.border} ${colorClasses.bg} p-4`}>
      <div className="mr-4 flex items-center">
        <svg className={`h-12 w-12 ${colorClasses.icon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {iconPath}
        </svg>
      </div>
      <div className="flex flex-1 flex-col justify-between text-gray-800">
        <p className={`text-sm font-semibold ${colorClasses.text}`}>{title}</p>
        <div className={`border-t ${colorClasses.border} pt-2`}>
          <p className={`text-base font-semibold ${colorClasses.text}`}>{formatCurrency(value)}</p>
          {subText && <p className="text-xs text-gray-600 mt-1">{subText}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ initialUser, initialSummary, initialTransactions, initialChartData = [] }) {
  // --- STATE ---
  const [summary, setSummary] = useState(initialSummary);
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(initialChartData);
  
  // Modal State
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // --- ACTIONS ---

  // Refreshes both Summary (Div 1) and Transactions (Div 3)
  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [newSummary, newTransactions, newChart] = await Promise.all([
        getDashboardSummary(),
        getTransactions({ limit: 5 }),
        getDashboardChart(30),
      ]);
      
      setSummary(newSummary);
      setTransactions(newTransactions);
      setChartData(newChart);
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- DATA PREP ---
  const { last30DaysBalance, billsToPay, currentBalance, patrimonio } = summary;
  const labels = chartData.map(d => d.label);
  const totals = chartData.map(d => d.total);
  const spent = chartData.map(d => d.spent);

  useEffect(() => {
    if (!initialChartData.length) {
      getDashboardChart(30)
        .then(setChartData)
        .catch((err) => console.error("Failed to fetch chart data:", err));
    }
  }, [initialChartData.length]);

  return (
    <div className="flex min-h-full flex-col sm:min-h-[calc(100vh-64px)] sm:flex-row">
      <div className="h-full sm:h-auto">
        <SideMenu activeLabel="Resumo" />
      </div>
      
      <div className="flex-1 flex flex-col bg-gray-50 p-4 sm:p-6">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min items-start">
          {/* DIV 1: Summary Cards (last on mobile) */}
          <div className="order-3 sm:order-1 sm:col-span-2 lg:col-span-3 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-4 min-[600px]:max-xl:[&>*:nth-child(odd)]:justify-self-end max-[600px]:grid-cols-1 max-[600px]:place-items-center max-[600px]:[&>*]:justify-self-center xl:[&>*]:justify-self-center">
              
              <SummaryCard 
                title="Últimos 30 dias" value={last30DaysBalance} color="emerald" 
                iconPath={<><path d="M4 5h16M4 12h16M4 19h16" /><path d="M8 3v4M12 3v4M16 3v4" /><rect x="5" y="8" width="14" height="12" rx="2" /></>}
              />
              <SummaryCard 
                title="Contas a pagar" value={billsToPay} color="amber" 
                iconPath={<><path d="M5 4h14v16H5z" /><path d="M9 9h6M9 13h6" /><path d="M9 17h3" /></>}
              />
              <SummaryCard 
                title="Saldo disponível" value={currentBalance} color="blue" 
                subText={`Por dia: ${formatCurrency(currentBalance / 30)}`}
                iconPath={<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M9 12h6" /></>}
              />
              <SummaryCard 
                title="Patrimônio" value={patrimonio} color="slate" 
                iconPath={<><path d="M3 21h18" /><path d="M6 21V10l6-6 6 6v11" /><path d="M9 21v-6h6v6" /></>}
              />
            </div>
          </div>

          {/* DIV 2: Charts */}
          <div className="order-1 sm:order-2 lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Evolução do saldo e gastos</h2>
              {isLoading && <span className="text-xs text-gray-400 animate-pulse">Atualizando...</span>}
            </div>
            <div className="flex-1 min-h-[300px]">
              <DashboardLineChart labels={labels} totals={totals} spent={spent} />
            </div>
          </div>

          {/* DIV 3: Transactions */}
          <div className="order-2 sm:order-2 lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Últimas Transações</h2>
            
            {/* Transaction List */}
            <div className="flex-1 space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Nenhuma transação recente.</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${t.value < 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        {t.value < 0 ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                        {t.category && <p className="text-xs text-gray-400">{t.category}</p>}
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${t.value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(t.value)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Buttons Area */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowIncomeModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md ring-1 ring-emerald-300/50 transition hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Nova Entrada
              </button>
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md ring-1 ring-rose-200/60 transition hover:from-rose-700 hover:to-red-600 hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                Nova Saída
              </button>
            </div>
          </div>
        </div>

        {/* MODALS */}
        {showIncomeModal && (
          <AddIncomeModal 
            onClose={() => setShowIncomeModal(false)} 
            onSubmitted={refreshDashboard} 
          />
        )}
        
        {showExpenseModal && (
          <AddExpenseModal 
            onClose={() => setShowExpenseModal(false)} 
            onSubmitted={refreshDashboard} 
          />
        )}

      </div>
    </div>
  );
}
