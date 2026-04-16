import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, View, Dimensions } from 'react-native';
import { ActivityIndicator, Button, Card, List, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { cancelReservation, getReservations } from '../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768; // Tablet detection

function formatRemaining(expiresAt) {
	const end = new Date(expiresAt).getTime();
	const now = Date.now();
	const diffMs = Math.max(0, end - now);
	const min = Math.floor(diffMs / 60000);
	const sec = Math.floor((diffMs % 60000) / 1000);
	return `${min} dk ${sec}s`;
}

export default function ReservationsScreen() {
	const { user } = useAuth();
	const insets = useSafeAreaInsets();
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState([]);
	const [nowTick, setNowTick] = useState(Date.now());

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const data = await getReservations(user.id);
			setItems(data);
		} catch (error) {
			console.error('Rezervasyonlar yüklenirken hata:', error);
			setItems([]);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => { load(); }, [load]);
	useFocusEffect(useCallback(() => {
		load();
		const refresh = setInterval(load, 60_000);
		const tick = setInterval(() => setNowTick(Date.now()), 1000);
		return () => { clearInterval(refresh); clearInterval(tick); };
	}, [load]));

	const onCancel = async (id) => {
		if (!user) return;
		await cancelReservation(user.id, id);
		load();
	};

	if (!user) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: Math.max(12, insets.top) }}><Text>Rezervasyonlar için giriş yapın.</Text></View>;
	if (loading) return <View style={{ flex: 1, justifyContent: 'center', paddingTop: Math.max(12, insets.top) }}><ActivityIndicator /></View>;

	if (items.length === 0) {
		return (
			<View style={{ flex: 1 }}>
				<LinearGradient colors={['#7c3aed','#22c55e']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ 
					padding: isTablet ? 32 : 20, 
					paddingTop: Math.max(isTablet ? 36 : 24, insets.top + 8) 
				}}>
					<Text variant={isTablet ? "headlineLarge" : "headlineMedium"} style={{ 
						color: 'white', 
						fontWeight: '700',
						fontSize: isTablet ? 36 : 24
					}}>Rezervasyonlar</Text>
					<Text style={{ 
						color: 'white', 
						opacity: 0.9, 
						marginTop: 8, 
						fontSize: isTablet ? 20 : 14 
					}}>Aktif rezervasyon yok</Text>
				</LinearGradient>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Text>Aktif rezervasyonunuz yok.</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#7c3aed','#22c55e']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ 
				padding: isTablet ? 32 : 20, 
				paddingTop: Math.max(isTablet ? 36 : 24, insets.top + 8) 
			}}>
				<Text variant={isTablet ? "headlineLarge" : "headlineMedium"} style={{ 
					color: 'white', 
					fontWeight: '700',
					fontSize: isTablet ? 36 : 24
				}}>Rezervasyonlar</Text>
				<Text style={{ 
					color: 'white', 
					opacity: 0.9, 
					marginTop: 8, 
					fontSize: isTablet ? 20 : 14 
				}}>{items.length} aktif rezervasyon</Text>
			</LinearGradient>
			<FlatList
				style={{ paddingTop: 8, paddingBottom: Math.max(12, insets.bottom) }}
				data={items}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<Card style={{ marginHorizontal: 12, marginBottom: 10 }}>
						<List.Item
							title={item.stationName}
							description={`Bitiş: ${new Date(item.expiresAt).toLocaleTimeString()} • Kalan: ${formatRemaining(item.expiresAt)}`}
							left={(props) => <List.Icon {...props} icon="clock" />}
							right={() => (
								<Button mode="text" onPress={() => onCancel(item.id)}>İptal</Button>
							)}
						/>
					</Card>
				)}
			/>
		</View>
	);
} 