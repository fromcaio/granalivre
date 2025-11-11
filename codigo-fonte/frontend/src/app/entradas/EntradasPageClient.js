"use client";

import DeleteTransactionModal from "@/components/transactions_/DeleteTransactionModal";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTransactions } from "@/lib/api";
import AddIncomeModal from "@/components/transactions_/AddIncomeModal";

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

export default function EntradasPageClient() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      const onlyIncome = (data || []).filter((t) => {
        if (typeof t.value === "number") return t.value > 0;
        const num = Number(t.value);
        if (!Number.isNaN(num)) return num > 0;
        return t.type === "income";
      });
      setEntries(onlyIncome);
    } catch (err) {
      setError(err.message || "Erro ao carregar entradas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Filtros e busca
  const { items: filteredEntries, filterErrorMessage } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = entries;

    if (term) {
      result = result.filter((e) => {
        const name = e.name?.toLowerCase() || "";
        const description = e.description?.toLowerCase() || "";
        const accountName = e.account_info?.name?.toLowerCase() || "";
        const category = e.category?.toLowerCase() || "";
        const paymentMethod = e.payment_method?.toLowerCase() || "";
        return (
          name.includes(term) ||
          description.includes(term) ||
          accountName.includes(term) ||
          category.includes(term) ||
          paymentMethod.includes(term)
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
      result = result.filter((e) => {
        const dt = new Date(e.datetime);
        if (Number.isNaN(dt.getTime())) return false;
        if (start && dt < start) return false;
        if (end && dt > end) return false;
        return true;
      });
    }

    return { items: result, filterErrorMessage: null };
  }, [entries, searchTerm, startDate, endDate]);

  const tableContent = useMemo(() => {
    if (loading)
      return (
        <tr>
          <td colSpan={8} className="py-6 text-center text-gray-500">
            Carregando entradas...
          </td>
        </tr>
      );

    if (error)
      return (
        <tr>
          <td colSpan={8} className="py-6 text-center text-red-600">
            {error}
          </td>
        </tr>
      );

    if (filterErrorMessage)
      return (
        <tr>
          <td colSpan={8} className="py-6 text-center text-red-600">
            {filterErrorMessage}
          </td>
        </tr>
      );

    if (!entries.length)
      return (
        <tr>
          <td colSpan={8} className="py-6 text-center text-gray-500">
            Nenhuma entrada registrada ainda.
          </td>
        </tr>
      );

    if (!filteredEntries.length)
      return (
        <tr>
          <td colSpan={8} className="py-6 text-center text-gray-500">
            Nenhuma entrada encontrada para os filtros atuais.
          </td>
        </tr>
      );

    return filteredEntries.map((e) => (
      <tr key={e.id} className="border-b border-gray-200 last:border-0">
        <td className="px-6 py-3 text-sm text-gray-700">{e.name}</td>
        <td className="px-6 py-3 text-sm text-gray-700">{e.account_info?.name || "—"}</td>
        <td className="px-6 py-3 text-sm text-gray-700">{e.category || "—"}</td>
        <td className="px-6 py-3 text-sm text-gray-700">{e.payment_method || "—"}</td>
        <td className="px-6 py-3 text-sm text-green-600 font-semibold">{formatValue(e.value)}</td>
        <td className="px-6 py-3 text-sm text-gray-700">{formatDateTime(e.datetime)}</td>
        <td className="px-6 py-3 text-sm text-gray-500">{e.description || "—"}</td>
        <td className="px-6 py-3 text-sm text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedEntry(e);
                setShowModal(true);
              }}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setTransactionToDelete(e);
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
  }, [entries, filteredEntries, error, loading, filterErrorMessage]);

  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200 w-full max-w-[1800px] mx-auto">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Entradas</h1>
          <p className="text-sm text-gray-500">Visualize, filtre e gerencie suas transações de entrada.</p>
        </div>

        <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:items-center sm:gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, conta, categoria ou método"
            className="flex-1 min-w-[150px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          <button
            onClick={() => {
              setSelectedEntry(null);
              setShowModal(true);
            }}
            className="flex-shrink-0 min-w-[160px] inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Adicionar entrada
          </button>
        </div>
      </header>

      {actionError && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="overflow-x-auto rounded-b-xl">
        <table className="w-full divide-y divide-gray-200 min-w-[1000px] overflow-hidden rounded-b-xl">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Conta</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Método</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Descrição</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </table>
      </div>

      {showModal && (
        <AddIncomeModal
          onClose={() => setShowModal(false)}
          onSubmitted={loadEntries}
          transaction={selectedEntry}
        />
      )}

      {showDeleteModal && transactionToDelete && (
        <DeleteTransactionModal
          transaction={transactionToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setTransactionToDelete(null);
          }}
          onDeleted={loadEntries}
          title="Excluir Entrada"
        />
      )}
    </section>
  );
}
