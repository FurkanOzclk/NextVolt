# NextVolt - Elektrikli Araç Şarj İstasyonu Uygulaması
---

## 📱 Proje Hakkında Genel Bilgi

**NextVolt**, elektrikli araç sahiplerinin şarj istasyonlarını kolayca bulmasını ve yönetmesini sağlayan akıllı bir mobil uygulamadır. Bu proje, modern teknolojiler kullanılarak geliştirilmiş ve kullanıcı dostu bir arayüze sahiptir.

### 🎯 Projenin Amacı
- Elektrikli araç sahiplerinin en yakın şarj istasyonlarını bulması
- Akıllı öneri sistemi ile en uygun istasyonu seçmesi
- İstasyon rezervasyonu yapabilmesi
- Favori istasyonları kaydetmesi
- Gerçek zamanlı istasyon durumlarını takip etmesi

---

## 🏗️ Proje Mimarisi (Genel Yapı)

NextVolt projesi **iki ana bölümden** oluşmaktadır:

### 1. **Frontend (Ön Yüz)** - Mobil Uygulama
- Kullanıcıların gördüğü ve etkileşimde bulunduğu kısım
- Telefon ve tablet cihazlarda çalışır
- Modern ve kullanıcı dostu arayüz

### 2. **Backend (Arka Yüz)** - Sunucu
- Verilerin saklandığı ve işlendiği kısım
- Mobil uygulamanın ihtiyaç duyduğu bilgileri sağlar
- Akıllı öneri algoritmaları burada çalışır

---

## 📱 Frontend (Mobil Uygulama) Detayları

### Kullanılan Ana Teknolojiler:

#### **React Native**
- **Ne işe yarar?** Mobil uygulama geliştirmek için kullanılan bir teknoloji
- **Neden seçildi?** Hem iPhone hem de Android cihazlarda çalışabilir
- **Alternatifleri:** Flutter, Xamarin, Native iOS/Android
- **Avantajları:** Tek kod yazıp iki platformda çalıştırabilme

#### **Expo**
- **Ne işe yarar?** React Native uygulamalarını kolayca geliştirmek ve test etmek için
- **Neden seçildi?** Geliştirme sürecini hızlandırır, test etmeyi kolaylaştırır
- **Alternatifleri:** React Native CLI
- **Avantajları:** Hızlı prototipleme, kolay test

### Uygulama Bileşenleri:

#### **1. Ana Sayfa (HomeScreen)**
- **Özellikler:**
  - Harita görünümü ile istasyonları gösterir
  - Liste görünümü ile detaylı bilgiler
  - İstatistik kartları (aktif istasyon sayısı, müsait istasyon sayısı, ortalama fiyat)
  - Pasta grafiği ile bağlantı türü dağılımı
  - Konum bazlı arama

- **Kullanılan Kütüphaneler:**
  - **Google Maps API:** Harita görünümü için
  - **React Native WebView:** Google Maps'i uygulama içinde göstermek için
  - **React Native Chart Kit:** Pasta grafiği için
  - **Expo Location:** Kullanıcı konumu almak için
  - **React Native Dimensions:** Ekran boyutunu algılamak için
  - **Expo Linear Gradient:** Gradient arka plan için
  - **React Native Safe Area Context:** Güvenli alan yönetimi için

#### **2. Akıllı Öneri Sayfası (SmartRecommendScreen)**
- **Özellikler:**
  - Araç seçimi (20 farklı elektrikli araç modeli)
  - Batarya seviyesi girişi
  - Tercih edilen fiş türü seçimi
  - AI destekli öneri algoritması
  - Menzil hesaplama

- **Kullanılan Kütüphaneler:**
  - **React Native Paper Menu:** Araç seçimi için dropdown menü
  - **React Native Paper SegmentedButtons:** Araç/Manuel mod seçimi için
  - **React Native Paper Chip:** Fiş türü seçimi için
  - **Expo Location:** Konum almak için
  - **Axios:** Backend API çağrıları için
  - **React Native Dimensions:** Tablet/telefon algılama için

#### **3. İstasyon Detay Sayfası (StationDetailScreen)**
- **Özellikler:**
  - İstasyon bilgileri (adres, fiyat, durum)
  - Favorilere ekleme/çıkarma
  - Rezervasyon yapma (15, 30, 45 dakika seçenekleri)
  - Bağlantı türleri listesi

- **Kullanılan Kütüphaneler:**
  - **React Native Paper Card:** İstasyon bilgilerini göstermek için
  - **React Native Paper Chip:** Durum ve fiyat göstergeleri için
  - **React Native Paper List:** Bağlantı türleri listesi için
  - **React Native Paper Snackbar:** Bildirim mesajları için
  - **Axios:** Favori ekleme/çıkarma ve rezervasyon API çağrıları için

#### **4. Favoriler Sayfası (FavoritesScreen)**
- **Özellikler:**
  - Kaydedilen istasyonları listeler
  - Hızlı erişim sağlar

- **Kullanılan Kütüphaneler:**
  - **React Native FlatList:** Favori istasyonları listelemek için
  - **React Native Paper Card:** İstasyon kartları için
  - **Expo Linear Gradient:** Gradient başlık için
  - **Axios:** Favori verilerini çekmek için
  - **React Navigation useFocusEffect:** Sayfa odaklandığında veri yenileme için

#### **5. Rezervasyonlar Sayfası (ReservationsScreen)**
- **Özellikler:**
  - Aktif rezervasyonları gösterir
  - Rezervasyon iptal etme

- **Kullanılan Kütüphaneler:**
  - **React Native FlatList:** Rezervasyonları listelemek için
  - **React Native Paper List:** Rezervasyon detayları için
  - **Expo Linear Gradient:** Gradient başlık için
  - **Axios:** Rezervasyon API çağrıları için
  - **JavaScript Date:** Zaman hesaplamaları için

#### **6. Giriş/Kayıt Sayfası (AuthScreen)**
- **Özellikler:**
  - Kullanıcı kaydı
  - Giriş yapma
  - Güvenli kimlik doğrulama

- **Kullanılan Kütüphaneler:**
  - **React Native Paper TextInput:** Form girişleri için
  - **React Native Paper Button:** Giriş/kayıt butonları için
  - **Axios:** Kimlik doğrulama API çağrıları için
  - **React Context:** Kullanıcı durumu yönetimi için

### Kullanılan Diğer Teknolojiler:

#### **React Navigation**
- **Ne işe yarar?** Sayfalar arası geçişleri yönetir
- **Neden seçildi?** Kullanıcı dostu navigasyon sağlar
- **Kullanıldığı yerler:** Ana sayfa, favoriler, rezervasyonlar arası geçiş

#### **React Native Paper**
- **Ne işe yarar?** Hazır tasarım bileşenleri sağlar
- **Neden seçildi?** Modern ve tutarlı görünüm
- **Kullanıldığı bileşenler:** Card, Button, Text, Chip, ActivityIndicator, List

#### **Google Maps API**
- **Ne işe yarar?** Harita görünümü sağlar
- **Neden seçildi?** En yaygın kullanılan harita servisi
- **Kullanıldığı yerler:** Ana sayfa harita görünümü, istasyon konumları
- **API Key:** REMOVED_API_KEY

#### **Expo Location**
- **Ne işe yarar?** Kullanıcının konumunu alır
- **Neden seçildi?** GPS entegrasyonu için gerekli
- **Kullanıldığı yerler:** Konum bazlı arama, akıllı öneri sistemi

#### **React Native Chart Kit**
- **Ne işe yarar?** Grafik ve çizelgeler oluşturur
- **Neden seçildi?** Veri görselleştirme için
- **Kullanıldığı yerler:** Pasta grafiği (bağlantı türü dağılımı)

#### **Expo Linear Gradient**
- **Ne işe yarar?** Gradient (geçişli) renkler oluşturur
- **Neden seçildi?** Modern görsel tasarım için
- **Kullanıldığı yerler:** Sayfa başlıkları, arka plan tasarımı

#### **React Native WebView**
- **Ne işe yarar?** Web içeriğini uygulama içinde gösterir
- **Neden seçildi?** Google Maps'i uygulama içinde göstermek için
- **Kullanıldığı yerler:** Harita görünümü

#### **React Native Safe Area Context**
- **Ne işe yarar?** Güvenli alan yönetimi sağlar
- **Neden seçildi?** Farklı cihazlarda doğru görünüm için
- **Kullanıldığı yerler:** Tüm sayfalarda padding hesaplaması

#### **Axios**
- **Ne işe yarar?** HTTP istekleri gönderir
- **Neden seçildi?** Backend ile iletişim için
- **Kullanıldığı yerler:** API çağrıları, veri çekme

#### **React Native Vector Icons**
- **Ne işe yarar?** İkonlar sağlar
- **Neden seçildi?** Görsel arayüz için
- **Kullanıldığı yerler:** Butonlar, menüler, durum göstergeleri

#### **React Native Gesture Handler**
- **Ne işe yarar?** Dokunma hareketlerini yönetir
- **Neden seçildi?** Smooth animasyonlar için
- **Kullanıldığı yerler:** Sayfa geçişleri, buton etkileşimleri

#### **React Native Reanimated**
- **Ne işe yarar?** Gelişmiş animasyonlar sağlar
- **Neden seçildi?** Performanslı animasyonlar için
- **Kullanıldığı yerler:** UI animasyonları

#### **React Native Screens**
- **Ne işe yarar?** Native ekran yönetimi sağlar
- **Neden seçildi?** Daha iyi performans için
- **Kullanıldığı yerler:** Sayfa yönetimi

---

## 🖥️ Backend (Sunucu) Detayları

### Kullanılan Ana Teknolojiler:

#### **Node.js**
- **Ne işe yarar?** JavaScript ile sunucu programlama
- **Neden seçildi?** Frontend ile aynı dil kullanır, hızlı geliştirme
- **Alternatifleri:** Python (Django/Flask), Java (Spring), C# (.NET)

#### **Express.js**
- **Ne işe yarar?** Web sunucusu oluşturmak için framework
- **Neden seçildi?** Basit ve esnek yapı
- **Alternatifleri:** Fastify, Koa.js

### Backend Özellikleri:

#### **1. API Endpoints (Veri Noktaları)**
- **GET /stations** - Tüm istasyonları getirir
- **GET /stations/:id** - Belirli bir istasyonu getirir
- **PATCH /stations/:id** - İstasyon bilgilerini günceller
- **POST /login** - Kullanıcı girişi
- **POST /signup** - Kullanıcı kaydı
- **GET /recommend** - Akıllı öneri sistemi
- **GET /users/:id/favorites** - Kullanıcının favorilerini getirir
- **POST /users/:id/favorites** - Favori ekleme
- **DELETE /users/:id/favorites/:stationId** - Favori çıkarma
- **GET /users/:id/history** - Kullanıcı geçmişini getirir
- **GET /users/:id/reservations** - Kullanıcının rezervasyonlarını getirir
- **POST /users/:id/reservations** - Rezervasyon oluşturma
- **DELETE /users/:id/reservations/:resId** - Rezervasyon iptal etme
- **GET /vehicles** - Araç listesini getirir
- **POST /reachable-stations** - Ulaşılabilir istasyonları hesaplar
- **GET /health** - Sunucu sağlık kontrolü

#### **2. Akıllı Öneri Algoritması**
- **Mesafe faktörü:** Yakın istasyonlar öncelikli
- **Fiyat faktörü:** Ucuz istasyonlar tercih edilir
- **Müsaitlik faktörü:** Boş istasyonlar öncelikli
- **Sıra faktörü:** Kısa sıra bekleyen istasyonlar tercih edilir
- **Fiş uyumluluğu:** Araçla uyumlu fiş türü olan istasyonlar

#### **3. Veri Yönetimi**
- **JSON dosyaları:** Veriler JSON formatında saklanır
- **Dosya sistemi:** Veritabanı yerine dosya tabanlı sistem
- **Gerçek zamanlı güncelleme:** Rezervasyonlar anında güncellenir

### Kullanılan Diğer Teknolojiler:

#### **CORS (Cross-Origin Resource Sharing)**
- **Ne işe yarar?** Farklı domainlerden gelen isteklere izin verir
- **Neden gerekli?** Mobil uygulama ile sunucu farklı adreslerde
- **Kullanıldığı yerler:** Tüm API endpoint'lerinde güvenlik için

#### **UUID (Universally Unique Identifier)**
- **Ne işe yarar?** Benzersiz kimlik numaraları oluşturur
- **Neden gerekli?** Her kullanıcı ve rezervasyon için eşsiz ID
- **Kullanıldığı yerler:** Kullanıcı kaydı, rezervasyon oluşturma

#### **Node.js File System (fs)**
- **Ne işe yarar?** Dosya okuma ve yazma işlemleri
- **Neden seçildi?** Veritabanı yerine JSON dosyaları kullanıldı
- **Kullanıldığı yerler:** Veri saklama ve okuma işlemleri

#### **Path Module**
- **Ne işe yarar?** Dosya yollarını yönetir
- **Neden gerekli?** JSON dosyalarının konumunu belirlemek için
- **Kullanıldığı yerler:** Veri dosyalarına erişim

#### **Express Middleware**
- **Ne işe yarar?** İstekleri işlemeden önce kontrol eder
- **Neden gerekli?** Güvenlik ve veri doğrulama için
- **Kullanıldığı yerler:** JSON parsing, timeout kontrolü, CORS

#### **Mathematical Functions (Math)**
- **Ne işe yarar?** Matematiksel hesaplamalar
- **Neden gerekli?** Mesafe hesaplama ve skorlama algoritması
- **Kullanıldığı yerler:** Haversine formülü, normalizasyon

---

## 📊 Veri Yapısı

### 1. **İstasyon Verileri (station.json)**
```json
{
  "id": 1,
  "name": "Eşarj - Zorlu Center",
  "address": "Levazım Mah. Koru Sok. No:2",
  "latitude": 41.06521,
  "longitude": 29.01588,
  "price_per_kwh": 8.75,
  "available": true,
  "connections": [
    {
      "type_name": "Type 2 (Socket Only)",
      "level": 2,
      "num_connectors": 10
    }
  ]
}
```

### 2. **Kullanıcı Verileri (users.json)**
```json
{
  "id": "uuid-string",
  "username": "furkan",
  "password": "1234",
  "favorites": [1, 3, 6],
  "reservations": []
}
```

### 3. **Araç Verileri (vehicle.json)**
```json
{
  "id": 1,
  "brand": "Togg",
  "model": "T10X V2",
  "battery_capacity_kwh": 88.5,
  "consumption_kwh_per_100km": 16.9
}
```

---

## 🚀 Projenin Öne Çıkan Özellikleri

### 1. **Akıllı Öneri Sistemi**
- Kullanıcının konumu, batarya seviyesi ve tercihlerine göre en uygun istasyonu önerir
- 5 farklı faktörü değerlendirerek skor hesaplar
- Kritik durumlarda (düşük batarya) farklı ağırlıklar uygular

### 2. **Gerçek Zamanlı Veri**
- İstasyon durumları anlık güncellenir
- Rezervasyonlar hemen etkili olur
- Sıra bekleme süreleri güncel

### 3. **Çoklu Platform Desteği**
- iOS ve Android cihazlarda çalışır
- Tablet uyumlu tasarım
- Responsive (uyarlanabilir) arayüz

### 4. **Kullanıcı Dostu Arayüz**
- Modern Material Design prensipleri
- Kolay navigasyon
- Görsel geri bildirimler

### 5. **Güvenli Kimlik Doğrulama**
- Kullanıcı kaydı ve girişi
- Token tabanlı güvenlik
- Kişisel veri koruması

---

## 🔧 Teknik Detaylar

### Frontend Geliştirme Süreci:
1. **React Native** ile mobil uygulama yapısı oluşturuldu
2. **Expo** ile geliştirme ortamı kuruldu
3. **Navigation** sistemi eklendi
4. **UI bileşenleri** tasarlandı
5. **API entegrasyonu** yapıldı
6. **Test** ve **optimizasyon** gerçekleştirildi

### Backend Geliştirme Süreci:
1. **Node.js** sunucu kuruldu
2. **Express.js** framework eklendi
3. **API endpoints** oluşturuldu
4. **Algoritma** geliştirildi
5. **Veri yapısı** tasarlandı
6. **Test** ve **optimizasyon** yapıldı

### Veri Akışı:
1. Kullanıcı uygulamayı açar
2. Konum izni verir
3. Uygulama backend'den istasyon verilerini çeker
4. Harita üzerinde gösterir
5. Kullanıcı arama yapar
6. Backend akıllı öneri hesaplar
7. Sonuçlar kullanıcıya gösterilir

---

## 📈 Projenin Gelecekteki Geliştirilebilecek Özellikleri

### 1. **Gelişmiş Özellikler**
- Push bildirimleri
- Offline mod desteği
- Çoklu dil desteği
- Sesli navigasyon

### 2. **Teknik İyileştirmeler**
- Veritabanı entegrasyonu (MongoDB/PostgreSQL)
- Mikroservis mimarisi
- Cloud deployment (AWS/Azure)
- API rate limiting

### 3. **Yeni Özellikler**
- Sosyal medya entegrasyonu
- Ödeme sistemi
- Kullanıcı yorumları
- İstasyon sahipleri için panel

---

## 🎓 Öğrenilen Teknolojiler ve Beceriler

### Frontend Geliştirme:
- **React Native:** Mobil uygulama geliştirme
- **JavaScript ES6+:** Modern JavaScript özellikleri
- **Component Architecture:** Bileşen tabanlı programlama
- **State Management:** Uygulama durumu yönetimi
- **API Integration:** Backend ile iletişim
- **UI/UX Design:** Kullanıcı arayüzü tasarımı

### Backend Geliştirme:
- **Node.js:** Sunucu tarafı programlama
- **Express.js:** Web framework kullanımı
- **RESTful API:** API tasarım prensipleri
- **Algorithm Design:** Akıllı öneri algoritması
- **Data Management:** Veri yönetimi
- **Error Handling:** Hata yönetimi

### Genel Beceriler:
- **Problem Solving:** Problem çözme becerileri
- **System Design:** Sistem tasarımı
- **Version Control:** Git kullanımı
- **Testing:** Test yazma ve uygulama
- **Documentation:** Dokümantasyon yazma

---

## 🔍 Teknik Terimler Sözlüğü

### **Frontend Terimleri:**
- **React Native:** Facebook tarafından geliştirilen, mobil uygulama yapmak için kullanılan JavaScript kütüphanesi
- **Component:** Uygulamanın yeniden kullanılabilir parçaları (buton, kart, liste gibi)
- **State:** Uygulamanın o anki durumu (kullanıcı giriş yapmış mı, hangi sayfa açık gibi)
- **Props:** Bileşenler arasında veri aktarımı için kullanılan parametreler
- **Navigation:** Uygulama içinde sayfalar arası geçiş sistemi
- **API:** Uygulamanın sunucudan veri alması için kullandığı arayüz

### **Backend Terimleri:**
- **Node.js:** JavaScript ile sunucu programlama yapmaya yarayan platform
- **Express.js:** Node.js için web uygulama framework'ü
- **Endpoint:** Sunucunun belirli bir işlem için hazırladığı adres (URL)
- **JSON:** Verileri saklamak ve aktarmak için kullanılan format
- **CORS:** Farklı web sitelerinin birbirleriyle iletişim kurmasına izin veren güvenlik mekanizması
- **Algorithm:** Bir problemi çözmek için adım adım yazılmış mantık

### **Genel Terimler:**
- **Frontend:** Kullanıcının gördüğü ve etkileşimde bulunduğu kısım
- **Backend:** Verilerin işlendiği ve saklandığı arka plan sistemi
- **Database:** Verilerin düzenli olarak saklandığı yer
- **API:** Farklı yazılımların birbirleriyle konuşmasını sağlayan arayüz
- **Framework:** Yazılım geliştirmeyi kolaylaştıran hazır araçlar
- **Library:** Belirli işlevleri yerine getiren hazır kod parçaları
- **Debugging:** Programdaki hataları bulma ve düzeltme işlemi
- **Deployment:** Uygulamayı canlı ortama çıkarma işlemi

### **Kütüphane ve API Terimleri:**
- **Google Maps API:** Google'ın harita servisi - konumları göstermek için
- **WebView:** Web sayfalarını uygulama içinde göstermek için kullanılan bileşen
- **Chart Kit:** Grafik ve çizelge oluşturmak için kullanılan kütüphane
- **Linear Gradient:** Renk geçişleri oluşturmak için kullanılan efekt
- **Safe Area:** Telefonun çentik ve alt çubuk alanlarını hesaplayan sistem
- **FlatList:** Büyük listeleri performanslı şekilde göstermek için kullanılan bileşen
- **Snackbar:** Kullanıcıya kısa mesaj göstermek için kullanılan popup
- **SegmentedButtons:** Birkaç seçenek arasından birini seçmek için kullanılan buton grubu
- **Menu:** Dropdown menü oluşturmak için kullanılan bileşen
- **Chip:** Küçük etiketler oluşturmak için kullanılan bileşen
- **Middleware:** İstekleri işlemeden önce kontrol eden ara yazılım
- **Haversine Formula:** İki nokta arasındaki mesafeyi hesaplayan matematik formülü

### **Mobil Uygulama Terimleri:**
- **Responsive Design:** Farklı ekran boyutlarına uyum sağlayan tasarım
- **Cross-Platform:** Birden fazla işletim sisteminde çalışan uygulama
- **Native:** Belirli bir platform için özel olarak geliştirilmiş uygulama
- **Hybrid:** Web teknolojileri kullanılarak geliştirilmiş mobil uygulama
- **Push Notification:** Uygulama kapalıyken gönderilen bildirimler

### **Veri Terimleri:**
- **JSON:** JavaScript Object Notation - Veri formatı
- **Database:** Veritabanı - Verilerin saklandığı sistem
- **Query:** Sorgu - Veritabanından veri çekme işlemi
- **CRUD:** Create, Read, Update, Delete - Veri işlemlerinin temel dört işlemi
- **Schema:** Veri yapısının planı veya şeması

---

## 🏆 Proje Başarıları

### **Teknik Başarılar:**
- ✅ Tam fonksiyonel mobil uygulama
- ✅ Akıllı öneri algoritması
- ✅ Gerçek zamanlı veri güncelleme
- ✅ Kullanıcı dostu arayüz
- ✅ Güvenli kimlik doğrulama
- ✅ 15+ farklı kütüphane entegrasyonu
- ✅ Google Maps API entegrasyonu
- ✅ Responsive tasarım (telefon/tablet uyumlu)
- ✅ Modern UI/UX bileşenleri kullanımı
- ✅ Performanslı liste ve harita görünümleri

### **Öğrenme Başarıları:**
- ✅ Modern teknolojileri öğrenme
- ✅ Problem çözme becerileri geliştirme
- ✅ Takım çalışması deneyimi
- ✅ Proje yönetimi becerileri
- ✅ Sunum ve iletişim becerileri

---

## 📝 Sonuç

NextVolt projesi, modern teknolojiler kullanılarak geliştirilmiş, kullanıcı dostu bir elektrikli araç şarj istasyonu uygulamasıdır. Proje, hem teknik hem de öğrenme açısından başarılı sonuçlar vermiştir. Gelecekte daha da geliştirilebilecek potansiyele sahiptir.

Bu proje sayesinde:
- Mobil uygulama geliştirme sürecini öğrendik
- Backend programlama becerilerimizi geliştirdik
- Problem çözme yeteneklerimizi artırdık
- Modern teknolojileri kullanma deneyimi kazandık
- Takım çalışması ve proje yönetimi becerilerimizi geliştirdik

NextVolt, elektrikli araç sahiplerinin hayatını kolaylaştıran, teknoloji ve kullanıcı deneyimini birleştiren başarılı bir projedir.

---

