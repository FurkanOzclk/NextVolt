import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Chip, Divider, HelperText, List, Snackbar, Text } from 'react-native-paper';
import { addFavorite, removeFavorite, getFavorites, createReservation } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function StationDetailScreen({ route, navigation }) {
	const station = route.params?.station;
	const cameFromFavorites = !!route.params?.fromFavorites;
	const { user } = useAuth();
	const [favorites, setFavorites] = useState([]);
	const [loadingFav, setLoadingFav] = useState(false);
	const [reserving, setReserving] = useState(false);
	const [minutes, setMinutes] = useState(null);
	const [snack, setSnack] = useState({ visible: false, message: '' });

	const reservationBlocked = (!station?.is_active) || (!station?.available);
	const reservationReason = !station?.is_active ? 'İstasyon bakımda' : (!station?.available ? 'İstasyon şu anda müsait değil' : '');

	useEffect(() => {
		(async () => {
			if (!user) return;
			try {
				const favs = await getFavorites(user.id);
				setFavorites(favs);
			} catch {}
		})();
	}, [user]);

	const isFav = useMemo(() => favorites.some(f => String(f) === String(station?.id)), [favorites, station]);

	const toggleFav = async () => {
		if (!user || !station) return;
		setLoadingFav(true);
		try {
			const next = isFav
				? await removeFavorite(user.id, station.id)
				: await addFavorite(user.id, station.id);
			setFavorites(next);
			if (!isFav) {
				setSnack({ visible: true, message: 'Favorilere eklendi' });
			} else {
				setSnack({ visible: true, message: 'Favorilerden çıkarıldı' });
				if (cameFromFavorites) {
					setTimeout(() => navigation.goBack(), 300);
				}
			}
		} finally {
			setLoadingFav(false);
		}
	};

	const onReserve = async () => {
		if (!user || !station || !minutes || reservationBlocked) return;
		setReserving(true);
		try {
			await createReservation(user.id, station.id, minutes);
			setSnack({ visible: true, message: `Rezervasyon oluşturuldu • ${minutes} dk` });
		} catch (e) {
			setSnack({ visible: true, message: e.response?.data?.message || 'Rezervasyon başarısız' });
		} finally {
			setReserving(false);
		}
	};

	return (
		<>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<Card>
					<Card.Title title={station?.name} subtitle={station?.address} />
					<Card.Content>
						<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
							<Chip>{station?.city || station?.region}</Chip>
							<Chip icon={station?.available ? 'check-circle' : 'clock'}>{station?.available ? 'Müsait' : `Sıra: ${station?.queue_time} dk`}</Chip>
							{station?.price_per_kwh ? <Chip icon="cash">{station?.price_per_kwh} ₺/kWh</Chip> : <Chip>Fiyat yok</Chip>}
						</View>
						<Button mode={isFav ? 'contained' : 'contained-tonal'} onPress={toggleFav} loading={loadingFav} style={{ marginBottom: 10 }}>
							{isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
						</Button>
						<View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
							{[15,30,45].map(m => (
								<Chip key={m} selected={minutes === m} onPress={() => !reservationBlocked && setMinutes(m)} compact style={{ marginRight: 6, marginBottom: 6 }} disabled={reservationBlocked}>
									{m} dk
								</Chip>
							))}
							<Button mode="contained" onPress={onReserve} loading={reserving} disabled={!minutes || reservationBlocked} contentStyle={{ height: 36 }} style={{ marginBottom: 6 }}>
								Rezervasyon ekle
							</Button>
						</View>
						{reservationBlocked ? (
							<HelperText type="error">{reservationReason}. Rezervasyona izin verilmiyor.</HelperText>
						) : (!minutes ? <HelperText type="info">Lütfen süre seçiniz</HelperText> : null)}
						<Divider style={{ marginVertical: 12 }} />
						<List.Section>
							<List.Subheader>Bağlantılar</List.Subheader>
							{(station?.connections || []).map((c, idx) => (
								<List.Item key={idx} title={c.type_name} description={`Seviye: ${c.level} • Soket: ${c.num_connectors}`} left={props => <List.Icon {...props} icon="ev-station" />} />
							))}
						</List.Section>
					</Card.Content>
				</Card>
			</ScrollView>
			<Snackbar visible={snack.visible} onDismiss={() => setSnack({ visible: false, message: '' })} duration={2200}>
				{snack.message}
			</Snackbar>
		</>
	);
} 