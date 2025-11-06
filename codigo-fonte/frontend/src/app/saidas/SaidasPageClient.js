"use client";

import DeleteTransactionModal from "@/components/transactions_/DeleteTransactionModal";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteTransaction, getTransactions } from "@/lib/api";
import AddExpenseModal from "@/components/transactions_/AddExpenseModal";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const formatValue = (value) => currencyFormatter.format(Number(value));

const formatDateTime = (value) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SaidasPageClient() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- Carrega as saídas ---
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      const onlyExpenses = (data || []).filter(
        (t) => t.type === "expense" || !t.type
      );
      setExpenses(onlyExpenses);
    } catch (err) {
      setError(err.message || "Erro ao carregar saídas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // --- Filtros e busca ---
  const { items: filteredExpenses, filterErrorMessage } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = expenses;

    if (term) {
      result = result.filter((exp) => {
        const name = exp.name?.toLowerCase() || "";
        const description = exp.description?.toLowerCase() || "";
        const accountName = exp.account_info?.name?.toLowerCase() || "";
        return (
          name.includes(term) ||
          description.includes(term) ||
          accountName.includes(term)
        );
      });
    }

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (start && end && end < start) {
      return {
        items: [],
        filterErrorMessage: "A data final deve ser posterior à data inicial.",
      };
    }

    if (start || end) {
      result = result.filter((exp) => {
        const expDate = new Date(exp.datetime);
        if (Number.isNaN(expDate.getTime())) return false;
        if (start && expDate < start) return false;
        if (end && expDate > end) return false;
        return true;
      });
    }

    return { items: result, filterErrorMessage: null };
  }, [expenses, searchTerm, startDate, endDate]);

  // --- Renderização da tabela ---
  const tableContent = useMemo(() => {
    if (loading)
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">
            Carregando saídas...
          </td>
        </tr>
      );

    if (error)
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-red-600">
            {error}
          </td>
        </tr>
      );

    if (filterErrorMessage)
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-red-600">
            {filterErrorMessage}
          </td>
        </tr>
      );

    if (!expenses.length)
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">
            Nenhuma saída registrada ainda.
          </td>
        </tr>
      );

    if (!filteredExpenses.length)
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">
            Nenhuma saída encontrada para os filtros atuais.
          </td>
        </tr>
      );

    return filteredExpenses.map((exp) => (
      <tr key={exp.id} className="border-b border-gray-200 last:border-0">
        <td className="px-4 py-3 text-sm text-gray-700">{exp.name}</td>
        <td className="px-4 py-3 text-sm text-gray-700">
          {exp.account_info?.name || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-red-600 font-semibold">
          {formatValue(exp.value)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">
          {formatDateTime(exp.datetime)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {exp.description || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedExpense(exp);
                setShowModal(true);
              }}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setTransactionToDelete(exp);
                setShowDeleteModal(true);
              }}
              className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              Excluir
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [expenses, filteredExpenses, error, loading, filterErrorMessage]);

  // --- Render principal ---
  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Saídas</h1>
          <p className="text-sm text-gray-500">
            Visualize, filtre e gerencie suas transações de saída.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, conta ou descrição"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
          <button
            onClick={() => {
              setSelectedExpense(null);
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Adicionar saída
          </button>
        </div>
      </header>

      {actionError && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Conta
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Valor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Descrição
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </table>
      </div>

      {showModal && (
        <AddExpenseModal
          onClose={() => setShowModal(false)}
          onSubmitted={loadExpenses}
          transaction={selectedExpense}
        />
      )}

      {showDeleteModal && transactionToDelete && (
        <DeleteTransactionModal
          transaction={transactionToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setTransactionToDelete(null);
          }}
          onDeleted={loadExpenses}
        />
      )}
    </section>
  );
}
