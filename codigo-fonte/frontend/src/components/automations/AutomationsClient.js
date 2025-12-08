"use client";

import { useState } from "react";
import { getAutomations } from "@/lib/api";
import AutomationModal from "./AutomationModal";
import DeleteAutomationModal from "./DeleteAutomationModal";

const formatCurrency = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AutomationsClient({ initialAutomations }) {
  const [automations, setAutomations] = useState(initialAutomations || []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [automationToDelete, setAutomationToDelete] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filteredAutomations = automations.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await getAutomations();
      setAutomations(data);
    } catch (error) {
      console.error("Failed to refresh automations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setAutomationToDelete(item);
    setShowDeleteModal(true);
  };

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Automações</h1>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && <div className="p-4 text-center text-gray-500">Atualizando...</div>}
        
        {!loading && filteredAutomations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? "Nenhuma automação encontrada para a busca." : "Nenhuma automação cadastrada."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAutomations.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Row 1 */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800 text-lg">{item.name}</span>
                  <span className={`font-bold ${item.value < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
                {/* Row 2 */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Vencimento dia {item.day_of_month} • {item.frequency}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                        title="Editar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(item)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      title="Excluir"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (Centered at bottom of content) */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleOpenNew}
          className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Adicionar Automação
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AutomationModal 
            onClose={() => setIsModalOpen(false)}
            onSuccess={refreshList}
            automationToEdit={editingItem}
        />
      )}
      {showDeleteModal && automationToDelete && (
        <DeleteAutomationModal
          automation={automationToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setAutomationToDelete(null);
          }}
          onDeleted={refreshList}
        />
      )}
    </div>
  );
}
