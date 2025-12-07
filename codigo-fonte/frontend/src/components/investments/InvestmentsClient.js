"use client";

import { useState, useMemo } from "react";
import { getInvestments } from "@/lib/api";
import AddInvestmentModal from "./modals/AddInvestmentModal";
import InvestmentDetailsModal from "./modals/InvestmentDetailsModal";
import DeleteInvestmentModal from "./modals/DeleteInvestmentModal";
import LiquidationModal from "./modals/LiquidationModal";

const formatCurrency = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatPercent = (value) => 
  `${Number(value).toFixed(2).replace('.', ',')}%`;

export default function InvestmentsClient({ initialInvestments }) {
  const [investments, setInvestments] = useState(initialInvestments);
  const [loading, setLoading] = useState(false);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // New State for Editing
  const [detailsItem, setDetailsItem] = useState(null);
  const [liquidationItem, setLiquidationItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // --- Calculations ---
  const summary = useMemo(() => {
    const totalApplied = investments.reduce((acc, curr) => acc + Number(curr.applied_value), 0);
    const totalCurrent = investments.reduce((acc, curr) => acc + Number(curr.current_value), 0);
    const profitValue = totalCurrent - totalApplied;
    const profitPercent = totalApplied > 0 ? (profitValue / totalApplied) * 100 : 0;

    return { totalApplied, totalCurrent, profitPercent };
  }, [investments]);

  // --- Actions ---
  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await getInvestments();
      setInvestments(data || []);
    } catch (error) {
      console.error("Failed to refresh investments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* SECTION 1: Visão Geral */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Investimentos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Valor Total Aplicado</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(summary.totalApplied)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Valor Total Atual</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(summary.totalCurrent)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Rentabilidade Total</p>
                <p className={`text-2xl font-bold mt-1 ${summary.profitPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {summary.profitPercent >= 0 ? '+' : ''}{formatPercent(summary.profitPercent)}
                </p>
            </div>
        </div>
      </div>

      {/* SECTION 2: Lista de Investimentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Lista de Investimentos</h2>
            <button 
                onClick={handleAddNew}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Adicionar novo investimento
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                        <th className="p-4 font-semibold">Nome</th>
                        <th className="p-4 font-semibold">Tipo</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Valor Aplicado</th>
                        <th className="p-4 font-semibold">Valor Atual Est.</th>
                        <th className="p-4 font-semibold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {loading && <tr><td colSpan="6" className="p-4 text-center text-gray-500">Atualizando...</td></tr>}
                    {!loading && investments.length === 0 && (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">Nenhum investimento cadastrado.</td></tr>
                    )}
                    {!loading && investments.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-800">{inv.name}</td>
                            <td className="p-4 text-gray-600">
                                {inv.type === 'fixed_income' ? 'Renda Fixa' : 'Renda Variável'}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {inv.status === 'active' ? 'Ativo' : 'Liquidado'}
                                </span>
                            </td>
                            <td className="p-4 text-gray-800">{formatCurrency(inv.applied_value)}</td>
                            <td className="p-4">
                                <span className="font-semibold text-gray-800">{formatCurrency(inv.current_value)}</span>
                                <span className={`ml-2 text-xs font-medium ${inv.profitability_percent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    ({inv.profitability_percent >= 0 ? '+' : ''}{formatPercent(inv.profitability_percent)})
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setDetailsItem(inv)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title="Detalhes">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                    
                                    {/* Edit Button */}
                                    <button onClick={() => handleEdit(inv)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title="Editar">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>

                                    <button onClick={() => setLiquidationItem(inv)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50" title="Liquidar">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </button>
                                    
                                    <button onClick={() => setDeleteItem(inv)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" title="Excluir">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODALS */}
      {isAddModalOpen && (
        <AddInvestmentModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={refreshList} 
            investment={editingItem} // Pass the editing item
        />
      )}

      {detailsItem && (
        <InvestmentDetailsModal 
            investment={detailsItem} 
            onClose={() => setDetailsItem(null)} 
            onRefresh={refreshList}
        />
      )}

      {liquidationItem && (
        <LiquidationModal
            investment={liquidationItem}
            onClose={() => setLiquidationItem(null)}
            onSuccess={refreshList}
        />
      )}

      {deleteItem && (
        <DeleteInvestmentModal
            automation={deleteItem} 
            title="Excluir Investimento"
            onClose={() => setDeleteItem(null)}
            onDeleted={refreshList}
        />
      )}
    </div>
  );
}