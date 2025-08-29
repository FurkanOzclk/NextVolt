import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { getFavorites, getStation } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoritesScreen({ navigation }) {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState([]);
	const insets = useSafeAreaInsets();

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const favIds = await getFavorites(user.id);
			const details = await Promise.all(favIds.map((id) => getStation(id)));
			setItems(details);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => { load(); }, [load]);
	useFocusEffect(useCallback(() => { load(); }, [load]));

	if (!user) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: Math.max(12, insets.top) }}><Text>Favorileri görmek için giriş yapın.</Text></View>;
	if (loading) return <View style={{ flex: 1, justifyContent: 'center', paddingTop: Math.max(12, insets.top) }}><ActivityIndicator /></View>;

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#7c3aed','#22c55e']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ paddingTop: Math.max(18, insets.top + 6), padding: 16 }}>
				<Text variant="titleLarge" style={{ color: 'white', fontWeight: '700' }}>Favoriler</Text>
				<Text style={{ color: 'white', opacity: 0.9, fontSize: 12 }}>{items.length} istasyon favorilerinizde</Text>
			</LinearGradient>
			<FlatList
				style={{ paddingTop: 8, paddingBottom: Math.max(12, insets.bottom) }}
				data={items}
				keyExtractor={(item) => String(item.id)}
				renderItem={({ item }) => (
					<Card style={{ marginHorizontal: 12, marginBottom: 10 }} onPress={() => navigation.navigate('Istasyon', { station: item, fromFavorites: true })}>
						<Card.Title title={item.name} subtitle={item.address} />
					</Card>
				)}
			/>
		</View>
	);
} 