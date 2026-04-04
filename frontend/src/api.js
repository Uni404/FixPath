import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

// Report
export const createReport = (formData) =>
    api.post('/report', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

// Diagnose
export const diagnoseReport = (reportId) =>
    api.post(`/diagnose/${reportId}`);

// Consultation
export const createConsultation = (data) =>
    api.post('/consultation', data);

export const getAllConsultations = () =>
    api.get('/consultation');

export const getConsultationById = (consultationId) =>
    api.get(`/consultation/${consultationId}`);

export const updateConsultationStatus = (consultationId, status) =>
    api.patch(`/consultation/${consultationId}/status`, { status });

// Replacement
export const getReplacementOptions = (resultId) =>
    api.get(`/replacement/${resultId}`);

// Device / category
export const getDeviceCategories = () =>
    api.get('/devices/categories');

export const getDevicesByCategory = (categoryId) =>
    api.get(`/devices/category/${categoryId}`);

// Symptom suggestion
export const suggestSymptoms = (data) =>
    api.post('/symptoms/suggest', data);

// Login
export const userLogin = (data) =>
    api.post('/auth/user-login', data);

export const expertLogin = (data) =>
    api.post('/auth/expert-login', data);

export const getExpertConsultations = (expertId) =>
    api.get(`/consultation/expert/${expertId}`);

export const getExpertProfileById = (expertId) =>
    api.get(`/expert/${expertId}/profile`);

export const updateExpertProfile = (expertId, data) =>
    api.patch(`/expert/${expertId}/profile`, data);

export const getUserProfileById = (userId) =>
    api.get(`/user/${userId}/profile`);

export const updateUserProfile = (userId, data) =>
    api.patch(`/user/${userId}/profile`, data);

export const getUserReports = (userId) =>
    api.get(`/user/${userId}/reports`);

export const getUserResults = (userId) =>
    api.get(`/user/${userId}/results`);

export const getUserConsultations = (userId) =>
    api.get(`/user/${userId}/consultations`);

export const createFeedback = (data) =>
    api.post('/feedback', data);

export const getUserReportDetail = (reportId) =>
    api.get(`/user/report/${reportId}/detail`);

export default api;