import api from '../../utils/axios';

const API_URL = 'http://localhost:8080/api/dashboard/';

// Get user data
const getUserStats = async () => {
    // The token is handled by the axios interceptor in utils/axios.js
    const response = await api.get('/dashboard/stats');
    return response.data;
};

const dashboardService = {
    getUserStats,
};

export default dashboardService;
