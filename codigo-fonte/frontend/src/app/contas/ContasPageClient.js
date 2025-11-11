'use client';

import { useState, useEffect } from 'react';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import AccountFormModal from '@/components/accounts/AccountFormModal';
import DeleteAccountModal from '@/components/accounts/DeleteAccountModal';

// Função utilitária para formatar moeda
const formatCurrency = (value) => {
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function ContasPageClient({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estado para a conta selecionada (para edição ou exclusão)
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Busca as contas na montagem do componente
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err.message || 'Erro ao buscar contas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handlers para abrir modais
  const handleOpenCreateModal = () => {
    setSelectedAccount(null); // Garante que não há dados de edição
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (account) => {
    setSelectedAccount(account);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (account) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  // Handlers de submissão dos modais
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedAccount) {
        // Modo Edição (PUT)
        // O backend espera o ID e todos os campos no PUT
        await updateAccount({
          id: selectedAccount.id,
          name: formData.name,
          agency: formData.agency,
          account_number: formData.account_number,
          initial_balance: formData.initial_balance,
        });
      } else {
        // Modo Criação (POST)
        await createAccount(formData);
      }
      setIsFormModalOpen(false);
      fetchAccounts(); // Atualiza a lista
    } catch (err) {
      console.error(err);
      alert(err.message || 'Falha ao salvar a conta.'); // Simples, como solicitado
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id);
      setIsDeleteModalOpen(false);
      fetchAccounts(); // Atualiza a lista
    } catch (err) {
      console.error(err);
      alert(err.message || 'Falha ao excluir a conta.'); // Simples, como solicitado
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Título e Botão de Criar */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Contas</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
        >
          <Plus size={18} />
          Criar Conta
        </button>
      </div>

      {/* 2. Feedback de Estado (Loading, Erro, Vazio) */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-green-600" size={32} />
          <span className="ml-2 text-gray-600">Carregando contas...</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex justify-center items-center py-10 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={32} />
          <span className="ml-2 text-red-700">{error}</span>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div className="text-center py-10 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Nenhuma conta cadastrada ainda.</p>
          <p className="text-sm text-gray-500 mt-2">
            Clique em "Criar Conta" para começar.
          </p>
        </div>
      )}

      {/* 3. Lista/Tabela de Contas */}
      {!loading && !error && accounts.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Agência
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Conta
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Saldo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {account.agency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {account.account_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {/* Usando o initial_balance conforme API */}
                    {formatCurrency(account.initial_balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(account)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(account)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100 transition"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Modais */}
      <AccountFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedAccount} // Passa null para criar, ou a conta para editar
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        accountName={selectedAccount?.name}
      />
    </div>
  );
}