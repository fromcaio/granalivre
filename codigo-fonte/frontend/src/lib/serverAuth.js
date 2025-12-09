import { cache } from 'react';
import { headers } from 'next/headers'; // Apenas headers é necessário aqui

const SERVER_SIDE_API_URL = process.env.API_URL;

const refreshAccessToken = async (cookieHeader) => {
  const refreshUrl = `${SERVER_SIDE_API_URL}users/refresh/`;
  const refreshResponse = await fetch(refreshUrl, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  });

  if (!refreshResponse.ok) return null;
  const newCookie = refreshResponse.headers.get('set-cookie');
  return newCookie ? `${newCookie}; ${cookieHeader}` : cookieHeader;
};

const fetchWithAuth = async (url, cookieHeader, options = {}) => {
  const attemptFetch = async (cookie) => {
    const response = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Cookie: cookie },
      cache: 'no-store',
    });
    if (response.ok) return response;
    if (response.status === 401) return null;
    // Return the response even if non-OK so callers can fallback instead of throwing.
    return response;
  };

  let response = await attemptFetch(cookieHeader);
  if (response === null) {
    const refreshed = await refreshAccessToken(cookieHeader);
    if (refreshed) {
      response = await attemptFetch(refreshed);
    }
  }
  return response;
};

export const validateSession = cache(async () => {
  console.log('--- Executando validateSession ---');

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const userInfoUrl = `${SERVER_SIDE_API_URL}users/user-info/`;

  try {
    let response = await fetchWithAuth(userInfoUrl, cookieHeader);
    if (response && response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Falha na validação da sessão:', error);
  }

  return null;
});

/**
 * Server-side fetch for dashboard summary.
 * Uses the internal Docker API URL and passes the user's cookies.
 */
export const fetchDashboardSummaryServer = async (cookieHeader) => {
  const dashboardUrl = `${SERVER_SIDE_API_URL}dashboard/summary/`;

  try {
    const response = await fetchWithAuth(dashboardUrl, cookieHeader);
    if (response?.ok) return await response.json();
    if (response === null) console.warn('Dashboard summary fetch unauthorized even after refresh.');
  } catch (error) {
    console.error("Error fetching dashboard summary server-side:", error);
  }

  // Fallback MOCK DATA (if API is unreachable or fails)
  return {
    last30DaysBalance: 2100.00,
    billsToPay: 263.00,
    currentBalance: 1026.00,
    patrimonio: 263000.00,
  };
};

/**
 * Server-side fetch for dashboard chart data.
 * Returns an array of { label, total, spent } points.
 */
export const fetchDashboardChartServer = async (cookieHeader, { days = 30 } = {}) => {
  const params = new URLSearchParams({ days: String(days) });
  const chartUrl = `${SERVER_SIDE_API_URL}dashboard/chart/?${params.toString()}`;

  try {
    const response = await fetchWithAuth(chartUrl, cookieHeader);
    if (response?.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : data.points || [];
    }
  } catch (error) {
    console.error('Error fetching dashboard chart server-side:', error);
  }

  // Fallback mock
  const today = new Date();
  return Array.from({ length: days }, (_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - idx - 1));
    const total = 250000 + idx * 250;
    const spent = 2000 + (idx % 5) * 180;
    return {
      label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      total,
      spent,
    };
  });
};

/**
 * NEW: Fetch Recent Transactions (Server Side)
 */
/**
 * Generic server-side fetch for transactions with optional filters.
 * Mirrors client-side params supported by the Django view.
 */
export const fetchTransactionsServer = async (
  cookieHeader,
  { type, accountId, start, end, limit = 10 } = {}
) => {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (accountId) params.set('account_id', accountId);
  if (start !== undefined && end !== undefined) {
    params.set('start', start);
    params.set('end', end);
  } else if (limit) {
    params.set('limit', limit);
  }

  const url = `${SERVER_SIDE_API_URL}transactions/?${params.toString()}`;

  try {
    const response = await fetchWithAuth(url, cookieHeader);
    if (response?.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    }
  } catch (error) {
    console.error('Error fetching transactions server-side:', error);
  }

  // Fallback mock
  const mockBase = [
    { id: 1, name: 'Supermercado', value: -450.0 },
    { id: 2, name: 'Salário Mensal', value: 5000.0 },
    { id: 3, name: 'Netflix', value: -55.9 },
    { id: 4, name: 'Freela Design', value: 1200.0 },
  ];

  if (type === 'income') return mockBase.filter((t) => t.value > 0);
  if (type === 'expense') return mockBase.filter((t) => t.value < 0);
  return mockBase;
};

/**
 * Server-side fetch for accounts.
 */
export const fetchAccountsServer = async (cookieHeader) => {
  const url = `${SERVER_SIDE_API_URL}accounts/`;
  try {
    const response = await fetchWithAuth(url, cookieHeader);
    if (response?.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.results || [];

      const balances = await Promise.all(
        list.map((acc) =>
          fetchWithAuth(`${SERVER_SIDE_API_URL}accounts/balance/`, cookieHeader, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: acc.id }),
          }).then((res) => (res?.ok ? res.json() : null))
        )
      );

      const balanceMap = new Map(
        balances
          .filter(Boolean)
          .map((b) => [b.account_id, b.current_balance])
      );

      return list.map((account) => ({
        ...account,
        current_balance:
          balanceMap.get(account.id) ?? account.initial_balance ?? 0,
      }));
    }
  } catch (error) {
    console.error('Error fetching accounts server-side:', error);
  }

  // Fallback mock
  return [
    { id: 1, name: 'Conta Corrente', agency: '0001', account_number: '12345-6', initial_balance: 2500 },
    { id: 2, name: 'Poupança', agency: '0001', account_number: '98765-4', initial_balance: 8000 },
  ];
};

/**
 * NEW: Fetch Automations (Server Side)
 */
export const fetchAutomationsServer = async (cookieHeader) => {
  const url = `${SERVER_SIDE_API_URL}automations/`;

  try {
    const response = await fetchWithAuth(url, cookieHeader);
    if (response?.ok) return await response.json();
  } catch (error) {
    console.error("Error fetching automations server-side:", error);
  }

  // Fallback MOCK DATA
  return [
    { id: 1, name: 'Conta de Água', value: -80.00, day: 12, type: 'expense' },
    { id: 2, name: 'Conta de Energia', value: -120.00, day: 15, type: 'expense' },
    { id: 3, name: 'Salário Empresa', value: 4400.00, day: 20, type: 'income' },
  ];
};

/**
 * Fetch Investments (Server Side)
 */
export const fetchInvestmentsServer = async (cookieHeader) => {
  const url = `${SERVER_SIDE_API_URL}investments/`;
  const response = await fetchWithAuth(url, cookieHeader);
  const data = response?.ok ? await response.json() : null;

  if (data) return data;

  // Fallback MOCK DATA
  return [
    {
      id: 1,
      name: "CDB Banco GL",
      type: "fixed_income",
      status: "active",
      profitability_type: "Pós-fixado",
      profitability_rate: "110% CDI",
      due_date: "2028-12-15",
      applied_value: 5000.00,
      current_value: 5300.00,
      profitability_percent: 6.00,
      movements: [
        { date: '2024-01-01', type: 'Aporte', description: 'Aporte Inicial', value: 5000.00, balance: 5000.00 },
        { date: '2024-02-01', type: 'Rendimento', description: 'Rendimento Mensal', value: 300.00, balance: 5300.00 },
      ]
    },
    {
      id: 2,
      name: "Ações PETR4",
      type: "variable_income",
      status: "active",
      applied_value: 8000.00,
      current_value: 8000.00,
      profitability_percent: 0.00,
      movements: [
        { date: '2024-03-10', type: 'Aporte', description: 'Compra 200 ações', value: 8000.00, balance: 8000.00 },
      ]
    }
  ];
};

// ... existing code ...

/**
 * Fetch Assets (Server Side)
 */
/**
 * Fetch Assets (Server Side)
 */
export const fetchAssetsServer = async (cookieHeader) => {
  const url = `${SERVER_SIDE_API_URL}patrimonios/`;
  try {
    const response = await fetchWithAuth(url, cookieHeader);
    if (response?.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.results || data;

      const computeCurrentValue = (item) => {
        // Prefer explicit valor_atual from backend if provided
        if (item.valor_atual !== undefined && item.valor_atual !== null) {
          return Number(item.valor_atual);
        }
        const orig = Number(item.valor_original ?? item.original_value ?? 0);
        const rate = Number(item.variacao_anual_percent ?? item.annual_change_rate ?? 0);
        const acquired = item.data_aquisicao || item.acquisition_date;
        if (!acquired || !rate) return orig;
        const acquiredDate = new Date(acquired);
        const now = new Date();
        const years = Math.max(0, (now - acquiredDate) / (1000 * 60 * 60 * 24 * 365));
        const value = orig * Math.pow(1 + rate / 100, years);
        return Number(Number.isFinite(value) ? value.toFixed(2) : orig);
      };

      return list.map((item) => ({
        id: item.id,
        acquisition_date: item.data_aquisicao || item.acquisition_date,
        name: item.nome || item.name,
        type: item.tipo || item.type || '',
        original_value: Number(item.valor_original ?? item.original_value ?? 0),
        annual_change_rate: Number(item.variacao_anual_percent ?? item.annual_change_rate ?? 0),
        monthly_maintenance: Number(item.manutencao_mensal ?? item.monthly_maintenance ?? 0),
        current_value: computeCurrentValue(item),
        description: item.descricao || item.description || '',
        status: item.status,
      }));
    }
  } catch (error) {
    console.error("Error fetching assets server-side:", error);
  }

  // Fallback MOCK DATA
  return [
    {
      id: 1,
      acquisition_date: '2023-06-10',
      name: 'Onix 2022',
      type: 'Carro',
      original_value: 80000.0,
      annual_change_rate: -5.4,
      monthly_maintenance: 400.0,
      current_value: 71360.0,
      description: 'Carro de uso diário',
      status: 'ativo',
    },
    {
      id: 2,
      acquisition_date: '2020-06-10',
      name: 'Casa de praia',
      type: 'Casa',
      original_value: 1800000.0,
      annual_change_rate: 7.8,
      monthly_maintenance: 1750.0,
      current_value: 2620392.0,
      description: 'Casa de veraneio',
      status: 'ativo',
    },
  ];
};