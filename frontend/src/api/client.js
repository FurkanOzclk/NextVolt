import axios from 'axios';
import { Platform } from 'react-native';

// Production API URL - Always use Render backend
const productionBase = 'https://nextvolt.onrender.com';
export const api = axios.create({ baseURL: productionBase, timeout: 8000 });

// Token yönetimi için global değişken
let authToken = null;

// Token setter fonksiyonu
export const setAuthToken = (token) => {
	authToken = token;
	if (token) {
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common['Authorization'];
	}
};

// Token getter fonksiyonu
export const getAuthToken = () => authToken;

// Response interceptor - 401 hatalarını yakala
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token geçersiz, temizle
			setAuthToken(null);
			// AuthContext'e bildir (bu daha sonra eklenecek)
		}
		return Promise.reject(error);
	}
);

export const getStations = () => api.get('/stations').then(r => r.data);
export const getStation = (id) => api.get(`/stations/${id}`).then(r => r.data);

export const signup = (username, password) => api.post('/signup', { username, password }).then(r => r.data);
export const login = (username, password) => api.post('/login', { username, password }).then(r => r.data);

export const getFavorites = (userId) => api.get(`/users/${userId}/favorites`).then(r => r.data);
export const addFavorite = (userId, stationId) => api.post(`/users/${userId}/favorites`, { stationId }).then(r => r.data);
export const removeFavorite = (userId, stationId) => api.delete(`/users/${userId}/favorites/${stationId}`).then(r => r.data);

export const getHistory = (userId) => api.get(`/users/${userId}/history`).then(r => r.data);

export const recommend = (params) => api.get('/recommend', { params }).then(r => r.data);

// Reservations
export const getReservations = (userId) => api.get(`/users/${userId}/reservations`).then(r => r.data);
export const createReservation = (userId, stationId, minutes = 30) => api.post(`/users/${userId}/reservations`, { stationId, minutes }).then(r => r.data);
export const cancelReservation = (userId, resId) => api.delete(`/users/${userId}/reservations/${resId}`).then(r => r.data); 

// Vehicle related APIs
export const getVehicles = async () => {
	const response = await api.get('/vehicles');
	return response.data;
};

export const getReachableStations = async (vehicleId, currentCharge, userLocation) => {
	const response = await api.post('/reachable-stations', {
		vehicleId,
		currentCharge,
		userLocation
	});
	return response.data;
}; 