import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { getStations, recommend } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768; // Tablet detection
const isLargeTablet = screenWidth >= 1024; // Large tablet detection

export default function HomeScreen({ navigation }) {
	const [stations, setStations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showMap, setShowMap] = useState(true); // Harita aktif
	const [userLocation, setUserLocation] = useState(null);
	const [mapRegion, setMapRegion] = useState(null);
	const [mapsAvailable, setMapsAvailable] = useState(true);
	const [chartsAvailable, setChartsAvailable] = useState(true);
	
	// Charts'ın çalışıp çalışmadığını test et
	useEffect(() => {
		try {
			// PieChart'ın çalışıp çalışmadığını test et
			if (typeof PieChart === 'undefined') {
				setChartsAvailable(false);
			}
		} catch (error) {
			setChartsAvailable(false);
		}
	}, []);
	const { user } = useAuth();
	const insets = useSafeAreaInsets();

	const loadStations = useCallback(async (withLoading = false) => {
		try {
			if (withLoading) setLoading(true);
			const data = await getStations();
			setStations(data || []);
		} catch (error) {
			// Hata durumunda boş array set et
			setStations([]);
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
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status === 'granted') {
					const pos = await Location.getCurrentPositionAsync({
						accuracy: Location.Accuracy.Lowest, // Daha az hassas, daha güvenli
						timeout: 10000, // 10 saniye timeout
					});
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
			} catch (error) {
				// Konum alınamazsa varsayılan değerler kullanılacak
				setUserLocation(null);
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
		if (!userLocation) {
			// Eğer konum yoksa tekrar al
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== 'granted') return;
				const pos = await Location.getCurrentPositionAsync({ 
					accuracy: Location.Accuracy.Lowest,
					timeout: 10000
				});
				const newLocation = {
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
				};
				setUserLocation(newLocation);
				setMapRegion({
					...newLocation,
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				});
			} catch (error) {
				console.error('Konum alınamadı:', error);
			}
			return;
		}
		
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
			<LinearGradient colors={['#7c3aed','#22c55e']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ 
				padding: isTablet ? 32 : 20, 
				paddingTop: Math.max(isTablet ? 36 : 24, insets.top + 8) 
			}}>
				<Text variant={isTablet ? "headlineLarge" : "headlineMedium"} style={{ 
					color: 'white', 
					fontWeight: '700',
					fontSize: isTablet ? 36 : 24
				}}>NextVolt</Text>
				<Text style={{ 
					color: 'white', 
					opacity: 0.9, 
					marginTop: 8, 
					fontSize: isTablet ? 20 : 14 
				}}>AI destekli akıllı önerilerle yakındaki istasyonları keşfet</Text>
			</LinearGradient>

			<View style={{ 
				paddingHorizontal: isTablet ? 20 : 12, 
				marginTop: isTablet ? -15 : -10 
			}}>
				<View style={{ 
					flexDirection: 'row', 
					gap: isTablet ? 16 : 8,
					justifyContent: 'space-between'
				}}>
					<Card style={{ 
						flex: 1,
						padding: isTablet ? 8 : 0
					}}>
						<Card.Content style={{ 
							padding: isTablet ? 16 : 12,
							alignItems: 'center',
							justifyContent: 'center'
						}}>
							<Text style={{ 
								color: '#64748b', 
								fontSize: isTablet ? 16 : 11,
								textAlign: 'center'
							}}>Aktif</Text>
							<Text variant={isTablet ? "titleLarge" : "titleSmall"} style={{ 
								color: '#7c3aed', 
								fontWeight: '700',
								fontSize: isTablet ? 24 : 14,
								textAlign: 'center'
							}}>{stats.active}/{stats.total}</Text>
						</Card.Content>
					</Card>
					<Card style={{ 
						flex: 1,
						padding: isTablet ? 8 : 0
					}}>
						<Card.Content style={{ 
							padding: isTablet ? 16 : 12,
							alignItems: 'center',
							justifyContent: 'center'
						}}>
							<Text style={{ 
								color: '#64748b', 
								fontSize: isTablet ? 16 : 11,
								textAlign: 'center'
							}}>Müsait</Text>
							<Text variant={isTablet ? "titleLarge" : "titleSmall"} style={{ 
								color: '#22c55e', 
								fontWeight: '700',
								fontSize: isTablet ? 24 : 14,
								textAlign: 'center'
							}}>{stats.available}</Text>
						</Card.Content>
					</Card>
					<Card style={{ 
						flex: 1,
						padding: isTablet ? 8 : 0
					}}>
						<Card.Content style={{ 
							padding: isTablet ? 16 : 12,
							alignItems: 'center',
							justifyContent: 'center'
						}}>
							<Text style={{ 
								color: '#64748b', 
								fontSize: isTablet ? 16 : 11,
								textAlign: 'center'
							}}>Ortalama ₺/kWh</Text>
							<Text variant={isTablet ? "titleLarge" : "titleSmall"} style={{ 
								color: '#f59e0b', 
								fontWeight: '700',
								fontSize: isTablet ? 24 : 14,
								textAlign: 'center'
							}}>{stats.avgPrice ? stats.avgPrice.toFixed(2) : '-'}</Text>
						</Card.Content>
					</Card>
				</View>
				{pieData.length > 0 && chartsAvailable ? (
					<View style={{ 
						alignItems: 'center', 
						marginTop: isTablet ? 12 : 6 
					}}>
						<PieChart
							data={pieData}
							width={isTablet ? Math.min(screenWidth * 0.7, 500) : screenWidth - 24}
							height={isTablet ? 200 : 120}
							chartConfig={{
								color: (opacity=1) => `rgba(15, 23, 42, ${opacity})`,
								labelColor: () => '#0f172a',
								propsForLabels: { 
									fontSize: isTablet ? 12 : 9 
								},
							}}
							accessor={'population'}
							backgroundColor={'transparent'}
							paddingLeft={isTablet ? '12' : '6'}
							absolute
							onError={(error) => {
								console.error('PieChart error:', error);
								setChartsAvailable(false);
							}}
						/>
					</View>
				) : pieData.length > 0 ? (
					<View style={{ 
						alignItems: 'center', 
						marginTop: isTablet ? 12 : 6, 
						padding: isTablet ? 24 : 20, 
						backgroundColor: '#f1f5f9', 
						borderRadius: isTablet ? 12 : 8 
					}}>
						<Text style={{ 
							color: '#64748b',
							fontSize: isTablet ? 16 : 14
						}}>Grafik yüklenemedi</Text>
						<Text style={{ 
							color: '#64748b', 
							fontSize: isTablet ? 14 : 12 
						}}>İstatistikler yukarıda görünüyor</Text>
					</View>
				) : null}
			</View>

			{/* Action buttons */}
			<View style={{ 
				paddingHorizontal: isTablet ? 20 : 12, 
				marginTop: isTablet ? 16 : 8 
			}}>
				<View style={{ 
					flexDirection: 'row', 
					gap: isTablet ? 16 : 8,
					justifyContent: 'flex-start'
				}}>
					<Button 
						mode={showMap ? 'contained' : 'contained-tonal'} 
						onPress={() => setShowMap(!showMap)} 
						contentStyle={{ 
							height: isTablet ? 48 : 36,
							paddingHorizontal: isTablet ? 24 : 16
						}} 
						labelStyle={{ 
							fontSize: isTablet ? 16 : 12,
							fontWeight: '600'
						}}
					>
						{showMap ? 'Liste' : 'Harita'}
					</Button>
					<Button 
						mode="contained" 
						onPress={() => navigation.navigate('AkilliOneri')} 
						contentStyle={{ 
							height: isTablet ? 48 : 36,
							paddingHorizontal: isTablet ? 24 : 16
						}} 
						labelStyle={{ 
							fontSize: isTablet ? 16 : 12,
							fontWeight: '600'
						}}
					>
						Akıllı Öneri
					</Button>
					{showMap && userLocation ? (
						<Button 
							mode="contained-tonal" 
							onPress={showMyLocation} 
							contentStyle={{ 
								height: isTablet ? 48 : 36,
								paddingHorizontal: isTablet ? 24 : 16
							}} 
							labelStyle={{ 
								fontSize: isTablet ? 16 : 12,
								fontWeight: '600'
							}}
						>
							Konumumu Göster
						</Button>
					) : null}
				</View>
			</View>

			{showMap && mapsAvailable ? (
				<View style={{ 
					height: screenHeight * 0.5,
					marginTop: isTablet ? 40 : 6,
					marginBottom: 0
				}}>
					<WebView
						key={mapRegion ? `${mapRegion.latitude}-${mapRegion.longitude}` : 'default'}
						style={{ flex: 1 }}
						source={{
							html: `
								<!DOCTYPE html>
								<html>
								<head>
									<meta name="viewport" content="width=device-width, initial-scale=1.0">
									<script src="https://maps.googleapis.com/maps/api/js?key=REMOVED_API_KEY&libraries=places"></script>
								</head>
								<body style="margin:0; padding:0;">
									<div id="map" style="width:100%; height:100vh;"></div>
									<script>
										function initMap() {
											const map = new google.maps.Map(document.getElementById('map'), {
												zoom: 10,
												center: { lat: ${mapRegion?.latitude || 41.015137}, lng: ${mapRegion?.longitude || 28.97953} },
												// Ücretsiz kullanım için optimizasyon
												disableDefaultUI: false,
												zoomControl: true,
												mapTypeControl: false,
												scaleControl: false,
												streetViewControl: false,
												rotateControl: false,
												fullscreenControl: false
											});
											
											// User location marker
											const userLocation = ${JSON.stringify(userLocation)};
											if (userLocation) {
												const userMarker = new google.maps.Marker({
													position: { lat: userLocation.latitude, lng: userLocation.longitude },
													map: map,
													title: 'Konumunuz',
													icon: {
														url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#ffffff"/></svg>'),
														scaledSize: new google.maps.Size(32, 32),
														anchor: new google.maps.Point(16, 16)
													}
												});
											}
											
											// Station markers
											const stationsData = ${JSON.stringify(stations)};
											stationsData.forEach((stationItem, index) => {
												const marker = new google.maps.Marker({
													position: { lat: parseFloat(stationItem.latitude), lng: parseFloat(stationItem.longitude) },
													map: map,
													title: stationItem.name,
													icon: {
														url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="' + (stationItem.available ? '#22c55e' : '#f59e0b') + '"/><circle cx="12" cy="9" r="3" fill="white"/><text x="12" y="12" text-anchor="middle" fill="' + (stationItem.available ? '#22c55e' : '#f59e0b') + '" font-size="8" font-weight="bold">⚡</text></svg>'),
														scaledSize: new google.maps.Size(40, 40),
														anchor: new google.maps.Point(12, 40)
													}
												});
												
												// Create info window content with station data embedded
												const stationJson = JSON.stringify(stationItem);
												const infoWindow = new google.maps.InfoWindow({
													disableAutoPan: false,
													pixelOffset: new google.maps.Size(0, -10),
													content: \`
														<div style="padding: 12px; min-width: 200px; font-family: Arial, sans-serif;">
															<h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; display: flex; align-items: center; gap: 8px;">
																<span style="color: \${stationItem.available ? '#22c55e' : '#f59e0b'}; font-size: 18px;">⚡</span>
																\${stationItem.name}
															</h3>
															<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">\${stationItem.address}</p>
															<div style="display: flex; gap: 8px; margin-bottom: 8px;">
																<span style="background: \${stationItem.available ? '#dcfce7' : '#fef3c7'}; color: \${stationItem.available ? '#166534' : '#92400e'}; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
																	\${stationItem.available ? 'Müsait' : 'Dolu'}
																</span>
																\${stationItem.price_per_kwh ? \`<span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">\${stationItem.price_per_kwh} ₺/kWh</span>\` : ''}
															</div>
															<button onclick="console.log('Button clicked!'); console.log('Station data:', \${stationJson}); window.ReactNativeWebView.postMessage(JSON.stringify({type: 'station_click', station: \${stationJson}})); console.log('Message sent!');" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; width: 100%;">
																Detayları Gör
															</button>
														</div>
													\`
												});
												
												marker.addListener('click', () => {
													infoWindow.open(map, marker);
												});
											});
										}
										
										// Initialize map when Google Maps loads
										google.maps.event.addDomListener(window, 'load', initMap);
									</script>
								</body>
								</html>
							`
						}}
						onMessage={(event) => {
							console.log('WebView message received:', event.nativeEvent.data);
							try {
								const data = JSON.parse(event.nativeEvent.data);
								console.log('Parsed data:', data);
								if (data.type === 'station_click') {
									console.log('Navigating to station:', data.station);
									navigation.navigate('Istasyon', { station: data.station });
								}
							} catch (error) {
								console.error('WebView message error:', error);
							}
						}}
						onError={(error) => {
							console.error('WebView error:', error);
							setMapsAvailable(false);
						}}
					/>
				</View>
			) : showMap ? (
				<View style={{ flex: 1, marginTop: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
					<Text style={{ color: '#64748b' }}>Harita yüklenemedi</Text>
					<Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Liste görünümünü kullanın</Text>
					<Button 
						mode="contained" 
						onPress={() => setShowMap(false)} 
						style={{ marginTop: 10 }}
					>
						Liste Görünümü
					</Button>
				</View>
			) : (
				<FlatList
					style={{ 
						marginTop: isTablet ? 12 : 6,
						height: screenHeight * 0.4,
						marginBottom: 0
					}}
					contentContainerStyle={{ 
						paddingBottom: 0,
						paddingHorizontal: isTablet ? 20 : 0
					}}
					data={stations}
					keyExtractor={(item) => String(item.id)}
					numColumns={isTablet ? 2 : 1}
					columnWrapperStyle={isTablet ? { justifyContent: 'space-between' } : undefined}
					renderItem={({ item }) => (
						<Card style={{ 
							marginHorizontal: isTablet ? 8 : 12, 
							marginBottom: isTablet ? 16 : 10, 
							borderLeftWidth: 3, 
							borderLeftColor: item.available ? '#22c55e' : '#f59e0b',
							width: isTablet ? (screenWidth - 80) / 2 : undefined
						}} onPress={() => navigation.navigate('Istasyon', { station: item })}>
							<Card.Title 
								title={item.name} 
								subtitle={item.address} 
								titleStyle={{ 
									fontSize: isTablet ? 16 : 14,
									fontWeight: '600'
								}} 
								subtitleStyle={{ 
									fontSize: isTablet ? 13 : 12 
								}} 
								left={(props) => (
									<Text style={{ 
										marginLeft: isTablet ? 16 : 12, 
										color: '#7c3aed', 
										fontSize: isTablet ? 18 : 16 
									}}>⚡</Text>
								)} 
							/>
							<Card.Content>
								<View style={{ 
									flexDirection: 'row', 
									flexWrap: 'wrap'
								}}>
									<Chip 
										compact 
										style={{ 
											marginRight: 6, 
											marginBottom: 6
										}}
									>
										{item.city || item.region}
									</Chip>
									<Chip 
										compact 
										icon={item.available ? 'check-circle' : 'clock'} 
										style={{ 
											marginRight: 6, 
											marginBottom: 6
										}}
									>
										{item.available ? 'Müsait' : `Sıra: ${item.queue_time} dk`}
									</Chip>
									{item.price_per_kwh ? (
										<Chip 
											compact 
											icon="cash" 
											style={{ 
												marginBottom: 6
											}}
										>
											{item.price_per_kwh} ₺/kWh
										</Chip>
									) : (
										<Chip 
											compact 
											style={{ 
												marginBottom: 6
											}}
										>
											Fiyat yok
										</Chip>
									)}
								</View>
							</Card.Content>
						</Card>
					)}
				/>
			)}
		</View>
	);
} 