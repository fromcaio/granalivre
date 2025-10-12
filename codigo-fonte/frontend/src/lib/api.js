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