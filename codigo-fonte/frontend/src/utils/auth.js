import axiosInstance from './axiosInstance';

const API_URL = "/users/";

export const registerUser = async (email, username, password) => {
    try {
        const response = await axiosInstance.post(`${API_URL}register/`, {email, username, password})
        return response.data
    }
    catch (e) {
        throw new Error("Registration failed");
    }
}

export const loginUser = async (email, password) => {
    try {
        const response = await axiosInstance.post(`${API_URL}login/`, {email, password})
        return response.data
    }
    catch (e) {
        throw new Error("Login failed");
    }
}

export const logoutUser = async () => {
    try {
        const response = await axiosInstance.post(`${API_URL}logout/`)
        return response.data
    }
    catch (e) {
        throw new Error("Logout failed");
    }
}

export const getUserInfo = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}user-info/`)
        return response.data
    }
    catch (e) {
        throw new Error("Fetching user info failed");
    }
}

export const refreshToken = async () => {
    try {
        const response = await axiosInstance.post(`${API_URL}refresh/`)
        return response.data
    }
    catch (e) {
        throw new Error("Token refresh failed");
    }
}