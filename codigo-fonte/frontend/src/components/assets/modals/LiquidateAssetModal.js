"use client";

import { useState, useEffect } from "react";
import { liquidateAsset, getAccounts } from "@/lib/api";
import { formStyles } from "@/config/styles";

const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR');

export default function LiquidateAssetModal({ asset, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    sale_value: "",
    destination_account_id: "",
  });
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        destination_account_id: formData.destination_account_id,
      };
      if (formData.sale_value && String(formData.sale_value).trim() !== '') {
        payload.sale_value = Number(formData.sale_value);
      }
      await liquidateAsset(asset.id, payload);
        onSuccess();
        onClose();
    } catch (e) {
        alert("Erro ao liquidar patrimônio.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold text-black mb-4">Liquidar Patrimônio</h2>

        {/* Read Only Fields */}
        <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded border border-gray-200 text-sm">
            <div><span className="font-bold text-black">Data de Aquisição:</span> <span className="text-gray-900">{formatDate(asset.acquisition_date)}</span></div>
            <div><span className="font-bold text-black">Nome:</span> <span className="text-gray-900">{asset.name}</span></div>
            <div><span className="font-bold text-black">Tipo:</span> <span className="text-gray-900">{asset.type}</span></div>
            <div><span className="font-bold text-black">Valor Original:</span> <span className="text-gray-900">{formatCurrency(asset.original_value)}</span></div>
            <div><span className="font-bold text-black">Valor Atual (Estimado):</span> <span className="font-bold text-emerald-700">{formatCurrency(asset.current_value)}</span></div>
            <div><span className="font-bold text-black">Descrição:</span> <span className="text-gray-900">{asset.description || '-'}</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Valor da Venda (R$) <span className="text-xs font-normal text-gray-500">(opcional)</span></label>
              <input type="number" step="0.01" placeholder="Deixe em branco para usar valor atual" 
                className={formStyles.input} 
                value={formData.sale_value} 
                onChange={(e) => setFormData({...formData, sale_value: e.target.value})} 
              />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Conta de Destino</label>
                <select required 
                    className={formStyles.input} 
                    value={formData.destination_account_id} 
                    onChange={(e) => setFormData({...formData, destination_account_id: e.target.value})}
                >
                    <option value="">Selecione a conta...</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">O valor da venda será depositado nesta conta.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}>Cancelar</button>
                <button type="submit" disabled={loading} className={`${formStyles.baseButton} ${formStyles.deleteButton}`}>Liquidar</button>
            </div>
        </form>
      </div>
    </div>
  );
}