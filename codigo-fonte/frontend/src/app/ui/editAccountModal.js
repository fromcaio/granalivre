'use client'
import { useState } from "react";
import axios from "axios";

export default function EditAccountModal({ user, onClose, onUpdated }) {
  const [firstName, setFirstName] = useState(user?.first_name || "");
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

    if (!firstName.trim()) return setErr("Informe o nome.");
    if (!email.trim()) return setErr("Informe o e-mail.");

    const changingPassword = newPassword || confirmNew || currentPassword;
    if (changingPassword) {
      if (!currentPassword) return setErr("Informe a senha atual.");
      if (!newPassword) return setErr("Informe a nova senha.");
      if (newPassword.length < 6) return setErr("Nova senha mínimo 6 caracteres.");
      if (newPassword !== confirmNew) return setErr("Nova senha e confirmação não coincidem.");
    }

    const payload = {
      first_name: firstName,
      email
    };
    if (changingPassword) {
      payload.current_password = currentPassword;
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
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar Conta</h2>
        <form onSubmit={submit} className="space-y-4">
          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {err}
            </div>
          )}

            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={firstName}
                onChange={(e)=>setFirstName(e.target.value)}
              />
            </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Alterar Senha (opcional)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Senha Atual</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={currentPassword}
                  onChange={(e)=>setCurrentPassword(e.target.value)}
                  placeholder="Necessária se for trocar a senha"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newPassword}
                    onChange={(e)=>setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={confirmNew}
                    onChange={(e)=>setConfirmNew(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              className="px-5 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}