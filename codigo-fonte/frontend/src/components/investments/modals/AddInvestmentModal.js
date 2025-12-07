"use client";

import { useState, useEffect } from "react";
import { createInvestment, updateInvestment, getAccounts } from "@/lib/api"; // Added updateInvestment
import { formStyles } from "@/config/styles";

export default function AddInvestmentModal({ onClose, onSuccess, investment }) {
  const isEdit = !!investment; // Check if we are in edit mode

  const [formData, setFormData] = useState({
    name: "",
    type: "fixed_income",
    profitability_type: "",
    profitability_rate: "",
    due_date: "",
    account_id: "",
    initial_date: new Date().toISOString().split('T')[0],
    quantity: "",
    unit_price: "",
    initial_value: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (investment) {
        setFormData({
            name: investment.name || "",
            type: investment.type || "fixed_income",
            profitability_type: investment.profitability_type || "",
            profitability_rate: investment.profitability_rate || "",
            due_date: investment.due_date || "",
            account_id: investment.account_id || "",
            initial_date: investment.initial_date || new Date().toISOString().split('T')[0],
            quantity: investment.quantity || "",
            unit_price: investment.unit_price || "",
            initial_value: investment.applied_value || "", // Mapping applied_value to initial_value
        });
    }
  }, [investment]);

  // Auto-calculate total ONLY if quantity and unit_price are provided
  useEffect(() => {
    if (formData.type === "variable_income" && formData.quantity && formData.unit_price) {
        const total = (Number(formData.quantity) * Number(formData.unit_price)).toFixed(2);
        setFormData(prev => ({ ...prev, initial_value: total }));
    }
  }, [formData.quantity, formData.unit_price, formData.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (isEdit) {
            await updateInvestment({ ...formData, id: investment.id });
        } else {
            await createInvestment(formData);
        }
        onSuccess();
        onClose();
    } catch (error) {
        alert("Erro ao salvar investimento.");
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValueReadOnly = formData.type === 'variable_income' && Number(formData.quantity) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-black mb-4">
            {isEdit ? "Editar Investimento" : "Adicionar Novo Investimento"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Nome do Investimento</label>
                <input required name="name" className={formStyles.input} value={formData.name} onChange={handleChange} />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Tipo</label>
                <select name="type" className={formStyles.input} value={formData.type} onChange={handleChange}>
                    <option value="fixed_income">Renda Fixa</option>
                    <option value="variable_income">Renda Variável</option>
                </select>
             </div>
          </div>

          {/* Fixed Income Specifics */}
          {formData.type === 'fixed_income' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Tipo Rentabilidade</label>
                    <input name="profitability_type" placeholder="Ex: CDB, LCI" className={formStyles.input} value={formData.profitability_type} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Taxa</label>
                    <input name="profitability_rate" placeholder="Ex: 100% CDI" className={formStyles.input} value={formData.profitability_rate} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Vencimento</label>
                    <input type="date" name="due_date" className={formStyles.input} value={formData.due_date} onChange={handleChange} />
                </div>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Conta de Origem</label>
                <select required name="account_id" className={formStyles.input} value={formData.account_id} onChange={handleChange}>
                    <option value="">Selecione...</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Data Aporte Inicial</label>
                <input required type="date" name="initial_date" className={formStyles.input} value={formData.initial_date} onChange={handleChange} />
            </div>
          </div>

          {/* Variable Income Specifics */}
          {formData.type === 'variable_income' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Quantidade (Opcional)</label>
                    <input type="number" name="quantity" className={formStyles.input} value={formData.quantity} onChange={handleChange} placeholder="0" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Preço Unitário (Opcional)</label>
                    <input type="number" step="0.01" name="unit_price" className={formStyles.input} value={formData.unit_price} onChange={handleChange} placeholder="0.00" />
                </div>
             </div>
          )}

          <div>
             <label className="block text-sm font-bold text-gray-900 mb-1">Valor do Aporte Inicial (R$)</label>
             <input 
                required 
                type="number" 
                step="0.01" 
                name="initial_value" 
                className={`${formStyles.input} ${isValueReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                value={formData.initial_value} 
                onChange={handleChange} 
                readOnly={isValueReadOnly} 
             />
             {isValueReadOnly && <p className="text-xs text-gray-500 mt-1">Calculado automaticamente (Qtd x Preço)</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <button type="button" onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}>Cancelar</button>
             <button type="submit" disabled={loading} className={`${formStyles.baseButton} ${formStyles.loginButton}`}>
                {loading ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Salvar Investimento")}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}