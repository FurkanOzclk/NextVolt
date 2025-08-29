import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormTextInput from '../components/FormTextInput';

export default function AuthScreen({ navigation }) {
	const { signIn, signUp, loading, error } = useAuth();
	const [mode, setMode] = useState('login');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const insets = useSafeAreaInsets();

	const onSubmit = async () => {
		const ok = mode === 'login' ? await signIn(username, password) : await signUp(username, password);
		// Rely on auth state to switch navigator; no explicit navigation here to avoid REPLACE errors
		if (!ok) return;
	};

	const usernameError = username.length > 0 && username.length < 3;
	const passwordError = password.length > 0 && password.length < 4;

	const handleSignIn = async () => {
		try {
			console.log('=== FRONTEND SIGN IN ===');
			console.log('Attempting sign in with:', { username, password });

			const response = await signIn(username, password);
			console.log('Sign in response:', response);

			// ... existing code ...
		} catch (error) {
			console.error('=== FRONTEND SIGN IN ERROR ===');
			console.error('Error:', error);
			console.error('Error message:', error.message);
			console.error('Error response:', error.response?.data);

			// ... existing error handling ...
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
			<LinearGradient colors={['#7c3aed','#22c55e']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ paddingTop: Math.max(18, insets.top + 6), padding: 16 }}>
				<Text variant="headlineSmall" style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>NextVolt</Text>
				<Text style={{ color: 'white', opacity: 0.9, textAlign: 'center', marginTop: 4, fontSize: 12 }}>Hesabınla giriş yap veya kayıt ol</Text>
			</LinearGradient>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
				<View style={{ flex: 1, padding: 16, gap: 8, justifyContent: 'center' }}>
					<FormTextInput label="Kullanıcı adı" value={username} onChangeText={setUsername} icon="account" error={usernameError} helperText={usernameError ? 'En az 3 karakter olmalı' : ''} autoCapitalize="none" />
					<FormTextInput label="Şifre" value={password} onChangeText={setPassword} secure icon="lock" error={passwordError} helperText={passwordError ? 'En az 4 karakter olmalı' : ''} />
					{error ? <HelperText type="error">{error}</HelperText> : null}
					<Button mode="contained" onPress={onSubmit} loading={loading} disabled={!username || !password || usernameError || passwordError}>
						{mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
					</Button>
					<Button onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
						{mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
					</Button>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
} 