"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteTransaction, getTransactions } from "@/lib/api";
import AddEntryModal from "@/components/transactions/AddEntryModal";

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
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions({
        type: "income",
        start: 0,
        end: 20,
      });
      setEntries(data || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar entradas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm(
        "Deseja realmente excluir esta entrada?"
      );
      if (!confirmed) {
        return;
      }

      setActionLoadingId(id);
      setActionError(null);
      try {
        await deleteTransaction(id);
        await loadEntries();
      } catch (err) {
        setActionError(err.message || "Erro ao excluir entrada.");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadEntries]
  );

  const { items: filteredEntries, filterErrorMessage } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = entries;

    if (term) {
      result = result.filter((entry) => {
        const name = entry.name?.toLowerCase() || "";
        const description = entry.description?.toLowerCase() || "";
        const accountName = entry.account_info?.name?.toLowerCase() || "";
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
      result = result.filter((entry) => {
        const entryDate = new Date(entry.datetime);
        if (Number.isNaN(entryDate.getTime())) {
          return false;
        }
        if (start && entryDate < start) {
          return false;
        }
        if (end && entryDate > end) {
          return false;
        }
        return true;
      });
    }

    return {
      items: result,
      filterErrorMessage: null,
    };
  }, [entries, searchTerm, startDate, endDate]);

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">
            Carregando entradas...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-red-600">
            {error}
          </td>
        </tr>
      );
    }

    if (filterErrorMessage) {
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-red-600">
            {filterErrorMessage}
          </td>
        </tr>
      );
    }

    if (!entries.length) {
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">
            Nenhuma entrada registrada ainda.
          </td>
        </tr>
      );
    }

    if (!filteredEntries.length) {
      return (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">
            Nenhuma entrada encontrada para os filtros atuais.
          </td>
        </tr>
      );
    }

    return filteredEntries.map((entry) => (
      <tr key={entry.id} className="border-b border-gray-200 last:border-0">
        <td className="px-4 py-3 text-sm text-gray-700">{entry.name}</td>
        <td className="px-4 py-3 text-sm text-gray-700">
          {entry.account_info?.name || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-green-600 font-semibold">
          {formatValue(entry.value)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">
          {formatDateTime(entry.datetime)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {entry.description || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedEntry(entry);
                setShowModal(true);
              }}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => handleDelete(entry.id)}
              className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionLoadingId === entry.id}
            >
              {actionLoadingId === entry.id ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [
    entries,
    filteredEntries,
    error,
    loading,
    actionLoadingId,
    handleDelete,
    filterErrorMessage,
  ]);

  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Entradas</h1>
          <p className="text-sm text-gray-500">
            Visualize, filtre e gerencie suas transações de entrada.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, conta ou descrição"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>
            <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2">
                Início
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-700 shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </label>
              <label className="flex items-center gap-2">
                Fim
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-700 shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </label>
              {(searchTerm || startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedEntry(null);
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
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
          <tbody className="bg-white">{tableContent}</tbody>
        </table>
      </div>

      {showModal && (
        <AddEntryModal
          onClose={() => setShowModal(false)}
          onSubmitted={loadEntries}
          transaction={selectedEntry}
        />
      )}
    </section>
  );
}
