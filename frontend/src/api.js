import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000'
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

export default api;