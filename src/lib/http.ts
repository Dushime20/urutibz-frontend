import axios from 'axios';
import { clearAuthAndRedirect } from './utils';

// Attach token on every request
axios.interceptors.request.use(
	(config) => {
		try {
			const token =
				localStorage.getItem('access_token') ||
				localStorage.getItem('authToken') ||
				localStorage.getItem('token');
			if (token) {
				config.headers = config.headers ?? {};
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch {}
		return config;
	},
	(error) => Promise.reject(error)
);

// Redirect to login on 401 globally
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error?.response?.status === 401) {
			clearAuthAndRedirect();
		}
		return Promise.reject(error);
	}
);

export default axios;


