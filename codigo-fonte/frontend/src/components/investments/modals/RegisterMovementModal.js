"use client";

import { useState } from "react";
import { createInvestmentMovement } from "@/lib/api";
import { formStyles } from "@/config/styles";

export default function RegisterMovementModal({ investment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: "Aporte",
    date: new Date().toISOString().split('T')[0],
    value: "",
    description: "",
    quantity: "",
    unit_price: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await createInvestmentMovement(investment.id, formData);
        onSuccess();
    } catch (e) {
        alert("Erro ao registrar movimentação.");
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Movimentação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select name="type" className={formStyles.input} value={formData.type} onChange={handleChange}>
                    <option>Aporte</option>
                    <option>Resgate</option>
                    <option>Rendimento</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input type="date" name="date" className={formStyles.input} value={formData.date} onChange={handleChange} />
            </div>
            
            {investment.type === 'variable_income' && (
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Qtd.</label>
                        <input type="number" name="quantity" className={formStyles.input} value={formData.quantity} onChange={handleChange} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Preço Unit.</label>
                        <input type="number" step="0.01" name="unit_price" className={formStyles.input} value={formData.unit_price} onChange={handleChange} />
                     </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Valor Total (R$)</label>
                <input type="number" step="0.01" name="value" className={formStyles.input} value={formData.value} onChange={handleChange} />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                <input type="text" name="description" className={formStyles.input} value={formData.description} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}>Cancelar</button>
                <button type="submit" disabled={loading} className={`${formStyles.baseButton} ${formStyles.loginButton}`}>Salvar</button>
            </div>
        </form>
      </div>
    </div>
  );
}