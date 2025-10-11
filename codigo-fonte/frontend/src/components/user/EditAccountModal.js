'use client';
import { useState } from "react";
import { formStyles } from "@/config/styles";
import { useAuth } from "@/context/AuthContext";
import { updateUserInfo } from "@/lib/api"; // REFACTOR: Import new utility function.

// REFACTOR: This component is now more robust. It uses the centralized `updateUserInfo`
// function, which leverages `axiosInstance` for proper token handling. It also provides
// more specific user feedback instead of generic errors.
export default function EditAccountModal({ onClose }) {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setError(null);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- Form Validation ---
    if (!formData.username.trim() || !formData.email.trim()) {
      return setError("Nome de usuário e email são obrigatórios.");
    }
    if (!formData.currentPassword) {
      return setError("Você precisa informar sua senha atual para salvar as alterações.");
    }
    const isChangingPassword = formData.newPassword || formData.confirmNewPassword;
    if (isChangingPassword && formData.newPassword !== formData.confirmNewPassword) {
      return setError("A nova senha e a confirmação não coincidem.");
    }

    setLoading(true);
    try {
      await updateUserInfo(formData); // Use the centralized API utility
      await refreshUser(); // Refresh global user state on success
      onClose(); // Close the modal
    } catch (err) {
      console.error("Failed to update user info:", err);
      setError(err.message || "Não foi possível salvar as alterações. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`${formStyles.formWrapper} max-w-lg relative`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          {/* SVG for close icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-6">Editar Perfil</h2>

        <form onSubmit={handleSubmit} className={formStyles.form}>
          {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

          <input name="username" value={formData.username} onChange={handleChange} placeholder="Nome de usuário" className={formStyles.input} />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={formStyles.input} />
          <hr className="my-2" />
          <input name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} placeholder="Senha Atual (obrigatória)" required className={formStyles.input} />
          <input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="Nova Senha (opcional)" className={formStyles.input} />
          <input name="confirmNewPassword" type="password" value={formData.confirmNewPassword} onChange={handleChange} placeholder="Confirmar Nova Senha" className={formStyles.input} />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`} disabled={loading}>Cancelar</button>
            <button type="submit" className={`${formStyles.baseButton} ${formStyles.loginButton}`} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}