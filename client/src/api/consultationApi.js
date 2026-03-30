import axiosInstance from './axios';

// Keeps consultation request helpers consistent with auth/profile API response shape.
export const createConsultation = async (consultationData) => {
    try {
        const response = await axiosInstance.post('/consultation/new', consultationData);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create consultation',
        };
    }
};

export const chatWithConsultation = async (consultationId, message) => {
    try {
        const response = await axiosInstance.post(`/consultation/chat/${consultationId}`, { message });
        return {
            success: true,
            data: response.data.data,
            response: response.data.response,
            message: response.data.message,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send consultation message',
        };
    }
};

// Fetch all consultations for the authenticated user
export const getConsultations = async () => {
    try {
        const response = await axiosInstance.get('/consultation/');
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch consultations',
        };
    }
};

// Fetch all messages for a specific consultation
export const getConsultationMessages = async (consultationId) => {
    try {
        const response = await axiosInstance.get(`/consultation/${consultationId}/messages`);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch consultation messages',
        };
    }
};