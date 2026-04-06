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
        // AI responses can take longer than regular CRUD calls, so use a larger timeout here.
        const response = await axiosInstance.post(`/consultation/chat/${consultationId}`, { message }, { timeout: 60000 });
        return {
            success: true,
            data: response.data.data,
            response: response.data.response,
            message: response.data.message,
        };
    } catch (error) {
        if (error.code === "ECONNABORTED") {
            return {
                success: false,
                message: "AI doctor response timed out. Please try again.",
            };
        }
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

// Fetch details for a specific consultation
export const getConsultationDetail = async (consultationId) => {
    try {
        const response = await axiosInstance.get(`/consultation/${consultationId}`);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch consultation detail',
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

// Delete one consultation and its related message history for the current user.
export const deleteConsultation = async (consultationId) => {
    try {
        const response = await axiosInstance.delete(`/consultation/${consultationId}`);
        return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete consultation',
        };
    }
};