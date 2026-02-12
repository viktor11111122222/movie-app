# MovieHub - React Native App 🎬

Tvoja movie app sada konvertovana u React Native za Google Play!

## 📱 Karakteristike

- ✅ Autentikacija (Login/Register)
- ✅ Pretraga filmova
- ✅ Wishlist (dodaj filmove u listu želja)
- ✅ Movie Details sa cast-om
- ✅ Profile management
- ✅ Trending, Popular, Top Rated filmovi
- ✅ TMDB API integracija
- ✅ Sve iste funkcionalnosti kao web app

## 🚀 Instalacija i Pokretanje

### Preduslov:
- Node.js (v16+)
- React Native CLI
- Android Studio
- JDK 11

### Koraci:

1. **Instaliraj dependencije:**
```bash
cd MovieHubRN
npm install
```

2. **Pokreni Metro bundler:**
```bash
npm start
```

3. **Pokreni Android app:**
```bash
npm run android
```

## ⚙️ Konfiguracija

### Backend Server URL

**VAŽNO:** Otvori `src/services/api.js` i promeni `API_BASE_URL`:

```javascript
// Za development (telefon na istoj mreži):
const API_BASE_URL = 'http://192.168.1.100:8080'; // STAVI SVOJU IP ADRESU

// Za production (deployed server):
const API_BASE_URL = 'https://tvoj-server.com';
```

### Kako naći svoju IP adresu:
- **macOS/Linux:** `ifconfig | grep inet`
- **Windows:** `ipconfig`

## 📦 Build za Google Play

### 1. Generiši Release Keystore:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Konfiguriši gradle.properties:

Otvori `android/gradle.properties` i zameni:

```
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=tvoja-lozinka
MYAPP_UPLOAD_KEY_PASSWORD=tvoja-lozinka
```

### 3. Build Release APK:

```bash
cd android
./gradlew assembleRelease
```

APK će biti u: `android/app/build/outputs/apk/release/app-release.apk`

### 4. Build AAB za Google Play:

```bash
cd android
./gradlew bundleRelease
```

AAB će biti u: `android/app/build/outputs/bundle/release/app-release.aab`

## 🎨 Izgled

Aplikacija ima isti dizajn kao web verzija:
- Tamna tema
- Crvene akcente (#E50914)
- Hero sekcija
- Movie cards sa posterima
- Smooth navigacija

## 📱 Ekrani

1. **Login/Register** - Autentikacija
2. **Home** - Trending, Popular, Top Rated
3. **Search** - Pretraga filmova
4. **Wishlist** - Lista sačuvanih filmova
5. **Profile** - Korisničke informacije
6. **Movie Details** - Detalji o filmu

## 🔧 Potrebne Izmene Pre Publishovanja

1. **Promeni package name** u `android/app/build.gradle`:
   - Promeni `com.moviehubrn` u jedinstveno ime (npr. `com.tvojeime.moviehub`)

2. **Dodaj ikonu** aplikacije u `android/app/src/main/res/mipmap-*/`

3. **Promeni boje i branding** ako želiš

4. **Testiraj na raznim uređajima**

## 🌐 Server Requirements

Backend server mora biti dostupan sa interneta ili lokalne mreže:

- Pokreni postojeći Node.js server (`server.js`)
- Ili deploy-uj na Heroku, Railway, DigitalOcean, itd.

## 📝 Licenca

MIT

## 💡 Podrška

Za pitanja ili probleme, proveri:
- React Native dokumentaciju: https://reactnative.dev
- TMDB API docs: https://developers.themoviedb.org

---

**Napravljeno za Google Play! 🚀**
