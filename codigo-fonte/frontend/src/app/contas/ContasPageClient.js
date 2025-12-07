'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountBalance,
} from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import AccountFormModal from '@/components/accounts/AccountFormModal';
import DeleteAccountModal from '@/components/accounts/DeleteAccountModal';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function ContasPageClient({ user, initialAccounts = [] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [loading, setLoading] = useState(!initialAccounts.length);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const basicAccounts = await getAccounts();
      if (basicAccounts.length) {
        const balances = await Promise.all(
          basicAccounts.map((acc) => getAccountBalance(acc.id))
        );
        const balanceMap = new Map(
          balances.map((b) => [b.account_id, b.current_balance])
        );
        const merged = basicAccounts.map((account) => ({
          ...account,
          current_balance: balanceMap.get(account.id) ?? account.initial_balance,
        }));
        setAccounts(merged);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar contas ou saldos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialAccounts.length) {
      fetchAccounts();
    }
  }, [initialAccounts.length, fetchAccounts]);

  const handleOpenCreateModal = () => {
    setSelectedAccount(null);
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

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedAccount) {
        await updateAccount({
          id: selectedAccount.id,
          name: formData.name,
          agency: formData.agency,
          account_number: formData.account_number,
          initial_balance: formData.initial_balance,
        });
      } else {
        await createAccount(formData);
      }
      setIsFormModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Falha ao salvar a conta.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id);
      setIsDeleteModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Falha ao excluir a conta.');
    }
  };

  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200 w-full max-w-full min-w-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Contas</h1>
          <p className="text-sm text-gray-500">
            Cadastre e gerencie suas contas bancárias.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:items-center sm:gap-4">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus size={18} />
            Criar Conta
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-green-600" size={32} />
          <span className="ml-2 text-gray-600">Carregando contas...</span>
        </div>
      )}

      {!loading && error && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="inline mr-2" size={18} />
          {error}
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">Nenhuma conta cadastrada ainda.</p>
          <p className="text-sm text-gray-500 mt-2">
            Clique em "Criar Conta" para começar.
          </p>
        </div>
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full min-w-[800px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Agência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Conta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Saldo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
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
                    {formatCurrency(account.current_balance)}
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

      <AccountFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        account={selectedAccount}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        account={selectedAccount}
      />
    </section>
  );
}
