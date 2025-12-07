"use client";

import { useState } from "react";
import { formStyles } from "@/config/styles";
import { deleteAsset } from "@/lib/api";

export default function DeleteAssetModal({ onClose, asset, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await deleteAsset(asset.id);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err.message || "Erro ao excluir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6 relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
        <h2 className="text-xl font-bold text-black mb-2">Excluir Patrimônio</h2>
        <p className="text-sm text-gray-700 mb-4">
          Tem certeza que deseja excluir <strong>{asset?.name}</strong>?<br />
          Esta ação é <strong>permanente</strong>.
        </p>
        {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`} disabled={loading}>Cancelar</button>
          <button onClick={handleDeleteConfirm} className={`${formStyles.baseButton} ${formStyles.deleteButton}`} disabled={loading}>{loading ? "Excluindo..." : "Excluir"}</button>
        </div>
      </div>
    </div>
  );
}