'use client';
import { useState } from "react";
import { formStyles } from "@/config/styles";
import { useAuth } from "@/context/AuthContext";
import { deleteUserAccount } from "@/lib/api"; // REFACTOR: Import new utility function.

export default function DeleteAccountModal({ onClose }) {
  // Obter a nova função específica para exclusão de conta.
  const { handleAccountDeletion } = useAuth();
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
      // Após a exclusão bem-sucedida, chama a função que redireciona para a home.
      handleAccountDeletion();
    } catch (err) {
      console.error("Falha ao excluir a conta:", err);
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
          className={formStyles.input}
          placeholder="Sua senha"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          disabled={loading}
        />
        <div className="flex justify-end gap-3 mt-4">
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