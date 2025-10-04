'use client'
import { useState } from "react";
import axios from "axios";
import { formStyles } from "@/utils/variables";

export default function EditAccountModal({ user, onClose, onUpdated }) {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const resetErrors = () => setErr(null);

  const submit = async (e) => {
    e.preventDefault();
    resetErrors();

    if (!username.trim()) return setErr("Informe o nome de usuário.");
    if (!email.trim()) return setErr("Informe o e-mail.");
    if (!currentPassword) return setErr("Informe a senha atual para confirmar as alterações.");

    const changingPassword = newPassword || confirmNew;
    if (changingPassword) {
      if (!newPassword) return setErr("Informe a nova senha.");
      if (newPassword.length < 6) return setErr("Nova senha mínimo 6 caracteres.");
      if (newPassword !== confirmNew) return setErr("Nova senha e confirmação não coincidem.");
    }

    const payload = {
      username: username,
      email,
      current_password: currentPassword
    };
    if (changingPassword) {
      payload.new_password = newPassword;
    }

    setLoading(true);
    try {
      await axios.patch(
        "http://127.0.0.1:8000/api/users/user-info/",
        payload,
        { withCredentials: true }
      );
      if (onUpdated) onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      if (e.response?.data) {
        const msg = typeof e.response.data === 'string'
          ? e.response.data
          : Object.values(e.response.data).flat().join(' ');
        setErr(msg || "Erro ao salvar.");
      } else {
        setErr("Erro ao salvar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className={formStyles.formWrapper + " max-w-lg relative"}>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar Conta</h2>
        <form onSubmit={submit} className={formStyles.form}>
          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {err}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nome de Usuário</label>
            <input
              className={formStyles.input}
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">E-mail</label>
            <input
              type="email"
              className={formStyles.input}
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Senha Atual</label>
            <input
              type="password"
              className={formStyles.input}
              value={currentPassword}
              onChange={(e)=>setCurrentPassword(e.target.value)}
              placeholder="Confirme sua identidade"
              required
            />
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-700 mb-4">Alterar Senha (opcional)</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Nova Senha</label>
                <input
                  type="password"
                  className={formStyles.input}
                  value={newPassword}
                  onChange={(e)=>setNewPassword(e.target.value)}
                  placeholder="Deixe vazio para manter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Confirmar Nova Senha</label>
                <input
                  type="password"
                  className={formStyles.input}
                  value={confirmNew}
                  onChange={(e)=>setConfirmNew(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={formStyles.cancelButton}
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              className={formStyles.loginButton}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}