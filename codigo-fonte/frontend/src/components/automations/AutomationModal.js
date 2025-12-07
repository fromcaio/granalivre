"use client";

import { useState, useEffect } from "react";
import { createAutomation, updateAutomation } from "@/lib/api";
import { formStyles } from "@/config/styles";

export default function AutomationModal({ onClose, onSuccess, automationToEdit }) {
  const isEdit = !!automationToEdit;
  
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    day: "",
    type: "expense", // Default
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load data if editing
  useEffect(() => {
    if (isEdit && automationToEdit) {
      setFormData({
        name: automationToEdit.name,
        value: Math.abs(automationToEdit.value).toString(),
        day: automationToEdit.day,
        type: automationToEdit.type || (automationToEdit.value < 0 ? "expense" : "income"),
      });
    }
  }, [isEdit, automationToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const numericValue = parseFloat(formData.value.replace(',', '.'));
      const day = parseInt(formData.day);

      if (isNaN(numericValue) || numericValue <= 0) throw new Error("Valor inválido.");
      if (isNaN(day) || day < 1 || day > 31) throw new Error("Dia inválido (1-31).");

      // Format value based on type
      const finalValue = formData.type === 'expense' ? -Math.abs(numericValue) : Math.abs(numericValue);

      const payload = {
        name: formData.name,
        value: finalValue,
        day: day,
        type: formData.type,
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
              placeholder="Ex: Aluguel" 
              value={formData.name} 
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
                name="day" 
                type="number" 
                min="1" 
                max="31" 
                className={formStyles.input} 
                placeholder="1-31" 
                value={formData.day} 
                onChange={handleChange} 
                required 
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="type" 
                        value="expense" 
                        checked={formData.type === 'expense'} 
                        onChange={handleChange}
                        className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700">Despesa (Saída)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="type" 
                        value="income" 
                        checked={formData.type === 'income'} 
                        onChange={handleChange}
                        className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700">Receita (Entrada)</span>
                </label>
            </div>
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