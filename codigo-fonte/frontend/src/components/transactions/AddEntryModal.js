"use client";

import { useEffect, useMemo, useState } from "react";
import { createTransaction, getAccounts, updateTransaction } from "@/lib/api";
import { formStyles } from "@/config/styles";

const getInitialState = (transaction) => ({
  name: transaction?.name || "",
  value: transaction ? Math.abs(Number(transaction.value || 0)).toString() : "",
  account:
    transaction?.account ||
    transaction?.account_info?.id ||
    "",
  description: transaction?.description || "",
  category: transaction?.category || "",
  payment_method: transaction?.payment_method || "",
  datetime: transaction?.datetime
    ? new Date(transaction.datetime).toISOString().slice(0, 16)
    : "",
});

export default function AddEntryModal({ onClose, onSubmitted, transaction }) {
  const [formData, setFormData] = useState(getInitialState(transaction));
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = Boolean(transaction);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data || []);
      } catch (err) {
        setError(err.message || "Erro ao carregar contas.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  useEffect(() => {
    setFormData(getInitialState(transaction));
  }, [transaction]);

  const isSubmitDisabled = useMemo(() => {
    if (loadingAccounts || submitting) {
      return true;
    }
    return !formData.name.trim() || !formData.value || !formData.account;
  }, [formData.account, formData.name, formData.value, loadingAccounts, submitting]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const normalizedValue = String(formData.value).replace(",", ".");
    const numericValue = Number(normalizedValue);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    const datetimeValue = formData.datetime ? new Date(formData.datetime) : null;
    if (datetimeValue && Number.isNaN(datetimeValue.getTime())) {
      setError("Informe uma data e hora válidas.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: transaction?.id,
        name: formData.name.trim(),
        value: numericValue.toFixed(2),
        description: formData.description || "",
        account: Number(formData.account),
        category: formData.category || "",
        payment_method: formData.payment_method || "",
        datetime: datetimeValue ? datetimeValue.toISOString() : undefined,
      };

      if (isEdit) {
        await updateTransaction(payload);
      } else {
        await createTransaction(payload);
      }

      setFormData(getInitialState(null));
      onSubmitted?.();
      onClose();
    } catch (err) {
      setError(err.message || "Erro ao salvar entrada.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {isEdit ? "Editar entrada" : "Adicionar entrada"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Atualize os dados da transação selecionada."
                : "Cadastre uma nova transação de entrada."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:text-gray-600"
            aria-label="Fechar modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.25 6.25L13.75 13.75M6.25 13.75L13.75 6.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={formStyles.input}
              placeholder="Ex.: Salário"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="value">
                Valor
              </label>
              <input
                id="value"
                name="value"
                type="number"
                min="0"
                step="0.01"
                className={formStyles.input}
                placeholder="0,00"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="account">
                Conta
              </label>
              <select
                id="account"
                name="account"
                className={formStyles.input}
                value={formData.account}
                onChange={handleChange}
                disabled={loadingAccounts}
                required
              >
                <option value="">Selecione uma conta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="category">
                Categoria
              </label>
              <input
                id="category"
                name="category"
                type="text"
                className={formStyles.input}
                placeholder="Opcional"
                value={formData.category}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="payment_method">
                Método de pagamento
              </label>
              <input
                id="payment_method"
                name="payment_method"
                type="text"
                className={formStyles.input}
                placeholder="Opcional"
                value={formData.payment_method}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="datetime">
              Data e hora
            </label>
            <input
              id="datetime"
              name="datetime"
              type="datetime-local"
              className={formStyles.input}
              value={formData.datetime}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="description">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={formStyles.input}
              placeholder="Opcional"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${formStyles.baseButton} ${formStyles.secondaryCancelButton}`}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${formStyles.baseButton} ${formStyles.loginButton}`}
              disabled={isSubmitDisabled}
            >
              {submitting
                ? "Salvando..."
                : isEdit
                ? "Salvar alterações"
                : "Salvar entrada"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
