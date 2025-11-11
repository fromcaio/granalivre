'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const initialState = {
  name: '',
  agency: '',
  account_number: '',
  initial_balance: '',
};

export default function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determina se é modo de edição
  const isEditMode = !!initialData;

  // Atualiza o formulário quando initialData (para edição) mudar
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          name: initialData.name,
          agency: initialData.agency,
          account_number: initialData.account_number,
          initial_balance: initialData.initial_balance,
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [isOpen, initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Converte o saldo para número antes de enviar
    await onSubmit({
      ...formData,
      initial_balance: parseFloat(formData.initial_balance) || 0,
    });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4"
        onClick={(e) => e.stopPropagation()} // Impede que o clique no modal feche o modal
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Editar Conta' : 'Criar Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome da Conta
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Conta Principal"
            />
          </div>

          {/* Agência */}
          <div>
            <label
              htmlFor="agency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Agência
            </label>
            <input
              type="text"
              id="agency"
              name="agency"
              value={formData.agency}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 0001"
            />
          </div>

          {/* Número da Conta */}
          <div>
            <label
              htmlFor="account_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número da Conta
            </label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 12345-6"
            />
          </div>

          {/* Saldo Inicial */}
          <div>
            <label
              htmlFor="initial_balance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Saldo Inicial (R$)
            </label>
            <input
              type="number"
              id="initial_balance"
              name="initial_balance"
              value={formData.initial_balance}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 1000.50"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}