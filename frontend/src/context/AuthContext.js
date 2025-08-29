import React, { createContext, useContext, useMemo, useState } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const signIn = async (username, password) => {
		setLoading(true); setError(null);
		try {
			const data = await api.login(username, password);
			setUser(data.user);
			setToken(data.token);
			return true;
		} catch (e) {
			setError(e.response?.data?.message || 'Giriş başarısız');
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signUp = async (username, password) => {
		setLoading(true); setError(null);
		try {
			const data = await api.signup(username, password);
			setUser(data.user);
			setToken(data.token);
			return true;
		} catch (e) {
			setError(e.response?.data?.message || 'Kayıt başarısız');
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signOut = () => {
		setUser(null); setToken(null);
	};

	const value = useMemo(() => ({ user, token, loading, error, signIn, signUp, signOut }), [user, token, loading, error]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
} 