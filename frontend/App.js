import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, ActivityIndicator, Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import StationDetailScreen from './src/screens/StationDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AuthScreen from './src/screens/AuthScreen';
import SmartRecommendScreen from './src/screens/SmartRecommendScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#7c3aed',
		background: '#f8fafc',
	},
};

const paperTheme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme.colors,
		primary: '#7c3aed', // purple
		secondary: '#22c55e', // green
		tertiary: '#f59e0b', // amber
		error: '#ef4444',
	},
};

function Tabs() {
	console.log('📱 Tabs component render');
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size }) => {
					let iconName = 'dots-horizontal';
					if (route.name === 'Anasayfa') iconName = 'map-search';
					else if (route.name === 'Favoriler') iconName = 'heart';
					else if (route.name === 'Rezervasyonlar') iconName = 'calendar-clock';
					return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
				},
				headerShown: false,
				tabBarActiveTintColor: '#7c3aed',
				tabBarInactiveTintColor: '#94a3b8',
			})}
		>
			<Tab.Screen name="Anasayfa" component={HomeScreen} />
			<Tab.Screen name="Favoriler" component={FavoritesScreen} />
			<Tab.Screen name="Rezervasyonlar" component={ReservationsScreen} />
		</Tab.Navigator>
	);
}

function AppContent() {
	const { user, loading } = useAuth();
	
	// Loading durumunda loading göster
	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
				<ActivityIndicator size="large" color="#7c3aed" />
				<Text style={{ marginTop: 10, color: '#64748b' }}>Yükleniyor...</Text>
			</View>
		);
	}
	
	return (
		<NavigationContainer theme={navTheme}>
			<StatusBar style="dark" />
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{!user ? (
					<Stack.Screen name="Auth" component={AuthScreen} />
				) : (
					<>
						<Stack.Screen name="MainTabs" component={Tabs} />
						<Stack.Screen name="Istasyon" component={StationDetailScreen} options={{ headerShown: true, title: 'İstasyon' }} />
						<Stack.Screen name="AkilliOneri" component={SmartRecommendScreen} options={{ headerShown: true, title: 'Akıllı Öneri' }} />
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<ErrorBoundary>
			<PaperProvider theme={paperTheme}>
				<AuthProvider>
					<AppContent />
				</AuthProvider>
			</PaperProvider>
		</ErrorBoundary>
	);
}
