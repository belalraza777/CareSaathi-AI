import axiosInstance from './axios';

export const register = async (credentials) => {
    try {
        const response = await axiosInstance.post('/auth/register', credentials);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Registration failed' 
        };
    }
};

export const login = async (credentials) => {
    try {
        const response = await axiosInstance.post('/auth/login', credentials);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
        };
    }
};

export const logout = async () => {
    try {
        const response = await axiosInstance.get('/auth/logout');
        return { success: true, message: response.data.message };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Logout failed' 
        };
    }
};

export const checkAuth = async () => {
    try {
        const response = await axiosInstance.get('/auth/check');
        return { success: true, data: response.data.data, authenticated: response.data.authenticated };
    } catch {
        return { success: false, authenticated: false };
    }
};

export const resetPassword = async (passwordData) => {
    try {
        const response = await axiosInstance.patch('/auth/reset', passwordData);
        return { success: true, message: response.data.message };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Password reset failed' 
        };
    }
};