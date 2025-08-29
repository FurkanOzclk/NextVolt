import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Card, Chip, HelperText, Text, SegmentedButtons, ActivityIndicator, Menu, Divider } from 'react-native-paper';
import * as Location from 'expo-location';
import { recommend, getVehicles, getReachableStations } from '../api/client';
import FormTextInput from '../components/FormTextInput';

const plugs = ['CCS (Type 2)','Type 2 (Socket Only)','CHAdeMO'];

export default function SmartRecommendScreen({ navigation, route }) {
	const [vehicles, setVehicles] = useState([]);
	const [selectedVehicle, setSelectedVehicle] = useState(null);
	const [loadingVehicles, setLoadingVehicles] = useState(true);
	const [manualBattery, setManualBattery] = useState('');
	const [vehicleBattery, setVehicleBattery] = useState('');
	const [rangeKm, setRangeKm] = useState('');
	const [destinationKm, setDestinationKm] = useState('');
	const [preferred, setPreferred] = useState(null);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState([]);
	const [error, setError] = useState('');
	const [useVehicle, setUseVehicle] = useState(false);
	const [vehicleMenuVisible, setVehicleMenuVisible] = useState(false);

	useEffect(() => {
		loadVehicles();
	}, []);

	// Reset battery inputs when switching modes
	useEffect(() => {
		if (useVehicle) {
			setManualBattery('');
		} else {
			setVehicleBattery('');
		}
	}, [useVehicle]);

	const loadVehicles = async () => {
		try {
			setLoadingVehicles(true);
			const vehiclesData = await getVehicles();
			console.log('Loaded vehicles:', vehiclesData);
			setVehicles(vehiclesData);
			if (vehiclesData.length > 0) {
				setSelectedVehicle(vehiclesData[0].id);
			}
		} catch (error) {
			console.error('Error loading vehicles:', error);
		} finally {
			setLoadingVehicles(false);
		}
	};

	const getSelectedVehicleData = () => {
		return vehicles.find(v => v.id === selectedVehicle);
	};

	const onSubmit = async () => {
		setError(''); setResults([]); setLoading(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') { setError('Konum izni gerekli'); return; }
			const pos = await Location.getCurrentPositionAsync({});
			
			if (useVehicle && selectedVehicle && vehicleBattery) {
				// Use vehicle-based calculation
				const reachableData = await getReachableStations(
					selectedVehicle, 
					Number(vehicleBattery), 
					{ lat: pos.coords.latitude, lng: pos.coords.longitude }
				);
				
				if (reachableData.reachableStations.length === 0) {
					setError(`Mevcut batarya ile ulaşabileceğin istasyon yok. Tahmini menzil: ${reachableData.rangeKm} km`);
					return;
				}

				// Check if destination is reachable
				if (destinationKm && Number(destinationKm) > reachableData.rangeKm) {
					setError(`Hedef mesafe (${destinationKm} km) mevcut batarya ile ulaşılamaz. Maksimum menzil: ${reachableData.rangeKm} km`);
					return;
				}
				
				// Use the existing recommend endpoint with calculated range
				const params = {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
					battery: Number(vehicleBattery),
					range_km: destinationKm ? Number(destinationKm) : reachableData.rangeKm,
					preferred: preferred || undefined,
				};
				const recommendations = await recommend(params);
				setResults(Array.isArray(recommendations) ? recommendations : [recommendations]);
				if (!recommendations || (Array.isArray(recommendations) && recommendations.length === 0)) {
					setError('Uygun istasyon bulunamadı');
				}
			} else {
				// Use manual range input
				const params = {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
					battery: manualBattery ? Number(manualBattery) : undefined,
					range_km: rangeKm ? Number(rangeKm) : undefined,
					preferred: preferred || undefined,
				};
				const recommendations = await recommend(params);
				setResults(Array.isArray(recommendations) ? recommendations : [recommendations]);
				if (!recommendations || (Array.isArray(recommendations) && recommendations.length === 0)) {
					setError('Uygun istasyon bulunamadı');
				}
			}
		} catch (e) {
			setError('Öneri başarısız');
		} finally {
			setLoading(false);
		}
	};

	const manualBatteryErr = manualBattery !== '' && (Number.isNaN(Number(manualBattery)) || Number(manualBattery) < 0 || Number(manualBattery) > 100);
	const vehicleBatteryErr = vehicleBattery !== '' && (Number.isNaN(Number(vehicleBattery)) || Number(vehicleBattery) < 0 || Number(vehicleBattery) > 100);
	const rangeErr = !useVehicle && rangeKm !== '' && (Number.isNaN(Number(rangeKm)) || Number(rangeKm) < 0);
	const destinationErr = useVehicle && destinationKm !== '' && (Number.isNaN(Number(destinationKm)) || Number(destinationKm) < 0);
	const vehicleErr = useVehicle && !selectedVehicle;
	const disabled = loading || (useVehicle ? vehicleBatteryErr : manualBatteryErr) || rangeErr || destinationErr || vehicleErr;

	return (
		<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
			<Text variant="titleLarge">Akıllı Öneri</Text>
			<Text style={{ color: '#64748b' }}>Araç bilgileri veya manuel verilerle en iyi istasyonu bulalım.</Text>
			
			<SegmentedButtons
				value={useVehicle ? 'vehicle' : 'manual'}
				onValueChange={(value) => setUseVehicle(value === 'vehicle')}
				buttons={[
					{ value: 'vehicle', label: 'Araç Bilgisi' },
					{ value: 'manual', label: 'Manuel' }
				]}
			/>

			{useVehicle ? (
				<>
					<Text variant="titleMedium">Araç Seçimi</Text>
					{loadingVehicles ? (
						<View style={{ alignItems: 'center', padding: 20 }}>
							<ActivityIndicator size="large" />
							<Text style={{ marginTop: 8, color: '#64748b' }}>Araçlar yükleniyor...</Text>
						</View>
					) : vehicles.length === 0 ? (
						<Card style={{ backgroundColor: '#fef2f2' }}>
							<Card.Content>
								<Text style={{ color: '#dc2626' }}>Araç bulunamadı</Text>
								<Text variant="bodySmall" style={{ color: '#64748b' }}>
									Backend'de vehicle.json dosyası bulunamadı veya boş.
								</Text>
							</Card.Content>
						</Card>
					) : (
						<>
							<Menu
								visible={vehicleMenuVisible}
								onDismiss={() => setVehicleMenuVisible(false)}
								anchor={
									<Button
										mode="outlined"
										onPress={() => setVehicleMenuVisible(true)}
										icon="car"
										style={{ justifyContent: 'space-between' }}
										contentStyle={{ flexDirection: 'row', justifyContent: 'space-between' }}
									>
										{getSelectedVehicleData() ? `${getSelectedVehicleData().brand} ${getSelectedVehicleData().model}` : 'Araç Seçiniz'}
									</Button>
								}
								contentStyle={{ 
									maxHeight: 300,
									width: 300,
									left: 0
								}}
							>
								<ScrollView 
									showsVerticalScrollIndicator={true}
									nestedScrollEnabled={true}
									style={{ maxHeight: 280 }}
								>
									{vehicles.map((vehicle, index) => (
										<React.Fragment key={vehicle.id}>
											<Menu.Item
												onPress={() => {
													setSelectedVehicle(vehicle.id);
													setVehicleMenuVisible(false);
												}}
												title={`${vehicle.brand} ${vehicle.model}`}
												description={`${vehicle.battery_capacity_kwh} kWh • ${vehicle.consumption_kwh_per_100km} kWh/100km`}
												leadingIcon="car"
												style={{ minHeight: 60 }}
											/>
											{index < vehicles.length - 1 && <Divider />}
										</React.Fragment>
									))}
								</ScrollView>
							</Menu>
							
							{selectedVehicle && (
								<Card style={{ backgroundColor: '#f8fafc', marginTop: 8 }}>
									<Card.Content>
										<Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
											{getSelectedVehicleData()?.brand} {getSelectedVehicleData()?.model}
										</Text>
										<Text variant="bodySmall" style={{ color: '#64748b', marginTop: 4 }}>
											Batarya Kapasitesi: {getSelectedVehicleData()?.battery_capacity_kwh} kWh
										</Text>
										<Text variant="bodySmall" style={{ color: '#64748b' }}>
											Tüketim: {getSelectedVehicleData()?.consumption_kwh_per_100km} kWh/100km
										</Text>
									</Card.Content>
								</Card>
							)}

							<FormTextInput 
								label="Batarya (%)" 
								value={vehicleBattery} 
								onChangeText={setVehicleBattery} 
								keyboardType="numeric" 
								icon="battery" 
								error={vehicleBatteryErr} 
								helperText={vehicleBatteryErr ? '0-100 arasında bir değer girin' : ''} 
							/>

							<FormTextInput 
								label="Gidilecek mesafe (km)" 
								value={destinationKm} 
								onChangeText={setDestinationKm} 
								keyboardType="numeric" 
								icon="map-marker-distance" 
								error={destinationErr} 
								helperText={destinationErr ? 'Geçerli bir km değeri girin' : 'Opsiyonel: Hedef mesafenizi belirtin'} 
							/>
						</>
					)}
				</>
			) : (
				<>
					<FormTextInput 
						label="Batarya (%)" 
						value={manualBattery} 
						onChangeText={setManualBattery} 
						keyboardType="numeric" 
						icon="battery" 
						error={manualBatteryErr} 
						helperText={manualBatteryErr ? '0-100 arasında bir değer girin' : ''} 
					/>

					<FormTextInput 
						label="Tahmini menzil (km)" 
						value={rangeKm} 
						onChangeText={setRangeKm} 
						keyboardType="numeric" 
						icon="map-marker-distance" 
						error={rangeErr} 
						helperText={rangeErr ? 'Geçerli bir km değeri girin' : ''} 
					/>
				</>
			)}

			<Text variant="titleMedium">Tercih Edilen Fiş</Text>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
				{plugs.map(p => (
					<Chip key={p} selected={preferred === p} onPress={() => setPreferred(p)} compact style={{ marginRight: 6, marginBottom: 6 }}>{p}</Chip>
				))}
			</View>

			<Button mode="contained" onPress={onSubmit} loading={loading} disabled={disabled}>
				{useVehicle ? 'Araç ile Öner' : 'Akıllı Öner'}
			</Button>

			{error ? <HelperText type="error">{error}</HelperText> : null}
			
			{results.length > 0 && (
				<>
					<Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
						Önerilen İstasyonlar ({results.length})
					</Text>
					{results.map((station, index) => (
						<Card key={station.id} style={{ marginBottom: 8 }}>
							<Card.Title 
								title={`${index + 1}. ${station.name}`} 
								subtitle={`${station.distance_km} km • Skor: ${station.score}`} 
							/>
							<Card.Content>
								<Text>{station.address}</Text>
								<View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 }}>
									{station.price_per_kwh && (
										<Chip compact icon="cash">{station.price_per_kwh} ₺/kWh</Chip>
									)}
									<Chip compact icon={station.available ? 'check-circle' : 'clock'}>
										{station.available ? 'Müsait' : `Sıra: ${station.queue_time} dk`}
									</Chip>
									{station.connections && station.connections.length > 0 && (
										<Chip compact icon="ev-station">
											{station.connections.length} bağlantı
										</Chip>
									)}
								</View>
							</Card.Content>
							<Card.Actions>
								<Button onPress={() => navigation.navigate('Istasyon', { station })}>
									Detaya git
								</Button>
							</Card.Actions>
						</Card>
					))}
				</>
			)}
		</ScrollView>
	);
} 