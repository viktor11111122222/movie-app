# MovieHub React Native App 🎬

Kompletna aplikacija za otkrivanje filmova - konvertovana iz web verzije sa **SVIM funkcionalnostima** za Google Play Store.

## ✨ Sve funkcionalnosti sa web sajta

### 🎯 Osnovne funkcionalnosti
- ✅ **Autentifikacija** - Login i registracija sa backend integracijom
- ✅ **Pretraga filmova** - Real-time pretraga sa TMDB API
- ✅ **Wishlist** - Dodavanje/uklanjanje filmova u listu želja
- ✅ **Profil** - Upravljanje nalogom i podešavanjima

### 🚀 Napredne funkcionalnosti
- ✅ **Video trailer player** - YouTube trailers u aplikaciji
- ✅ **Star rating** - 10-zvezdičasti sistem ocenjivanja
- ✅ **Streaming providers** - Netflix, Disney+, Max, Prime, Hulu, Paramount+, Peacock, Apple TV+
- ✅ **Watched tracking** - Označavanje odgledanih filmova
- ✅ **Genre filtering** - Filtriranje po žanru
- ✅ **Recently viewed** - Istorija pregledanih
- ✅ **Share** - Native deljenje filmova
- ✅ **Pull-to-refresh** - Osvežavanje sadržaja
- ✅ **Region selection** - Odabir regiona za streaming servise

## 📱 Ekrani

1. **Login** - Prijava sa username/email + password
2. **Register** - Registracija sa region selection
3. **Home** - Hero + Trending + Popular + Top Rated + Upcoming + Genre Filter + Recently Viewed
4. **Search** - Real-time pretraga
5. **Movie Details** - Video trailer, rating, streaming, watched, wishlist, share, cast, similar
6. **Wishlist** - Sačuvani filmovi
7. **Profile** - Podešavanja, stats, change password

## 🛠️ Tech Stack

- React Native 0.84.0
- React Navigation (Stack + Bottom Tabs)
- AsyncStorage
- Axios
- TMDB API
- Fast Image
- Linear Gradient
- Vector Icons (Ionicons)
- WebView
- React Native Share

## 📦 Quick Start

```bash
# 1. Instaliraj zavisnosti
npm install --legacy-peer-deps

# 2. Konfiguriši backend URL u src/services/api.js
# Promeni: const API_BASE_URL = 'http://TVOJA_IP:8080';

# 3. Pokreni Metro
npm start

# 4. Run app
npm run android
# ili
npm run ios
```

## ⚙️ Konfiguracija

### Backend URL
Otvori [src/services/api.js](src/services/api.js#L6) i promeni:
```javascript
const API_BASE_URL = 'http://192.168.1.100:8080';
```

### Package Name (za Google Play)
1. [android/app/build.gradle](android/app/build.gradle) - `applicationId`
2. [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml)

## 📂 Struktura

```
src/
├── components/
│   ├── VideoPlayer.js          # YouTube trailer player
│   ├── StarRating.js           # 10-star rating
│   ├── StreamingProviders.js   # Netflix, Disney+, etc.
│   ├── GenreFilter.js          # Horizontal genre tabs
│   ├── WatchedBadge.js         # Watched indicator
│   ├── ShareButton.js          # Native share
│   ├── MovieCard.js            # Movie card component
│   ├── MovieRow.js             # Horizontal movie row
│   ├── HeroSection.js          # Hero banner
│   └── RecentlyViewed.js       # History section
├── context/
│   ├── AuthContext.js          # Auth state management
│   └── WishlistContext.js      # Wishlist state
├── navigation/
│   └── AppNavigator.js         # Stack + Tab navigation
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js
│   ├── SearchScreen.js
│   ├── MovieDetailsScreen.js
│   ├── WishlistScreen.js
│   └── ProfileScreen.js
├── services/
│   ├── api.js                  # Backend API client
│   └── tmdb.js                 # TMDB API client
└── utils/
    ├── theme.js                # Colors, fonts, spacing
    └── helpers.js              # Utility functions
```

## 🔌 Backend API Endpoints

Backend mora podržavati:

```
Auth:
POST   /api/login
POST   /api/register
POST   /api/logout
GET    /api/user

Wishlist:
GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist/:id

Ratings:
POST   /api/ratings
GET    /api/ratings/:movieId
DELETE /api/ratings/:movieId

Watched:
POST   /api/watched
DELETE /api/watched/:movieId
GET    /api/watched/:movieId
GET    /api/watched

History:
POST   /api/history
GET    /api/history
DELETE /api/history
```

## 🐛 Troubleshooting

**Module not found:**
```bash
npm install --legacy-peer-deps
npx react-native start --reset-cache
```

**Android build fails:**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**Cannot connect to backend:**
- Proveri server status
- Proveri IP u `src/services/api.js`
- Proveri da su telefon i PC na istoj mreži

## 📱 Build za Google Play

```bash
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

## ✅ Feature Parity sa Web verzijom

| Feature | Web | App |
|---------|-----|-----|
| Auth (Login/Register) | ✅ | ✅ |
| Movie Browse (Home) | ✅ | ✅ |
| Search | ✅ | ✅ |
| Wishlist | ✅ | ✅ |
| Video Trailers | ✅ | ✅ |
| Star Ratings | ✅ | ✅ |
| Streaming Providers | ✅ | ✅ |
| Watched Tracking | ✅ | ✅ |
| Genre Filtering | ✅ | ✅ |
| Recently Viewed | ✅ | ✅ |
| Share | ✅ | ✅ |
| Pull-to-Refresh | ✅ | ✅ |
| Profile | ✅ | ✅ |
| Region Selection | ✅ | ✅ |

## 📄 Licenca

TMDB API - https://www.themoviedb.org/
