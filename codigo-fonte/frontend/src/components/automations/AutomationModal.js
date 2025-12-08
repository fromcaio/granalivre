"use client";

import { useState, useEffect } from "react";
import { createAutomation, updateAutomation, getAccounts } from "@/lib/api";
import { formStyles } from "@/config/styles";

export default function AutomationModal({ onClose, onSuccess, automationToEdit }) {
  const isEdit = !!automationToEdit;
  
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    day_of_month: "",
    frequency: "mensal",
    category: "",
    description: "",
    account: "", // ID da conta
    active: true,
  });
  const [accounts, setAccounts] = useState([]);
  const [valueType, setValueType] = useState("saida"); // Visual: saida ou entrada
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load data if editing
  useEffect(() => {
    if (isEdit && automationToEdit) {
      const tipoEstimado = automationToEdit.value < 0 ? "saida" : "entrada";
      setValueType(tipoEstimado);
      setFormData({
        name: automationToEdit.name,
        value: Math.abs(automationToEdit.value).toString(),
        day_of_month: automationToEdit.day_of_month,
        frequency: automationToEdit.frequency || "mensal",
        category: automationToEdit.category || "",
        description: automationToEdit.description || "",
        account: automationToEdit.account,
        active: automationToEdit.active !== false,
      });
    }
  }, [isEdit, automationToEdit]);

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data || []);
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      }
    };
    loadAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "value") {
      // Atualizar valor sem conversão (será feita no submit)
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (type) => {
    setValueType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const numericValue = parseFloat(formData.value.replace(',', '.'));
      const dayOfMonth = parseInt(formData.day_of_month);

      if (!formData.name.trim()) throw new Error("Nome é obrigatório.");
      if (isNaN(numericValue) || numericValue <= 0) throw new Error("Valor inválido.");
      if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) throw new Error("Dia inválido (1-31).");
      if (!formData.account) throw new Error("Selecione uma conta.");
      if (!formData.category.trim()) throw new Error("Categoria é obrigatória.");
      if (!formData.frequency.trim()) throw new Error("Frequência é obrigatória.");

      // Converter valor baseado no tipo selecionado
      let finalValue = Math.abs(numericValue);
      if (valueType === "saida") {
        finalValue = -finalValue; // Negativo para saída
      }
      // Para entrada, mantém positivo

      const payload = {
        name: formData.name,
        value: finalValue,
        day_of_month: dayOfMonth,
        frequency: formData.frequency,
        category: formData.category,
        description: formData.description,
        account: parseInt(formData.account),
        active: formData.active,
      };

      if (isEdit) {
        await updateAutomation({ ...payload, id: automationToEdit.id });
      } else {
        await createAutomation(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Erro ao salvar automação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Editar Automação" : "Nova Automação"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input 
              name="name" 
              type="text" 
              className={formStyles.input} 
              placeholder="Ex: Aluguel, Netflix" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
            <select 
              name="account" 
              className={formStyles.input} 
              value={formData.account} 
              onChange={handleChange} 
              required
            >
              <option value="">Selecione uma conta...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.account_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input 
              name="category" 
              type="text" 
              className={formStyles.input} 
              placeholder="Ex: Aluguel, Internet, Salário" 
              value={formData.category} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input 
                name="value" 
                type="number" 
                step="0.01" 
                className={formStyles.input} 
                placeholder="0.00" 
                value={formData.value} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Dia Vencimento</label>
               <input 
                name="day_of_month" 
                type="number" 
                min="1" 
                max="31" 
                className={formStyles.input} 
                placeholder="1-31" 
                value={formData.day_of_month} 
                onChange={handleChange} 
                required 
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange("saida")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                  valueType === "saida"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Saída (Despesa)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("entrada")}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                  valueType === "entrada"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Entrada (Receita)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequência</label>
            <select 
              name="frequency" 
              className={formStyles.input} 
              value={formData.frequency} 
              onChange={handleChange} 
              required
            >
              <option value="mensal">Mensal</option>
              <option value="semanal">Semanal</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <textarea 
              name="description" 
              className={formStyles.input} 
              placeholder="Adicione uma descrição..." 
              value={formData.description} 
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}>Cancelar</button>
            <button type="submit" disabled={submitting} className={`${formStyles.baseButton} ${formStyles.loginButton}`}>
                {submitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}