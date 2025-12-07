"use client";

import { useState } from "react";
import RegisterMovementModal from "./RegisterMovementModal";

const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function InvestmentDetailsModal({ investment, onClose, onRefresh }) {
  const [showMovementModal, setShowMovementModal] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-black">Detalhes do Investimento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* INFO TABLE */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-gray-900">
                <div><span className="font-bold text-black">Nome:</span> {investment.name}</div>
                <div><span className="font-bold text-black">Status:</span> {investment.status === 'active' ? 'Ativo' : 'Liquidado'}</div>
                
                <div><span className="font-bold text-black">Tipo:</span> {investment.type === 'fixed_income' ? 'Renda Fixa' : 'Renda Variável'}</div>
                {investment.type === 'fixed_income' && (
                    <>
                        <div><span className="font-bold text-black">Rentabilidade:</span> {investment.profitability_type} ({investment.profitability_rate})</div>
                        <div><span className="font-bold text-black">Vencimento:</span> {new Date(investment.due_date).toLocaleDateString()}</div>
                    </>
                )}
            </div>
            
            <div className="border-t border-gray-300 my-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <span className="block text-gray-900 text-xs font-bold uppercase mb-1">Valor Aplicado Total</span>
                    <span className="font-bold text-lg text-black">{formatCurrency(investment.applied_value)}</span>
                </div>
                <div>
                    <span className="block text-gray-900 text-xs font-bold uppercase mb-1">Valor Atual (Estimado)</span>
                    <span className="font-bold text-lg text-black">{formatCurrency(investment.current_value)}</span>
                </div>
                <div>
                    <span className="block text-gray-900 text-xs font-bold uppercase mb-1">Rentabilidade</span>
                    <span className={`font-bold text-lg ${investment.profitability_percent >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {formatCurrency(investment.current_value - investment.applied_value)} ({investment.profitability_percent}%)
                    </span>
                </div>
            </div>
        </div>

        {/* BUTTONS (Aligned Right, Edit button removed) */}
        <div className="flex justify-end mb-6">
            <button 
                onClick={() => setShowMovementModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Registrar Nova Movimentação
            </button>
        </div>

        {/* HISTORY TABLE */}
        <h3 className="font-bold text-black mb-2 uppercase text-sm tracking-wide border-b border-gray-200 pb-2">Histórico de Movimentações</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-black font-semibold">
                    <tr>
                        <th className="p-3 border-b border-gray-200">Data</th>
                        <th className="p-3 border-b border-gray-200">Tipo</th>
                        <th className="p-3 border-b border-gray-200">Descrição</th>
                        <th className="p-3 border-b border-gray-200">Valor</th>
                        <th className="p-3 border-b border-gray-200 text-right">Saldo Parcial</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {investment.movements?.map((mov, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-gray-900">{new Date(mov.date).toLocaleDateString()}</td>
                            <td className="p-3 text-gray-900">{mov.type}</td>
                            <td className="p-3 text-gray-900">{mov.description || '-'}</td>
                            <td className={`p-3 font-bold ${mov.value > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {mov.value > 0 ? '+' : ''}{formatCurrency(mov.value)}
                            </td>
                            <td className="p-3 text-right text-gray-900 font-medium">{formatCurrency(mov.balance)}</td>
                        </tr>
                    ))}
                    {(!investment.movements || investment.movements.length === 0) && (
                        <tr><td colSpan="5" className="p-6 text-center text-gray-500 italic">Nenhuma movimentação registrada.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {showMovementModal && (
        <RegisterMovementModal 
            investment={investment}
            onClose={() => setShowMovementModal(false)}
            onSuccess={() => {
                setShowMovementModal(false);
                onRefresh();
                onClose(); 
            }}
        />
      )}
    </div>
  );
}