'use client';
import { useState } from "react";
import { formStyles } from "@/utils/variables";
import { useAuth } from "@/context/AuthContext";
import { deleteUserAccount } from "@/utils/auth"; // REFACTOR: Import new utility function.

// REFACTOR: This component is now safer and more integrated.
// - It uses a centralized `deleteUserAccount` function with proper auth handling.
// - On success, it calls the global `logout` function, which correctly cleans up the
//   session state and redirects the user, instead of using a hard page reload.
export default function DeleteAccountModal({ onClose }) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleDeleteConfirm = async () => {
    setError(null);
    if (!password) {
      return setError("Por favor, informe sua senha para confirmar a exclusão.");
    }
    setLoading(true);
    try {
      await deleteUserAccount(password);
      // On successful deletion, trigger the global logout process.
      // This will handle cookie clearing, state updates, and redirection.
      await logout();
      // No need to call onClose() as the user will be redirected away.
    } catch (err) {
      console.error("Failed to delete account:", err);
      setError(err.message || "Senha incorreta ou erro ao excluir a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Excluir sua Conta</h2>
        <p className="text-sm text-gray-600 mb-4">
          Esta ação é <strong>permanente</strong> e não pode ser desfeita. Para confirmar, por favor, digite sua senha.
        </p>
        
        {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
        
        <input
          type="password"
          className={`${formStyles.input} mb-4`}
          placeholder="Sua senha"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          disabled={loading}
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`} disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleDeleteConfirm} className={`${formStyles.baseButton} ${formStyles.deleteButton}`} disabled={loading}>
            {loading ? "Excluindo..." : "Excluir Conta"}
          </button>
        </div>
      </div>
    </div>
  );
}