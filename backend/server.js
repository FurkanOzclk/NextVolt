const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const { v4: uuid } = require("uuid");

const app = express();

// ================== PATHS ==================
const DATA_DIR = path.join(__dirname, "data");
const STATIONS_FILE = path.join(DATA_DIR, "station.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const VEHICLE_FILE = path.join(DATA_DIR, "vehicle.json");

// ================== HELPERS ==================
async function readJSON(filePath, fallback = []) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw e;
  }
}

async function writeJSON(filePath, data) {
  const tmp = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, tmp);
}

function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ================== STATIONS ==================
app.get("/stations", async (req, res) => {
  const stations = await readJSON(STATIONS_FILE, []);
  res.json(stations);
});

app.get("/stations/:id", async (req, res) => {
  const id = Number(req.params.id);
  const stations = await readJSON(STATIONS_FILE, []);
  const st = stations.find(s => Number(s.id) === id);
  if (!st) return res.status(404).json({ message: "Station not found" });
  res.json(st);
});

app.patch("/stations/:id", async (req, res) => {
  const id = Number(req.params.id);
  const patch = req.body;

  const stations = await readJSON(STATIONS_FILE, []);
  const i = stations.findIndex(s => Number(s.id) === id);
  if (i === -1) return res.status(404).json({ message: "Station not found" });

  stations[i] = { ...stations[i], ...patch };
  await writeJSON(STATIONS_FILE, stations);
  res.json(stations[i]);
});

// ================== USERS / AUTH ==================
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "username and password required" });

  const users = await readJSON(USERS_FILE, []);
  if (users.find(u => u.username === username))
    return res.status(400).json({ message: "Username already exists" });

  const newUser = { 
    id: uuid(), 
    username, 
    password, // DEMO: düz metin
    favorites: [], 
    history: [],
    reservations: []
  };
  users.push(newUser);
  await writeJSON(USERS_FILE, users);

  res.json({ user: { id: newUser.id, username }, token: uuid() });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = await readJSON(USERS_FILE, []);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ user: { id: user.id, username: user.username }, token: uuid() });
});

// ================== FAVORITES ==================
app.get("/users/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  const users = await readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.favorites);
});

app.post("/users/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  const { stationId } = req.body;
  const users = await readJSON(USERS_FILE, []);
  const stations = await readJSON(STATIONS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!stations.some(s => Number(s.id) === Number(stationId)))
    return res.status(404).json({ message: "Station not found" });

  if (!user.favorites.includes(stationId)) user.favorites.push(stationId);
  await writeJSON(USERS_FILE, users);
  res.json(user.favorites);
});

app.delete("/users/:id/favorites/:stationId", async (req, res) => {
  const userId = req.params.id;
  const stationId = req.params.stationId;
  const users = await readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.favorites = user.favorites.filter(f => String(f) !== String(stationId));
  await writeJSON(USERS_FILE, users);
  res.json(user.favorites);
});

// ================== HISTORY ==================
app.get("/users/:id/history", async (req, res) => {
  const userId = req.params.id;
  const users = await readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.history);
});

// API kullanıldıkça history’ye ekleme (örnek: öneri motoru çağrıldığında)
async function addHistory(userId, stationName) {
  const users = await readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return;
  user.history.push(`${stationName} (${new Date().toLocaleTimeString()})`);
  await writeJSON(USERS_FILE, users);
}

// ================== RECOMMENDATION ==================
app.get("/recommend", async (req, res) => {
  const lat = toNumber(req.query.lat, null);
  const lng = toNumber(req.query.lng, null);
  let battery = toNumber(req.query.battery, 50);
  const preferred = req.query.preferred || "";
  const userId = req.query.userId;
  const rangeKm = toNumber(req.query.range_km, null);

  if (lat === null || lng === null)
    return res.status(400).json({ message: "lat and lng required" });

  const stations = await readJSON(STATIONS_FILE, []);
  const recommendations = [];

  const maxRange = rangeKm || 50; 
  const maxPrice = 20;     // normalize için varsayım (kWh başına max 20₺ kabul ettik)
  const maxQueue = 30;     // normalize için varsayım (30 dk üstünü 30 kabul et)

  for (const st of stations) {
    if (!st.is_active) continue;

    const d = distanceKm(lat, lng, Number(st.latitude), Number(st.longitude));
    const price = Number(st.price_per_kwh) || 8;
    const available = !!st.available;
    const queue = Number(st.queue_time) || 0;
    const hasPreferred = preferred
      ? Array.isArray(st.connections) && st.connections.some(c => c.type_name === preferred)
      : false;

    if (rangeKm !== null && d > rangeKm) continue;

    // normalize faktörler (0–1 arası)
    const distScore = Math.max(0, 1 - d / maxRange); 
    const priceScore = Math.max(0, 1 - price / maxPrice);
    const availScore = available ? 1 : 0;
    const queueScore = Math.max(0, 1 - queue / maxQueue);
    const plugScore = hasPreferred ? 1 : 0;

    // kritik durum kontrolü
    const critical = battery < 20 || (rangeKm !== null && rangeKm < 20);
    const wDist = critical ? 0.4 : 0.25;
    const wPrice = critical ? 0.1 : 0.25;
    const wAvail = critical ? 0.3 : 0.2;
    const wQueue = 0.15;
    const wPlug = 0.1;

    const score =
      wDist * distScore +
      wPrice * priceScore +
      wAvail * availScore +
      wQueue * queueScore +
      wPlug * plugScore;

    recommendations.push({ 
      ...st, 
      distance_km: Number(d.toFixed(2)), 
      score: Number(score.toFixed(4)) 
    });
  }

  // En iyi 3 istasyonu skora göre sırala
  recommendations.sort((a, b) => b.score - a.score);
  const topRecommendations = recommendations.slice(0, 3);

  if (userId && topRecommendations.length > 0) {
    await addHistory(userId, topRecommendations[0].name);
  }

  res.json(topRecommendations);
});


// ================== RESERVATIONS ==================
app.get("/users/:id/reservations", async (req, res) => {
  const userId = req.params.id;
  const users = await readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.reservations || []);
});

app.post("/users/:id/reservations", async (req, res) => {
  const userId = req.params.id;
  const { stationId, minutes = 30 } = req.body;
  const users = await readJSON(USERS_FILE, []);
  const stations = await readJSON(STATIONS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const stationIndex = stations.findIndex(s => Number(s.id) === Number(stationId));
  if (stationIndex === -1) return res.status(404).json({ message: "Station not found" });

  const st = stations[stationIndex];
  if (!st.is_active) return res.status(400).json({ message: "Station under maintenance" });
  if (!st.available) return res.status(400).json({ message: "Station not available" });

  const now = Date.now();
  const expiresAt = new Date(now + Math.max(10, Number(minutes)) * 60 * 1000).toISOString();
  const reservation = { id: uuid(), stationId, stationName: st.name, createdAt: new Date(now).toISOString(), expiresAt };
  user.reservations = user.reservations || [];
  user.reservations.push(reservation);

  // mutate station availability
  const current = Number(st.reserved_count) || 0;
  st.reserved_count = current + 1;
  st.available = st.reserved_count === 0 ? true : false;
  const q = Number(st.queue_time) || 0;
  st.queue_time = Math.max(q, Number(minutes));

  await writeJSON(USERS_FILE, users);
  await writeJSON(STATIONS_FILE, stations);
  res.status(201).json(reservation);
});

app.delete("/users/:id/reservations/:resId", async (req, res) => {
  const userId = req.params.id;
  const resId = req.params.resId;
  const users = await readJSON(USERS_FILE, []);
  const stations = await readJSON(STATIONS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const existing = (user.reservations || []).find(r => r.id === resId);
  user.reservations = (user.reservations || []).filter(r => r.id !== resId);

  if (existing) {
    const idx = stations.findIndex(s => Number(s.id) === Number(existing.stationId));
    if (idx !== -1) {
      const st = stations[idx];
      const current = Number(st.reserved_count) || 0;
      st.reserved_count = Math.max(0, current - 1);
      st.available = st.reserved_count === 0 ? true : false;
      if (st.reserved_count === 0) st.queue_time = 0;
    }
  }

  await writeJSON(USERS_FILE, users);
  await writeJSON(STATIONS_FILE, stations);
  res.json(user.reservations);
});

// ================== VEHICLES ==================
app.get("/vehicles", async (req, res) => {
	try {
		const vehicles = await readJSON(VEHICLE_FILE, []);
		res.json(vehicles);
	} catch (error) {
		res.status(500).json({ message: "Error reading vehicles" });
	}
});

// 🚗 Ulaşılabilir istasyonları hesapla
app.post("/reachable-stations", async (req, res) => {
	try {
		const { vehicleId, currentCharge, userLocation } = req.body;

		// ✅ Zorunlu alanlar kontrolü
		if (!vehicleId || currentCharge === undefined || !userLocation?.lat || !userLocation?.lng) {
			return res.status(400).json({ message: "vehicleId, currentCharge, and userLocation (lat,lng) are required" });
		}

		// ✅ Araç verisini oku
		const vehicles = await readJSON(VEHICLE_FILE, []);
		const vehicle = vehicles.find(v => v.id === vehicleId);
		if (!vehicle) {
			return res.status(404).json({ message: "Vehicle not found" });
		}

		// 🔋 Menzil hesapla
		const availableKwh = vehicle.battery_capacity_kwh * (currentCharge / 100);
		const rangeKm = (availableKwh / vehicle.consumption_kwh_per_100km) * 100;

		// ⛽ İstasyonları filtrele
		const stations = await readJSON(STATIONS_FILE, []);
		const reachableStations = stations
			.map(station => {
				const distance = distanceKm(
					userLocation.lat,
					userLocation.lng,
					station.latitude,
					station.longitude
				);
				return { ...station, distance: Math.round(distance * 100) / 100 }; // mesafeyi de ekle
			})
			.filter(station => station.distance <= rangeKm);

		// ✅ Yanıt döndür
		res.json({
			rangeKm: Math.round(rangeKm * 100) / 100,
			reachableStations,
			vehicle: {
				brand: vehicle.brand,
				model: vehicle.model,
				availableKwh: Math.round(availableKwh * 100) / 100
			}
		});
	} catch (error) {
		console.error("Error in /reachable-stations:", error);
		res.status(500).json({ message: "Error calculating reachable stations" });
	}
});


// ================== START ==================
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const PORT = process.env.PORT || 3000;

  // CORS ayarlarını production için güncelle
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://nextvolt.onrender.com', 'http://localhost:3000', 'http://10.0.2.2:3000'] 
      : ['http://localhost:3000', 'http://10.0.2.2:3000'],
    credentials: true
  }));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
