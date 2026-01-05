import api from '../../utils/axios';

const API_URL = 'http://localhost:8080/api/dashboard/';

// Get user data
const getUserStats = async () => {
    // The token is handled by the axios interceptor in utils/axios.js
    const response = await api.get('/dashboard/stats');
    return response.data;
};

// Get recent activity
const getRecentActivity = async () => {
    const response = await api.get('/attendance/recent');
    return response.data;
};

const dashboardService = {
    getUserStats,
    getRecentActivity,
};

export default dashboardService;
