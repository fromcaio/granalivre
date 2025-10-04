'use client'
import axios from "axios";
import { useState } from "react";
import { formStyles } from "@/utils/variables";

export default function DeleteAccountModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  const confirm = async () => {
    setErr(null);
    if (!password) {
      setErr("Informe sua senha para confirmar.");
      return;
    }
    setLoading(true);
    try {
      await axios.delete(
        "http://127.0.0.1:8000/api/users/user-info/",
        {
          data: { current_password: password },
          withCredentials: true
        }
      );
      window.location.href = "/";
    } catch (e) {
      setErr("Senha incorreta ou erro ao excluir conta.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Excluir Conta</h2>
        <p className="text-sm text-gray-600 mb-4">
          Esta ação é permanente. Para confirmar, digite sua senha.
        </p>
        {err && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded mb-2">
            {err}
          </div>
        )}
        <input
          type="password"
          className={formStyles.input + " mb-4"}
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className={formStyles.secondaryCancelButton}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            disabled={loading}
            onClick={confirm}
            className={formStyles.deleteButton}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}