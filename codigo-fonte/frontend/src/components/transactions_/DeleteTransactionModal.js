'use client';

import { useState } from "react";
import { formStyles } from "@/config/styles";
import { deleteTransaction } from "@/lib/api";

export default function DeleteTransactionModal({ onClose, transaction, onDeleted, title = "Excluir Transação" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await deleteTransaction(transaction.id);
      onDeleted?.();
      onClose();
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      setError(err.message || "Erro ao excluir a transação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6 relative">
        {/* Botão de fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja excluir <strong>{transaction.name}</strong>?<br />
          Esta ação é <strong>permanente</strong> e não poderá ser desfeita.
        </p>

        {error && (
          <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteConfirm}
            className={`${formStyles.baseButton} ${formStyles.deleteButton}`}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
