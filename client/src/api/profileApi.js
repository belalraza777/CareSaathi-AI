import axiosInstance from './axios';

// Mirrors backend profile endpoints with consistent success/error response objects.
export const getProfile = async () => {
    try {
        const response = await axiosInstance.get('/profile');
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch profile',
        };
    }
};

export const createProfile = async (profileData) => {
    try {
        const response = await axiosInstance.post('/profile', profileData);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create profile',
        };
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await axiosInstance.patch('/profile', profileData);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update profile',
        };
    }
};