import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')  // Development
  : 'https://nextvolt.onrender.com'; // Production

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 8000 });

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