"use client";

import { useState, useEffect } from "react";
import { liquidateInvestment, getAccounts } from "@/lib/api";
import { formStyles } from "@/config/styles";

export default function LiquidationModal({ investment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    operation_type: "Resgate Total",
    date: new Date().toISOString().split('T')[0],
    value: "",
    description: "",
    fees: "",
    destination_account_id: "",
  });
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch accounts to populate the dropdown
  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await liquidateInvestment(investment.id, formData);
        onSuccess();
        onClose();
    } catch (e) {
        alert("Erro ao liquidar.");
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold text-black mb-2">Liquidar Investimento</h2>
        <p className="text-sm text-gray-900 mb-4">
            Valor atual estimado: <strong>{Number(investment.current_value).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Tipo de Operação</label>
                <select name="operation_type" className={formStyles.input} value={formData.operation_type} onChange={handleChange}>
                    <option>Resgate Total</option>
                    <option>Resgate Parcial</option>
                </select>
            </div>
            
            {formData.operation_type === 'Resgate Parcial' && (
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Valor do Resgate</label>
                    <input required type="number" step="0.01" name="value" className={formStyles.input} value={formData.value} onChange={handleChange} />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Data</label>
                    <input type="date" name="date" className={formStyles.input} value={formData.date} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Taxas</label>
                    <input type="number" step="0.01" name="fees" className={formStyles.input} value={formData.fees} onChange={handleChange} />
                </div>
            </div>

            {/* Destination Account Dropdown */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Conta de Destino</label>
                <select required name="destination_account_id" className={formStyles.input} value={formData.destination_account_id} onChange={handleChange}>
                    <option value="">Selecione a conta...</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-900 mb-1">Descrição (Opcional)</label>
                 <input type="text" name="description" className={formStyles.input} value={formData.description} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}>Cancelar</button>
                <button type="submit" disabled={loading} className={`${formStyles.baseButton} ${formStyles.deleteButton}`}>Resgatar</button>
            </div>
        </form>
      </div>
    </div>
  );
}