'use client'
import axios from "axios";
import { useState } from "react";

export default function DeleteAccountModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await axios.delete("http://127.0.0.1:8000/api/users/user-info/", { withCredentials: true });
      // redirecionar / limpar estado local se necessário
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Excluir Conta</h2>
        <p className="text-sm text-gray-600 mb-4">
          Esta ação é permanente. Tem certeza que deseja continuar?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100">
            Cancelar
          </button>
          <button disabled={loading} onClick={confirm}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50">
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}