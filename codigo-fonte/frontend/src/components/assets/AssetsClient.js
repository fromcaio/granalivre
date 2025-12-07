"use client";

import { useState, useMemo, useEffect } from "react";
import { getAssets, getAssetPosition } from "@/lib/api";
import AssetModal from "./modals/AssetModal";
import DeleteAssetModal from "./modals/DeleteAssetModal";
import LiquidateAssetModal from "./modals/LiquidateAssetModal";

const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const s = String(dateStr);
    // If date in YYYY-MM-DD (common for date fields), format deterministically
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
        const [, year, month, day] = m;
        return `${day}/${month}/${year}`;
    }
    // Fallback: parse and use UTC components to avoid timezone shifts between server/client
    try {
        const d = new Date(s);
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return s;
    }
};

export default function AssetsClient({ initialAssets }) {
  const [assets, setAssets] = useState(initialAssets);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
    // filter: all / ativo / liquidado
    const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [liquidateItem, setLiquidateItem] = useState(null);
    // Pagination
    const [pageStart, setPageStart] = useState(0);
    const pageSize = 10;

  const refreshList = async () => {
    setLoading(true);
    try {
            const params = { start: pageStart, end: pageStart + pageSize };
            const data = await getAssets(params);
            setAssets(data || []);
    } catch (error) {
      console.error("Failed to refresh assets:", error);
    } finally {
      setLoading(false);
    }
  };

    // Sync when initialAssets changes (server-side render) or pageStart changes
    useEffect(() => {
        // If we're on the first page and initialAssets provided, use it to avoid refetch
        if (pageStart === 0 && initialAssets) {
            setAssets(initialAssets || []);
            return;
        }
        refreshList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageStart]);

  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
                if (statusFilter === 'ativo' && item.status === 'liquidado') return false;
                if (statusFilter === 'liquidado' && item.status !== 'liquidado') return false;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                              item.type.toLowerCase().includes(search.toLowerCase());
        
        let matchesDate = true;
        if (startDate && item.acquisition_date < startDate) matchesDate = false;
        if (endDate && item.acquisition_date > endDate) matchesDate = false;

        return matchesSearch && matchesDate;
        });
    }, [assets, search, startDate, endDate, statusFilter]);

  const handleEdit = (item) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleAddNew = () => {
      setEditingItem(null);
      setIsModalOpen(true);
  };

    const handlePrev = () => {
        if (pageStart === 0) return;
        const newStart = Math.max(0, pageStart - pageSize);
        setPageStart(newStart);
    };

    const handleNext = () => {
        // If current page has fewer than pageSize items, no next page
        if (assets.length < pageSize) return;
        const newStart = pageStart + pageSize;
        setPageStart(newStart);
    };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="w-full md:w-auto flex-1 gap-4 flex flex-col md:flex-row">
             {/* Search */}
            <div className="flex items-end">
                <div className="mr-4">
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Status</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 font-semibold">
                        <option value="all">Todos</option>
                        <option value="ativo">Ativos</option>
                        <option value="liquidado">Liquidado</option>
                    </select>
                </div>
                </div>
                <div className="relative w-full md:w-64">
                <label className="text-xs font-bold text-gray-700 mb-1 block">Buscar</label>
                <input
                    type="text"
                    placeholder="Nome ou tipo..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <svg className="absolute left-3 top-8 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            
            {/* Date Filters */}
            <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">De</label>
                <input 
                    type="date" 
                    className="w-full md:w-auto px-3 py-2 rounded-lg border border-gray-300 focus:ring-emerald-500 text-gray-900"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Até</label>
                <input 
                    type="date" 
                    className="w-full md:w-auto px-3 py-2 rounded-lg border border-gray-300 focus:ring-emerald-500 text-gray-900"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>

        <button 
            onClick={handleAddNew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Adicionar Patrimônio
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-800 text-sm font-bold border-b border-gray-200">
                        <th className="p-4 whitespace-nowrap">Data de aquisição</th>
                        <th className="p-4 whitespace-nowrap">Nome do Patrimônio</th>
                        <th className="p-4 whitespace-nowrap">Tipo</th>
                        <th className="p-4 whitespace-nowrap">Valor Original</th>
                        <th className="p-4 whitespace-nowrap">Alteração Anual</th>
                        <th className="p-4 whitespace-nowrap">Manutenção Mensal</th>
                        <th className="p-4 whitespace-nowrap">Valor Atual</th>
                        <th className="p-4 whitespace-nowrap text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {loading && <tr><td colSpan="8" className="p-6 text-center text-gray-500">Atualizando...</td></tr>}
                    {!loading && filteredAssets.length === 0 && (
                        <tr><td colSpan="8" className="p-8 text-center text-gray-500">Nenhum patrimônio encontrado.</td></tr>
                    )}
                    {!loading && filteredAssets.map(item => (
                        <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.status === 'liquidado' ? 'opacity-60' : ''}`}>
                            <td className="p-4 text-gray-900">{formatDate(item.acquisition_date)}</td>
                            <td className="p-4 font-bold text-gray-900">{item.name}
                                {item.status === 'liquidado' && (
                                    <span className="ml-2 inline-block px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-800 rounded">Liquidado</span>
                                )}
                            </td>
                            <td className="p-4 text-gray-900">{item.type}</td>
                            <td className="p-4 text-gray-900">{formatCurrency(item.original_value)}</td>
                            <td className={`p-4 font-semibold ${item.annual_change_rate >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {item.annual_change_rate > 0 ? '+' : ''}{item.annual_change_rate}%
                            </td>
                            <td className="p-4 text-gray-900">{formatCurrency(item.monthly_maintenance)}</td>
                            <td className="p-4 font-bold text-gray-900">{formatCurrency(item.current_value)}</td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {/* Liquidate Button (Updated Icon) */}
                                    <button 
                                        onClick={() => setLiquidateItem(item)} 
                                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors"
                                        title="Liquidar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </button>
                                    
                                    {/* Edit Button */}
                                    <button 
                                        onClick={() => handleEdit(item)} 
                                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                        title="Editar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    
                                    {/* Delete Button */}
                                    <button 
                                        onClick={() => setDeleteItem(item)} 
                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                        title="Excluir"
                                    >
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                    {assets.length > 0 ? `Exibindo ${pageStart + 1}–${pageStart + assets.length}` : 'Nenhum item exibido'}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={pageStart === 0}
                        className={`px-3 py-1 rounded border ${pageStart === 0 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                    >
                        Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={assets.length < pageSize}
                        className={`px-3 py-1 rounded ${assets.length < pageSize ? 'bg-gray-100 text-gray-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                        Próxima
                    </button>
                </div>
            </div>

            {/* Modals */}
              {isModalOpen && (
                <AssetModal 
                    asset={editingItem} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={async (saved) => {
                        // If the modal returns the saved object, merge it into the list immediately
                        // to avoid requiring an F5. Then refresh page 0 to ensure ordering is correct.
                        try {
                            if (saved) {
                                // map backend naming to frontend shape (same as getAssets)
                                const item = {
                                    id: saved.id,
                                    acquisition_date: saved.data_aquisicao || saved.acquisition_date,
                                    name: saved.nome || saved.name,
                                    type: saved.tipo || saved.type || '',
                                    original_value: Number(saved.valor_original ?? saved.original_value ?? 0),
                                    annual_change_rate: Number(saved.variacao_anual_percent ?? saved.annual_change_rate ?? 0),
                                    monthly_maintenance: Number(saved.manutencao_mensal ?? saved.monthly_maintenance ?? 0),
                                    current_value: Number(saved.valor_atual ?? saved.current_value ?? saved.valor_original ?? 0),
                                    description: saved.descricao || saved.description || '',
                                    status: saved.status,
                                };

                                setAssets(prev => {
                                    const exists = prev.some(a => a.id === item.id);
                                    if (exists) {
                                        return prev.map(a => a.id === item.id ? item : a);
                                    }
                                    // prepend new item to the front
                                    const next = [item, ...prev];
                                    // keep page size
                                    return next.slice(0, pageSize);
                                });
                            }
                        } catch (err) {
                            console.error('Failed to merge saved item into list:', err);
                        }

                        // Determine the server page that contains the saved item and load it.
                        try {
                            let startForLoad = 0;
                            if (saved && saved.id) {
                                const idx = await getAssetPosition(saved.id);
                                if (typeof idx === 'number' && idx >= 0) {
                                    const page = Math.floor(idx / pageSize);
                                    startForLoad = page * pageSize;
                                    setPageStart(startForLoad);
                                }
                            } else {
                                // fallback to first page
                                setPageStart(0);
                                startForLoad = 0;
                            }

                            setLoading(true);
                            const params = { start: startForLoad, end: startForLoad + pageSize };
                            const data = await getAssets(params);
                            setAssets(data || []);
                        } catch (err) {
                            console.error('Failed to refresh assets after save:', err);
                        } finally {
                            setLoading(false);
                        }

                    }}
                />
              )}
      {deleteItem && (
        <DeleteAssetModal 
            asset={deleteItem} 
            onClose={() => setDeleteItem(null)} 
            onDeleted={refreshList} 
        />
      )}
      {liquidateItem && (
        <LiquidateAssetModal 
            asset={liquidateItem} 
            onClose={() => setLiquidateItem(null)} 
            onSuccess={refreshList} 
        />
      )}
    </div>
  );
}