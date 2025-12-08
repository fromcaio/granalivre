import axiosInstance from "./axiosInstance";

const API_URL = "users/";
// Ao chamar o axiosInstance, ele já usará a variável de ambiente NEXT_PUBLIC_API_URL

export const clearAuthCookies = () => {
    if (typeof document === 'undefined') return;
    console.log("Attempting to clear client-side cookies...");
    const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Max-Age=0;';
    // This will clear the access token if it's not HttpOnly.
    document.cookie = `access_token=; ${expire}`;
    // This will likely FAIL for the refresh token if it is HttpOnly.
    document.cookie = `refresh_token=; ${expire}`;
};

const formatRegistrationError = (errorData) => {
    if (!errorData) return "Ocorreu um erro desconhecido.";
    let messages = [];
    for (const key in errorData) {
        if (Array.isArray(errorData[key])) {
            messages.push(`${key}: ${errorData[key].join(' ')}`);
        }
    }
    return messages.length > 0 ? `Erro de validação:\n- ${messages.join('\n- ')}` : "Não foi possível processar o cadastro.";
};

export const registerUser = async (email, username, password) => {
    try {
        clearAuthCookies();
        const response = await axiosInstance.post(`${API_URL}register/`, { email, username, password });
        return response.data;
    } catch (e) {
        if (e.response?.data) throw new Error(formatRegistrationError(e.response.data));
        throw new Error("Falha na conexão com o servidor de registro.");
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axiosInstance.post(`${API_URL}login/`, { email, password });
        return response.data;
    } catch (e) {
        if (e.response?.status === 401) throw new Error("Credenciais inválidas. Verifique seu email e senha.");
        throw new Error("Não foi possível fazer login. Tente novamente.");
    }
};

/**
 * REFACTOR: Sends a request to the server to invalidate the session.
 *
 * The backend must be configured to do two things upon receiving this request:
 * 1. Blacklist the refresh token to prevent it from being used again.
 * 2. Respond with a `Set-Cookie` header to clear the `HttpOnly` refresh token cookie from the browser.
 */
export const logoutUser = async () => {
    try {
        await axiosInstance.post(`${API_URL}logout/`);
    } catch (e) {
        // This warning is important. Even if the server call fails, the front-end
        // will proceed with its cleanup, but the session might not be truly invalidated
        // if the HttpOnly cookie persists.
        console.warn("Server-side logout failed, but client-side cleanup will proceed.", e);
    }
};

export const getUserInfo = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}user-info/`, {
            _initialAuthCheck: true 
        });
        return response.data;
    } catch (e) {
        throw new Error("Sua sessão pode ter expirado. Falha ao buscar dados do usuário.");
    }
};

// --- NEW UTILITY FUNCTIONS ---

/**
 * NEW: Updates user information (username, email, password).
 * This function centralizes the API call for editing user details.
 * @param {object} formData - The user data from the form.
 */
export const updateUserInfo = async (formData) => {
    const payload = {
        username: formData.username,
        email: formData.email,
        current_password: formData.currentPassword,
    };
    // Only include the new_password if the user is actually changing it.
    if (formData.newPassword) {
        payload.new_password = formData.newPassword;
        payload.password_confirmation = formData.confirmNewPassword;
    }

    try {
        await axiosInstance.patch(`${API_URL}user-info/`, payload);
    } catch (e) {
        // Provide a more specific error message from the backend if available.
        if (e.response?.data?.current_password) {
            throw new Error('A senha atual está incorreta.');
        }
        if (e.response?.data) {
             // Generic fallback for other validation errors (e.g., email already exists)
             const messages = Object.values(e.response.data).flat().join(' ');
             throw new Error(messages);
        }
        throw new Error('Erro ao salvar as alterações.');
    }
};

/**
 * NEW: Deletes the authenticated user's account.
 * This function centralizes the API call for account deletion.
 * @param {string} currentPassword - The user's current password for confirmation.
 */
export const deleteUserAccount = async (currentPassword) => {
    try {
        // The password must be sent in the `data` property for a DELETE request with axios.
        await axiosInstance.delete(`${API_URL}user-info/`, {
            data: { current_password: currentPassword },
        });
    } catch (e) {
        if (e.response?.status === 403 || e.response?.status === 400) {
            throw new Error('A senha informada está incorreta.');
        }
        throw new Error('Não foi possível excluir a conta. Tente novamente.');
    }
};

export const getTransactions = async (filters = {}) => {
    try {
        const response = await axiosInstance.get('transactions/', {
            params: filters,
        });
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível buscar as transações.");
    }
};


export const createTransaction = async (payload) => {
    try {
        const response = await axiosInstance.post('transactions/', payload);
        return response.data;
    } catch (e) {
        if (e.response?.data) {
            const messages = Object.values(e.response.data)
                .flat()
                .join(' ');
            throw new Error(messages || "Não foi possível criar a transação.");
        }
        throw new Error("Não foi possível criar a transação.");
    }
};

export const updateTransaction = async (payload) => {
    try {
        const response = await axiosInstance.patch('transactions/', payload);
        return response.data;
    } catch (e) {
        if (e.response?.data) {
            const messages = Object.values(e.response.data)
                .flat()
                .join(' ');
            throw new Error(messages || "Não foi possível atualizar a transação.");
        }
        throw new Error("Não foi possível atualizar a transação.");
    }
};

export const deleteTransaction = async (id) => {
    try {
        await axiosInstance.delete('transactions/', {
            data: { id },
        });
    } catch (e) {
        throw new Error("Não foi possível excluir a transação.");
    }
};

// --- Funções de Contas (Accounts) ---

export const getAccounts = async () => {
    try {
        const response = await axiosInstance.get('accounts/');
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível buscar as contas.");
    }
};

/**
 * Cria uma nova conta.
 * @param {object} accountData - { name, agency, account_number, initial_balance }
 */
export const createAccount = async (accountData) => {
    try {
        const response = await axiosInstance.post('accounts/', accountData);
        return response.data;
    } catch (e) {
        const errorMsg = e.response?.data ? Object.values(e.response.data).flat().join(' ') : "Não foi possível criar a conta.";
        throw new Error(errorMsg);
    }
};

/**
 * Atualiza uma conta existente.
 * O backend exige PUT, então todos os campos são necessários.
 * @param {object} accountData - { id, name, agency, account_number, initial_balance }
 */
export const updateAccount = async (accountData) => {
    try {
        const response = await axiosInstance.put('accounts/', accountData);
        return response.data;
    } catch (e) {
        const errorMsg = e.response?.data ? Object.values(e.response.data).flat().join(' ') : "Não foi possível atualizar a conta.";
        throw new Error(errorMsg);
    }
};

/**
 * Deleta uma conta.
 * @param {number} id - O ID da conta a ser deletada.
 */
export const deleteAccount = async (id) => {
    try {
        await axiosInstance.delete('accounts/', {
            data: { id },
        });
    } catch (e) {
        throw new Error("Não foi possível excluir a conta.");
    }
};

/**
 * ***NOVA FUNÇÃO***
 * Busca o saldo detalhado de UMA conta.
 * @param {number} id - O ID da conta.
 * @returns {object} - { account_id, account_name, initial_balance, transactions_total, current_balance }
 */
export const getAccountBalance = async (id) => {
    try {
        // Conforme a view do Django, é um POST para /accounts/balance/
        // com o 'id' no corpo (data)
        const response = await axiosInstance.post('accounts/balance/', { id });
        return response.data;
    } catch (e) {
        if (e.response?.status === 404) {
            throw new Error(`Saldo não encontrado (Conta ID: ${id}).`);
        }
        throw new Error(`Não foi possível buscar o saldo da conta ${id}.`);
    }
};

/**
 * Client-side fetch for dashboard summary.
 * TODO: Replace mock data with real API call: axiosInstance.get('dashboard/summary/')
 */
export const getDashboardSummary = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // MOCK DATA (Placeholder)
    return {
        last30DaysBalance: 2500.00, // Slightly different to show change on refresh
        billsToPay: 300.50,
        currentBalance: 1150.00,
        patrimonio: 265000.00,
    };
};

/**
 * Client-side fetch for dashboard chart data.
 * TODO: Replace mock with real API call: axiosInstance.get('dashboard/chart/', { params: { days } })
 */
export const getDashboardChart = async (days = 30) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const today = new Date();
    return Array.from({ length: days }, (_, idx) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - idx - 1));
        return {
            label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
            total: 252000 + idx * 150,
            spent: 1800 + (idx % 6) * 160,
        };
    });
};

export const getAutomations = async () => {
    try {
        const response = await axiosInstance.get('automations/');
        return response.data;
    } catch (e) {
        // MOCK fallback for dev without backend
        console.warn("API automations/ failed, returning mock.");
        return [
            { id: 1, name: 'Conta de Água', value: -80.00, day: 12, type: 'expense' },
            { id: 2, name: 'Conta de Energia', value: -120.00, day: 15, type: 'expense' },
            { id: 3, name: 'Salário Empresa', value: 4400.00, day: 20, type: 'income' },
        ];
    }
};

export const createAutomation = async (data) => {
    try {
        const response = await axiosInstance.post('automations/', data);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível criar a automação.");
    }
};

export const updateAutomation = async (data) => {
    try {
        const { id, ...payload } = data;
        const response = await axiosInstance.patch(`automations/`, { ...payload, id });
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível atualizar a automação.");
    }
};

export const deleteAutomation = async (id) => {
    try {
        await axiosInstance.delete(`automations/`, { data: { id } });
    } catch (e) {
        throw new Error("Não foi possível excluir a automação.");
    }
};

export const processAutomations = async () => {
    try {
        const response = await axiosInstance.post('automations/process/');
        return response.data;
    } catch (e) {
        console.error("Erro ao processar automações:", e);
        // Don't throw error - this is non-critical background processing
        return { status: "error", message: e.message };
    }
};

// ... (Existing imports and functions) ...

// --- INVESTMENTS ---

export const getInvestments = async () => {
    try {
        const response = await axiosInstance.get('investments/');
        return response.data;
    } catch (e) {
        // Fallback for dev
        return [];
    }
};

export const createInvestment = async (data) => {
    try {
        const response = await axiosInstance.post('investments/', data);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível criar o investimento.");
    }
};

export const updateInvestment = async (data) => {
    try {
        const response = await axiosInstance.put(`investments/${data.id}/`, data);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível atualizar o investimento.");
    }
};

export const deleteInvestment = async (id) => {
    try {
        await axiosInstance.delete(`investments/${id}/`);
    } catch (e) {
        throw new Error("Não foi possível excluir o investimento.");
    }
};

// --- INVESTMENT MOVEMENTS ---

export const createInvestmentMovement = async (investmentId, data) => {
    try {
        // Assuming nested route or sending investment_id in body
        const response = await axiosInstance.post(`investments/${investmentId}/movements/`, data);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível registrar a movimentação.");
    }
};

export const liquidateInvestment = async (investmentId, data) => {
    try {
        const response = await axiosInstance.post(`investments/${investmentId}/liquidate/`, data);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível liquidar o investimento.");
    }
};

// --- ASSETS (PATRIMÔNIO) ---

export const getAssets = async (filters = {}) => {
    try {
        const response = await axiosInstance.get('patrimonios/', { params: filters });
        const data = response.data;
        const list = Array.isArray(data) ? data : data.results || data;
        return list.map((item) => ({
            id: item.id,
            acquisition_date: item.data_aquisicao || item.acquisition_date,
            name: item.nome || item.name,
            type: item.tipo || item.type || '',
            original_value: Number(item.valor_original ?? item.original_value ?? 0),
            annual_change_rate: Number(item.variacao_anual_percent ?? item.annual_change_rate ?? 0),
            monthly_maintenance: Number(item.manutencao_mensal ?? item.monthly_maintenance ?? 0),
            current_value: Number(item.valor_atual ?? item.current_value ?? item.valor_original ?? 0),
            description: item.descricao || item.description || '',
            status: item.status,
        }));
    } catch (e) {
        return [];
    }
};

export const createAsset = async (data) => {
    try {
        const payload = {
            nome: data.name,
            data_aquisicao: data.acquisition_date,
            tipo: data.type,
            valor_original: data.original_value,
            variacao_anual_percent: data.annual_change_rate,
            manutencao_mensal: data.monthly_maintenance,
            valor_atual: data.current_value ?? data.valor_atual,
            descricao: data.description,
        };
        const response = await axiosInstance.post('patrimonios/', payload);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível adicionar o patrimônio.");
    }
};

export const updateAsset = async (data) => {
    try {
        const payload = {
            id: data.id,
            nome: data.name,
            data_aquisicao: data.acquisition_date,
            tipo: data.type,
            valor_original: data.original_value,
            variacao_anual_percent: data.annual_change_rate,
            manutencao_mensal: data.monthly_maintenance,
            valor_atual: data.current_value ?? data.valor_atual,
            descricao: data.description,
        };
        const response = await axiosInstance.patch('patrimonios/', payload);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível atualizar o patrimônio.");
    }
};

export const deleteAsset = async (id) => {
    try {
        await axiosInstance.delete('patrimonios/', { data: { id } });
    } catch (e) {
        throw new Error("Não foi possível excluir o patrimônio.");
    }
};

export const liquidateAsset = async (id, data) => {
    try {
        // backend expects { patrimonio_id, conta_id }
        const payload = {
            patrimonio_id: id,
            conta_id: data.destination_account_id || data.destination_account || data.conta_id,
            valor_venda: data.sale_value ?? data.valor_venda ?? data.saleValue,
        };
        const response = await axiosInstance.post('patrimonios/liquidar/', payload);
        return response.data;
    } catch (e) {
        throw new Error("Não foi possível liquidar o patrimônio.");
    }
};

export const getAssetPosition = async (id) => {
    try {
        const response = await axiosInstance.post('patrimonios/position/', { id });
        return response.data?.index ?? null;
    } catch (e) {
        console.error('Failed to fetch asset position', e);
        return null;
    }
};