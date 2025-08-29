import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { getStations, recommend } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
	const [stations, setStations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showMap, setShowMap] = useState(true);
	const [userLocation, setUserLocation] = useState(null);
	const [mapRegion, setMapRegion] = useState(null);
	const { user } = useAuth();
	const insets = useSafeAreaInsets();

	const loadStations = useCallback(async (withLoading = false) => {
		try {
			if (withLoading) setLoading(true);
			const data = await getStations();
			setStations(data);
		} finally {
			if (withLoading) setLoading(false);
		}
	}, []);

	useEffect(() => {
		// İlk yükleme
		loadStations(true);
	}, [loadStations]);

	useFocusEffect(
		useCallback(() => {
			// Odaklanınca hemen yenile
			loadStations(false);
			// 60 sn’de bir yenile
			const id = setInterval(() => loadStations(false), 60_000);
			return () => clearInterval(id);
		}, [loadStations])
	);

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status === 'granted') {
				const pos = await Location.getCurrentPositionAsync({});
				const location = {
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
				};
				setUserLocation(location);
				if (!mapRegion) {
					setMapRegion({
						...location,
						latitudeDelta: 0.2,
						longitudeDelta: 0.2,
					});
				}
			}
		})();
	}, []);

	const stats = useMemo(() => {
		const total = stations.length;
		const active = stations.filter(s => s.is_active).length;
		const available = stations.filter(s => s.available).length;
		const prices = stations.map(s => Number(s.price_per_kwh)).filter(n => Number.isFinite(n));
		const avgPrice = prices.length ? (prices.reduce((a,b)=>a+b,0) / prices.length) : null;
		return { total, active, available, avgPrice };
	}, [stations]);

	const pieData = useMemo(() => {
		const counts = new Map();
		stations.forEach(s => (s.connections||[]).forEach(c => counts.set(c.type_name, (counts.get(c.type_name)||0)+1)));
		const entries = Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,4);
		const palette = ['#7c3aed','#22c55e','#f59e0b','#06b6d4'];
		return entries.map(([name, value], i) => ({ name, population: value, color: palette[i%palette.length], legendFontColor: '#0f172a', legendFontSize: 10 }));
	}, [stations]);

	const showMyLocation = async () => {
		if (!userLocation) return;
		const newRegion = {
			...userLocation,
			latitudeDelta: 0.05,
			longitudeDelta: 0.05,
		};
		setMapRegion(newRegion);
	};

	if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;

	const initialRegion = mapRegion || {
		latitude: stations[0]?.latitude || 41.015137,
		longitude: stations[0]?.longitude || 28.97953,
		latitudeDelta: 0.2,
		longitudeDelta: 0.2,
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#7c3aed','#22c55e']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ padding: 14, paddingTop: Math.max(18, insets.top + 6) }}>
				<Text variant="titleLarge" style={{ color: 'white', fontWeight: '700' }}>NextVolt</Text>
				<Text style={{ color: 'white', opacity: 0.9, marginTop: 2, fontSize: 12 }}>AI destekli akıllı önerilerle yakındaki istasyonları keşfet</Text>
			</LinearGradient>

			<View style={{ paddingHorizontal: 12, marginTop: -10 }}>
				<View style={{ flexDirection: 'row', gap: 8 }}>
					<Card style={{ flex: 1 }}>
						<Card.Content>
							<Text style={{ color: '#64748b', fontSize: 11 }}>Aktif</Text>
							<Text variant="titleSmall" style={{ color: '#7c3aed', fontWeight: '700' }}>{stats.active}/{stats.total}</Text>
						</Card.Content>
					</Card>
					<Card style={{ flex: 1 }}>
						<Card.Content>
							<Text style={{ color: '#64748b', fontSize: 11 }}>Müsait</Text>
							<Text variant="titleSmall" style={{ color: '#22c55e', fontWeight: '700' }}>{stats.available}</Text>
						</Card.Content>
					</Card>
					<Card style={{ flex: 1 }}>
						<Card.Content>
							<Text style={{ color: '#64748b', fontSize: 11 }}>Ortalama ₺/kWh</Text>
							<Text variant="titleSmall" style={{ color: '#f59e0b', fontWeight: '700' }}>{stats.avgPrice ? stats.avgPrice.toFixed(2) : '-'}</Text>
						</Card.Content>
					</Card>
				</View>
				{pieData.length > 0 ? (
					<View style={{ alignItems: 'center', marginTop: 6 }}>
						<PieChart
							data={pieData}
							width={screenWidth - 24}
							height={120}
							chartConfig={{
								color: (opacity=1) => `rgba(15, 23, 42, ${opacity})`,
								labelColor: () => '#0f172a',
								propsForLabels: { fontSize: 9 },
							}}
							accessor={'population'}
							backgroundColor={'transparent'}
							paddingLeft={'6'}
							absolute
						/>
					</View>
				) : null}
			</View>

			{/* Action buttons */}
			<View style={{ paddingHorizontal: 12, marginTop: 8 }}>
				<View style={{ flexDirection: 'row', gap: 8 }}>
					<Button mode={showMap ? 'contained' : 'contained-tonal'} onPress={() => setShowMap(!showMap)} contentStyle={{ height: 36 }} labelStyle={{ fontSize: 12 }}>
						{showMap ? 'Liste' : 'Harita'}
					</Button>
					<Button mode="contained" onPress={() => navigation.navigate('AkilliOneri')} contentStyle={{ height: 36 }} labelStyle={{ fontSize: 12 }}>
						Akıllı Öneri
					</Button>
					{showMap && userLocation ? (
						<Button mode="contained-tonal" onPress={showMyLocation} contentStyle={{ height: 36 }} labelStyle={{ fontSize: 12 }}>
							Konumumu Göster
						</Button>
					) : null}
				</View>
			</View>

			{showMap ? (
				<View style={{ flex: 1, marginTop: 6 }}>
					<MapView 
						style={{ flex: 1 }} 
						initialRegion={initialRegion}
						region={mapRegion}
						onRegionChangeComplete={setMapRegion}
					>
						{/* User location marker */}
						{userLocation && (
							<Marker 
								coordinate={userLocation} 
								title="Konumunuz" 
								description="Şu anki konumunuz"
								pinColor="#3b82f6"
							/>
						)}
						{/* Station markers */}
						{stations.map(s => (
							<Marker 
								key={s.id} 
								coordinate={{ latitude: Number(s.latitude), longitude: Number(s.longitude) }} 
								title={s.name} 
								description={s.address} 
								onCalloutPress={() => navigation.navigate('Istasyon', { station: s })}
								pinColor={s.available ? "#22c55e" : "#f59e0b"}
							/>
						))}
					</MapView>
				</View>
			) : (
				<FlatList
					style={{ marginTop: 6 }}
					contentContainerStyle={{ paddingBottom: Math.max(12, insets.bottom) }}
					data={stations}
					keyExtractor={(item) => String(item.id)}
					renderItem={({ item }) => (
						<Card style={{ marginHorizontal: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: item.available ? '#22c55e' : '#f59e0b' }} onPress={() => navigation.navigate('Istasyon', { station: item })}>
							<Card.Title title={item.name} subtitle={item.address} titleStyle={{ fontSize: 14 }} subtitleStyle={{ fontSize: 12 }} left={(props) => <Text style={{ marginLeft: 12, color: '#7c3aed', fontSize: 16 }}>⚡</Text>} />
							<Card.Content>
								<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
									<Chip compact style={{ marginRight: 6, marginBottom: 6 }}>{item.city || item.region}</Chip>
									<Chip compact icon={item.available ? 'check-circle' : 'clock'} style={{ marginRight: 6, marginBottom: 6 }}>{item.available ? 'Müsait' : `Sıra: ${item.queue_time} dk`}</Chip>
									{item.price_per_kwh ? <Chip compact icon="cash" style={{ marginBottom: 6 }}>{item.price_per_kwh} ₺/kWh</Chip> : <Chip compact style={{ marginBottom: 6 }}>Fiyat yok</Chip>}
								</View>
							</Card.Content>
						</Card>
					)}
				/>
			)}
		</View>
	);
} 