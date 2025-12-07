"use client";

import { useState, useEffect } from "react";
import { createAsset, updateAsset } from "@/lib/api";
import { formStyles } from "@/config/styles";

export default function AssetModal({ asset, onClose, onSuccess }) {
  const isEdit = !!asset;
  
  const [formData, setFormData] = useState({
    acquisition_date: new Date().toISOString().split('T')[0],
    name: "",
    type: "",
    original_value: "",
    annual_change_rate: "",
    monthly_maintenance: "",
    current_value: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset) {
        setFormData({
            acquisition_date: asset.acquisition_date,
            name: asset.name,
            type: asset.type,
            original_value: asset.original_value,
            annual_change_rate: asset.annual_change_rate,
            monthly_maintenance: asset.monthly_maintenance,
            current_value: asset.current_value,
            description: asset.description || "",
        });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            ...formData,
            id: asset?.id
        };

        if (isEdit) {
            await updateAsset(payload);
        } else {
            await createAsset(payload);
        }
        onSuccess();
        onClose();
    } catch (error) {
        alert("Erro ao salvar patrimônio.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-black mb-4">{isEdit ? "Editar Patrimônio" : "Adicionar Patrimônio"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Data de Aquisição</label>
                <input required type="date" name="acquisition_date" className={formStyles.input} value={formData.acquisition_date} onChange={handleChange} />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Nome do Patrimônio</label>
                <input required name="name" className={formStyles.input} value={formData.name} onChange={handleChange} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Tipo</label>
                <input required name="type" placeholder="Ex: Carro, Imóvel" className={formStyles.input} value={formData.type} onChange={handleChange} />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Valor Original (R$)</label>
                <input required type="number" step="0.01" name="original_value" className={formStyles.input} value={formData.original_value} onChange={handleChange} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Alteração Anual (%)</label>
                <input required type="number" step="0.01" name="annual_change_rate" placeholder="-5.4 ou 7.8" className={formStyles.input} value={formData.annual_change_rate} onChange={handleChange} />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Manutenção Mensal (R$)</label>
                <input type="number" step="0.01" name="monthly_maintenance" className={formStyles.input} value={formData.monthly_maintenance} onChange={handleChange} />
             </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-900 mb-1">Valor Atual do Patrimônio (R$)</label>
             <input required type="number" step="0.01" name="current_value" className={formStyles.input} value={formData.current_value} onChange={handleChange} />
             <p className="text-xs text-gray-500 mt-1">Preencha com o valor de mercado atual.</p>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-900 mb-1">Descrição</label>
             <textarea rows="3" name="description" className={formStyles.input} value={formData.description} onChange={handleChange} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <button type="button" onClick={onClose} className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}>Cancelar</button>
             <button type="submit" disabled={loading} className={`${formStyles.baseButton} ${formStyles.loginButton}`}>
                {loading ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Adicionar")}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}