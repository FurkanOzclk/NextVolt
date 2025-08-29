import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import StationDetailScreen from './src/screens/StationDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AuthScreen from './src/screens/AuthScreen';
import SmartRecommendScreen from './src/screens/SmartRecommendScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

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
	const { user } = useAuth();
	
	return (
		<NavigationContainer theme={navTheme}>
			<StatusBar style="dark" />
			<Stack.Navigator>
				{!user ? (
					<Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
				) : (
					<Stack.Screen name="Anasayfa" component={Tabs} options={{ headerShown: false }} />
				)}
				<Stack.Screen name="Istasyon" component={StationDetailScreen} options={{ title: 'İstasyon' }} />
				<Stack.Screen name="AkilliOneri" component={SmartRecommendScreen} options={{ title: 'Akıllı Öneri' }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<PaperProvider theme={paperTheme}>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</PaperProvider>
	);
}
