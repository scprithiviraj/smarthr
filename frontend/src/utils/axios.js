import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const token = user.token || user.accessToken;
            console.log("Axios Interceptor: User found.", user.username); // Log username for privacy
            if (token) {
                console.log("Axios Interceptor: Attaching token:", token.substring(0, 10) + "...");
                config.headers['Authorization'] = 'Bearer ' + token;
            } else {
                console.warn("Axios Interceptor: User found but no token!", user);
            }
        } else {
            console.warn("Axios Interceptor: No user found in localStorage.");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Axios Interceptor: 401 Unauthorized. Logging out.");
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
